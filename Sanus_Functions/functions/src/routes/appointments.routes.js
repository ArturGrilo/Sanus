/* eslint-disable max-len */
const express = require("express");
const { Resend } = require("resend");

const { verifyTurnstile, getClientIp, isEmulatorRequest } = require("../utils/turnstile");

const appointmentsRouter = express.Router();

function looksLikeEmail(value) {
  const v = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

appointmentsRouter.post("/appointment-request", async (req, res) => {
  try {
    const body = req.body || {};

    const name = String(body.name || "").trim();
    const contact = String(body.contact || "").trim();
    const service = String(body.service || "").trim();
    const message = String(body.message || "").trim();

    const consent = String(body.consent || "") === "true" || body.consent === true;
    const turnstileToken = String(body.turnstileToken || "").trim();

    if (!name || !contact || !message || !consent) {
      return res.status(400).json({ message: "Campos obrigatórios em falta." });
    }

    if (!turnstileToken) {
      return res.status(400).json({ message: "Validação anti-bot em falta." });
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

    const resendApiKey = process.env.RESEND_API_KEY;

    // ✅ podes criar envs próprias para este formulário
    // fallback para as do recruitment para não te obrigares a duplicar config já funcional
    const toEmail = process.env.APPOINTMENT_TO_EMAIL || process.env.RECRUITMENT_TO_EMAIL;
    const fromEmail = process.env.APPOINTMENT_FROM_EMAIL || process.env.RECRUITMENT_FROM_EMAIL;
    const bccEmail = process.env.APPOINTMENT_BCC_EMAIL || process.env.RECRUITMENT_BCC_EMAIL;

    if (!resendApiKey || !toEmail || !fromEmail) {
      return res.status(500).json({ message: "Configuração de email em falta no servidor." });
    }

    const resend = new Resend(resendApiKey);

    const html = `
      <h2>Novo pedido de contacto (Agendar)</h2>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Contacto:</strong> ${contact}</p>
      <p><strong>Serviço (opcional):</strong> ${service || "-"}</p>
      <p><strong>Mensagem:</strong><br/>${(message || "").replace(/\n/g, "<br/>")}</p>
      <hr/>
      <p><small>Consentimento: ${consent ? "Sim" : "Não"}</small></p>
    `;

    const payload = {
      from: fromEmail,
      to: [toEmail],
      subject: "Pedido de contacto — " + name,
      html: html,
    };

    // replyTo só se o "contact" for email válido
    if (looksLikeEmail(contact)) {
      payload.replyTo = contact;
    }

    if (bccEmail) {
      payload.bcc = [bccEmail];
    }

    const sendResult = await resend.emails.send(payload);

    console.log("📨 Resend appointment result:", JSON.stringify(sendResult));

    if (sendResult && sendResult.error) {
      console.error("❌ Resend error:", JSON.stringify(sendResult.error));
      return res.status(500).json({
        message: "Erro ao enviar email (Resend).",
        details: sendResult.error,
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("🔥 Erro /appointment-request:", err);
    return res.status(500).json({ message: "Erro interno ao enviar pedido." });
  }
});

module.exports = { appointmentsRouter };