/* eslint-disable max-len */
const express = require("express");
const {Resend} = require("resend");
const {verifyTurnstile} = require("../utils/turnstile");

const router = express.Router();

function normalizeSubject(subject) {
  const s = String(subject || "").trim();
  const map = {
    "marcacao": "Marcação de consulta",
    "duvida-tratamento": "Dúvida sobre tratamento",
    "relatorio-exame": "Envio de relatório / exame",
    "outro": "Outro pedido",
  };
  return map[s] || (s ? s : "—");
}

function normalizePreferredContact(value) {
  const v = String(value || "").trim();
  const map = {
    email: "Email",
    phone: "Telemóvel",
    whatsapp: "WhatsApp",
  };
  return map[v] || (v ? v : "—");
}

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

router.post("/contact-request", async (req, res) => {
  try {
    const body = req.body || {};

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const subject = String(body.subject || "").trim();
    const preferredContact = String(body.preferredContact || "").trim();
    const message = String(body.message || "").trim();

    const consent = body.consent === true || String(body.consent || "") === "true";
    const turnstileToken = String(body.turnstileToken || "").trim();

    if (!name || !email || !message || !consent) {
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

    // ✅ Emails Sanus (como pediste)
    const toEmail = process.env.RECRUITMENT_TO_EMAIL;
    const fromEmail = process.env.RECRUITMENT_FROM_EMAIL;
    const bccEmail = process.env.RECRUITMENT_BCC_EMAIL || "";

    if (!resendApiKey || !toEmail || !fromEmail) {
      return res.status(500).json({message: "Configuração de email em falta no servidor."});
    }

    const resend = new Resend(resendApiKey);

    const subjectLabel = normalizeSubject(subject);
    const preferredContactLabel = normalizePreferredContact(preferredContact);

    // ✅ Logo fixo (header e footer)
    const logoUrl = "https://sanus.pt/assets/SanusVitaeLogo-Q0HcUnro.png";

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeMessage = escapeHtml(message);
    const safeSubjectLabel = escapeHtml(subjectLabel);
    const safePreferred = escapeHtml(preferredContactLabel);

    // ✅ Header com cor #2E5C6E (teu --color-primary-dark)
    const headerColor = "#2E5C6E";

    // ✅ Email HTML premium (sem secção de consentimento)
    const html = `
<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8" />
  <title>Novo contacto — Sanus Vitae</title>
</head>
<body style="margin:0; padding:0; background:#f5f7f9; font-family:Arial, Helvetica, sans-serif; color:#1f2933;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f9; padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.06);">

          <!-- HEADER -->
          <tr>
            <td style="background:${headerColor}; padding:18px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <img src="${logoUrl}" alt="Sanus Vitae" height="42" style="display:block; border:0; outline:none;" />
                  </td>
                  <td align="right" style="vertical-align:middle; color:#ffffff;">
                    <div style="font-size:14px; font-weight:bold; line-height:1.2;">Sanus Vitae</div>
                    <div style="font-size:12px; opacity:0.9; line-height:1.2;">Formulário de contacto</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:28px 24px;">
              <h2 style="margin:0 0 10px; font-size:20px;">Novo contacto</h2>
              <p style="margin:0 0 18px; color:#4b5563; font-size:14px;">
                Recebeu um novo pedido de contacto através do site da Sanus Vitae.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                <tr>
                  <td style="padding:7px 0; width:190px;"><strong>Nome:</strong></td>
                  <td style="padding:7px 0;">${safeName}</td>
                </tr>

                <tr>
                  <td style="padding:7px 0;"><strong>Email:</strong></td>
                  <td style="padding:7px 0;">
                    <a href="mailto:${safeEmail}" style="color:${headerColor}; text-decoration:none;">${safeEmail}</a>
                  </td>
                </tr>

                <tr>
                  <td style="padding:7px 0;"><strong>Telemóvel:</strong></td>
                  <td style="padding:7px 0;">${safePhone || "—"}</td>
                </tr>

                <tr>
                  <td style="padding:7px 0;"><strong>Assunto:</strong></td>
                  <td style="padding:7px 0;">${safeSubjectLabel}</td>
                </tr>

                <tr>
                  <td style="padding:7px 0;"><strong>Preferência de contacto:</strong></td>
                  <td style="padding:7px 0;">${safePreferred}</td>
                </tr>
              </table>

              <hr style="border:none; border-top:1px solid #e5e7eb; margin:18px 0;" />

              <p style="margin:0 0 8px; font-size:14px;"><strong>Mensagem</strong></p>
              <div style="background:#f9fafb; border:1px solid #eef2f7; border-radius:10px; padding:14px; color:#374151; white-space:pre-line; font-size:14px;">
                ${safeMessage || "—"}
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f9fafb; padding:18px 24px; font-size:12px; color:#6b7280;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <img src="${logoUrl}" alt="Sanus Vitae" height="34" style="display:block; border:0; outline:none;" />
                  </td>
                  <td align="right" style="vertical-align:middle; text-align:right;">
                    <div style="font-weight:bold; color:#111827;">Sanus Vitae</div>
                    <div>📧 <a href="mailto:sanusvitae2021@gmail.com" style="color:${headerColor}; text-decoration:none;">sanusvitae2021@gmail.com</a></div>
                    <div>🌐 <a href="https://www.sanus.pt" style="color:${headerColor}; text-decoration:none;">www.sanus.pt</a></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <p style="margin-top:14px; font-size:12px; color:#9ca3af;">
          Email automático gerado pelo formulário de contacto do site.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailSubject = "Novo contacto — " + subjectLabel;

    const sendResult = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      bcc: bccEmail ? [bccEmail] : undefined,
      subject: emailSubject,
      replyTo: email,
      html: html,
    });

    console.log("📨 Resend contact result:", JSON.stringify(sendResult));

    if (sendResult && sendResult.error) {
      console.error("❌ Resend error:", JSON.stringify(sendResult.error));
      return res.status(500).json({message: "Erro ao enviar email (Resend).", details: sendResult.error});
    }

    return res.json({ok: true});
  } catch (err) {
    console.error("🔥 Erro /contact-request:", err);
    return res.status(500).json({message: "Erro interno ao enviar contacto."});
  }
});

module.exports = {contactRouter: router};