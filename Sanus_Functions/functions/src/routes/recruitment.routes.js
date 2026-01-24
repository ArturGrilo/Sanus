/* eslint-disable max-len */
const express = require("express");
const busboy = require("busboy");
const https = require("https");
const {Resend} = require("resend");

const router = express.Router();

const MAX_PDF_BYTES = 5 * 1024 * 1024;
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

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = busboy({headers: req.headers});
    const fields = {};
    let file = null;

    let fileDone = true;

    bb.on("field", (name, val) => {
      fields[name] = val;
    });

    bb.on("file", (name, stream, info) => {
      if (String(name) !== "file") {
        stream.resume();
        return;
      }

      fileDone = false;

      const filename = info && info.filename ? info.filename : "";
      const mimeType = info && info.mimeType ? info.mimeType : "";

      const chunks = [];
      let size = 0;

      stream.on("data", (d) => {
        size += d.length;
        chunks.push(d);
      });

      stream.on("end", () => {
        file = {
          filename: filename,
          mimeType: mimeType,
          size: size,
          buffer: Buffer.concat(chunks),
        };
        fileDone = true;
      });

      stream.on("error", (err) => {
        fileDone = true;
        reject(err);
      });
    });

    bb.on("finish", () => {
      const wait = () => {
        if (fileDone) return resolve({fields: fields, file: file});
        setTimeout(wait, 10);
      };
      wait();
    });

    bb.on("error", (err) => reject(err));

    if (req.rawBody && Buffer.isBuffer(req.rawBody)) {
      bb.end(req.rawBody);
      return;
    }

    req.pipe(bb);
  });
}

function verifyTurnstile(token, ip) {
  return new Promise((resolve, reject) => {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return reject(new Error("TURNSTILE_SECRET_KEY não definido"));

    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);
    if (ip) params.append("remoteip", ip);

    const body = params.toString();

    const r = https.request({
      method: "POST",
      hostname: "challenges.cloudflare.com",
      path: "/turnstile/v0/siteverify",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "content-length": Buffer.byteLength(body),
      },
    }, (resp) => {
      let data = "";
      resp.on("data", (chunk) => {
        data += String(chunk);
      });
      resp.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error("Resposta inválida do Turnstile"));
        }
      });
    });

    r.on("error", (e) => reject(e));
    r.write(body);
    r.end();
  });
}

router.post("/recruitment", async (req, res) => {
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

    if (isEmulator && turnstileToken === "DEV_BYPASS") {
      // bypass em emulator
    } else {
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
      if (file.size > MAX_PDF_BYTES) {
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
    const toEmail = process.env.RECRUITMENT_TO_EMAIL || SANUS_PUBLIC_EMAIL;
    const bccEmail = process.env.RECRUITMENT_BCC_EMAIL || "";
    const fromEmail = process.env.RECRUITMENT_FROM_EMAIL;

    if (!resendApiKey || !toEmail || !fromEmail) {
      return res.status(500).json({message: "Configuração de email em falta no servidor."});
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeRole = escapeHtml(role);
    const safeMessage = escapeHtml(message);

    const html = `
<!DOCTYPE html>
<html lang="pt-PT">
<head><meta charset="UTF-8" /><title>Nova candidatura — Sanus Vitae</title></head>
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
                  <div style="font-size:12px; opacity:0.9; line-height:1.2;">Candidatura espontânea</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 24px;">
            <h2 style="margin:0 0 10px; font-size:20px;">Nova candidatura</h2>
            <p style="margin:0 0 18px; color:#4b5563; font-size:14px;">
              Recebeu uma nova candidatura espontânea através do site.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr><td style="padding:7px 0; width:190px;"><strong>Nome:</strong></td><td style="padding:7px 0;">${safeName}</td></tr>
              <tr><td style="padding:7px 0;"><strong>Email:</strong></td><td style="padding:7px 0;"><a href="mailto:${safeEmail}" style="color:${BRAND_COLOR}; text-decoration:none;">${safeEmail}</a></td></tr>
              <tr><td style="padding:7px 0;"><strong>Telemóvel:</strong></td><td style="padding:7px 0;">${safePhone}</td></tr>
              <tr><td style="padding:7px 0;"><strong>Função:</strong></td><td style="padding:7px 0;">${safeRole}</td></tr>
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
        Email automático gerado pelo formulário de recrutamento do site.
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
      subject: "Nova candidatura — " + name + " (" + role + ")",
      replyTo: email,
      html: html,
      attachments: attachments,
    });

    console.log("📨 Resend recruitment result:", JSON.stringify(sendResult));

    if (sendResult && sendResult.error) {
      console.error("❌ Resend error:", JSON.stringify(sendResult.error));
      return res.status(500).json({message: "Erro ao enviar email (Resend).", details: sendResult.error});
    }

    return res.json({ok: true});
  } catch (err) {
    console.error("🔥 Erro /recruitment:", err);
    return res.status(500).json({message: "Erro interno ao enviar candidatura."});
  }
});

module.exports = {recruitmentRouter: router};