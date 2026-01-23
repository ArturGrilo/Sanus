const express = require("express");
const {Resend} = require("resend");

const {parseMultipart} = require("../utils/multipart");
const {verifyTurnstile, getClientIp, isEmulatorRequest} = require("../utils/turnstile");

const recruitmentRouter = express.Router();

recruitmentRouter.post("/recruitment", async (req, res, next) => {
  try {
    const parsed = await parseMultipart(req);
    const fields = parsed.fields || {};
    const file = parsed.file || null;

    const name = String(fields.name || "").trim();
    const email = String(fields.email || "").trim();
    const phone = String(fields.phone || "").trim();
    const role = String(fields.role || "").trim();
    const message = String(fields.message || "").trim();
    const consent = String(fields.consent || "") === "true";
    const turnstileToken = String(fields.turnstileToken || "").trim();

    if (!name || !email || !phone || !role || !consent) {
      return res.status(400).json({message: "Campos obrigatórios em falta."});
    }
    if (!turnstileToken) {
      return res.status(400).json({message: "Validação anti-bot em falta."});
    }

    const ip = getClientIp(req);
    const isEmulator = isEmulatorRequest(req);

    if (!(isEmulator && turnstileToken === "DEV_BYPASS")) {
      const turnRes = await verifyTurnstile(turnstileToken, ip);
      if (!turnRes || turnRes.success !== true) {
        return res.status(400).json({
          message: "Falha na validação Turnstile.",
          details: turnRes || null,
        });
      }
    }

    // PDF opcional
    const attachments = [];
    if (file) {
      const max = 5 * 1024 * 1024;
      if (file.size > max) {
        return res.status(400).json({message: "PDF demasiado grande (máx. 5MB)."});
      }
      if (file.mimeType !== "application/pdf") {
        return res.status(400).json({message: "O ficheiro deve ser PDF."});
      }

      attachments.push({
        filename: file.filename || "cv.pdf",
        content: file.buffer.toString("base64"),
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.RECRUITMENT_TO_EMAIL;
    const bccEmail = process.env.RECRUITMENT_BCC_EMAIL;
    const fromEmail = process.env.RECRUITMENT_FROM_EMAIL;

    if (!resendApiKey || !toEmail || !fromEmail) {
      return res.status(500).json({message: "Configuração de email em falta no servidor."});
    }

    const resend = new Resend(resendApiKey);

    const html = `
      <h2>Nova candidatura espontânea</h2>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Telemóvel:</strong> ${phone}</p>
      <p><strong>Função:</strong> ${role}</p>
      <p><strong>Mensagem:</strong><br/>${(message || "").replace(/\n/g, "<br/>")}</p>
      <hr/>
      <p><small>Consentimento: ${consent ? "Sim" : "Não"}</small></p>
    `;

    const sendResult = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      bcc: bccEmail ? [bccEmail] : [],
      subject: `Candidatura — ${name} (${role})`,
      replyTo: email,
      html,
      attachments,
    });

    console.log("📨 Resend result:", JSON.stringify(sendResult));

    if (sendResult && sendResult.error) {
      console.error("❌ Resend error:", JSON.stringify(sendResult.error));
      return res.status(500).json({message: "Erro ao enviar email (Resend).", details: sendResult.error});
    }

    return res.json({ok: true});
  } catch (err) {
    return next(err);
  }
});

module.exports = {recruitmentRouter};