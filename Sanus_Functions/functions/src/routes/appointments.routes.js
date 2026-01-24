/* eslint-disable max-len */
const express = require("express");
const {Resend} = require("resend");
const {verifyTurnstile} = require("../utils/turnstile");

const router = express.Router();

const BRAND_COLOR = "#2E5C6E";
const LOGO_URL = "https://sanus.pt/assets/SanusVitaeLogo-Q0HcUnro.png";
const SANUS_PUBLIC_EMAIL = "sanusvitae2021@gmail.com";

function escapeHtml(input) {
  return String(input || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

function getClientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "");
  if (forwarded) return forwarded.split(",")[0].trim();
  return String(req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : "");
}

function isEmulatorRequest(req) {
  const host = String(req.headers.host || "");
  const isLocalhost = host.includes("127.0.0.1") || host.includes("localhost");

  return (
    process.env.FUNCTIONS_EMULATOR === "true" ||
    String(process.env.FIREBASE_EMULATOR_HUB || "").length > 0 ||
    isLocalhost
  );
}

router.post("/appointment-request", async (req, res) => {
  try {
    const body = req.body || {};

    const name = String(body.name || "").trim();
    const contact = String(body.contact || "").trim();
    const service = String(body.service || "").trim();
    const message = String(body.message || "").trim();

    const consent = body.consent === true || String(body.consent || "") === "true";
    const turnstileToken = String(body.turnstileToken || "").trim();

    if (!name || !contact || !message || !consent) {
      return res.status(400).json({message: "Campos obrigatórios em falta."});
    }

    if (!turnstileToken) {
      return res.status(400).json({message: "Validação anti-bot em falta."});
    }

    const ip = getClientIp(req);
    const isEmulator = isEmulatorRequest(req);

    if (isEmulator && turnstileToken === "DEV_BYPASS") {
      // bypass em local/emulator
    } else {
      const turnRes = await verifyTurnstile(turnstileToken, ip);
      if (!turnRes || turnRes.success !== true) {
        return res.status(400).json({
          message: "Falha na validação Turnstile.",
          details: turnRes || null,
        });
      }
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.APPOINTMENT_TO_EMAIL || SANUS_PUBLIC_EMAIL;
    const bccEmail = process.env.APPOINTMENT_BCC_EMAIL || "";
    const fromEmail = process.env.APPOINTMENT_FROM_EMAIL || process.env.RECRUITMENT_FROM_EMAIL;

    if (!resendApiKey || !toEmail || !fromEmail) {
      return res.status(500).json({message: "Configuração de email em falta no servidor."});
    }

    const safeName = escapeHtml(name);
    const safeContact = escapeHtml(contact);
    const safeService = escapeHtml(service);
    const safeMessage = escapeHtml(message);

    const html = `
<!DOCTYPE html>
<html lang="pt-PT">
<head><meta charset="UTF-8" /><title>Pedido de agendamento — Sanus Vitae</title></head>
<body style="margin:0; padding:0; background:#f5f7f9; font-family:Arial, Helvetica, sans-serif; color:#1f2933;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f9; padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.06);">

        <tr>
          <td style="background:${BRAND_COLOR}; padding:18px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="left" style="vertical-align:middle;">
                  <img src="${LOGO_URL}" alt="Sanus Vitae" height="42" style="display:block; border:0; outline:none;" />
                </td>
                <td align="right" style="vertical-align:middle; color:#ffffff;">
                  <div style="font-size:14px; font-weight:bold; line-height:1.2;">Sanus Vitae</div>
                  <div style="font-size:12px; opacity:0.9; line-height:1.2;">Pedido de agendamento</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 24px;">
            <h2 style="margin:0 0 10px; font-size:20px;">Pedido de contacto para agendamento</h2>
            <p style="margin:0 0 18px; color:#4b5563; font-size:14px;">
              Recebeu um novo pedido através da página “Agendar”.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr><td style="padding:7px 0; width:190px;"><strong>Nome:</strong></td><td style="padding:7px 0;">${safeName}</td></tr>
              <tr><td style="padding:7px 0;"><strong>Contacto:</strong></td><td style="padding:7px 0;">${safeContact}</td></tr>
              <tr><td style="padding:7px 0;"><strong>Serviço (opcional):</strong></td><td style="padding:7px 0;">${safeService || "—"}</td></tr>
            </table>

            <hr style="border:none; border-top:1px solid #e5e7eb; margin:18px 0;" />

            <p style="margin:0 0 8px; font-size:14px;"><strong>Mensagem</strong></p>
            <div style="background:#f9fafb; border:1px solid #eef2f7; border-radius:10px; padding:14px; color:#374151; white-space:pre-line; font-size:14px;">
              ${safeMessage || "—"}
            </div>
          </td>
        </tr>

        <tr>
          <td style="background:#f9fafb; padding:18px 24px; font-size:12px; color:#6b7280;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="left" style="vertical-align:middle;">
                  <img src="${LOGO_URL}" alt="Sanus Vitae" height="34" style="display:block; border:0; outline:none;" />
                </td>
                <td align="right" style="vertical-align:middle; text-align:right;">
                  <div style="font-weight:bold; color:#111827;">Sanus Vitae</div>
                  <div>📧 <a href="mailto:${SANUS_PUBLIC_EMAIL}" style="color:${BRAND_COLOR}; text-decoration:none;">${SANUS_PUBLIC_EMAIL}</a></div>
                  <div>🌐 <a href="https://www.sanus.pt" style="color:${BRAND_COLOR}; text-decoration:none;">www.sanus.pt</a></div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>

      <p style="margin-top:14px; font-size:12px; color:#9ca3af;">
        Email automático gerado pela página “Agendar”.
      </p>
    </td></tr>
  </table>
</body>
</html>
    `;

    const resend = new Resend(resendApiKey);

    const sendResult = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      bcc: bccEmail ? [bccEmail] : undefined,
      subject: "Pedido de agendamento — " + name,
      replyTo: undefined, // aqui não tens email, tens "contact". podes manter undefined
      html: html,
    });

    console.log("📨 Resend appointment result:", JSON.stringify(sendResult));

    if (sendResult && sendResult.error) {
      console.error("❌ Resend error:", JSON.stringify(sendResult.error));
      return res.status(500).json({message: "Erro ao enviar email (Resend).", details: sendResult.error});
    }

    return res.json({ok: true});
  } catch (err) {
    console.error("🔥 Erro /appointment-request:", err);
    return res.status(500).json({message: "Erro interno ao enviar pedido."});
  }
});

module.exports = {appointmentsRouter: router};