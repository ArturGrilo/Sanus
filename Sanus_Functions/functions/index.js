/* eslint-disable max-len */
/**
 * ============================================================
 * Sanus Vitae - Cloud Functions API (versão simplificada e estável)
 * ✅ Atualizado: services suporta specialties + benefits + faqs + cta_section
 * ✅ Recrutamento Seguro: Turnstile + Resend + PDF (multipart)
 * ✅ ESLint-friendly: sem destructuring snake_case sem alias
 * ============================================================
 */

// 🔹 1. Carregar variáveis do .env (antes de tudo)
require("dotenv").config();

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const {createClient} = require("@supabase/supabase-js");

// ✅ Recrutamento (multipart + email)
const busboy = require("busboy");
const {Resend} = require("resend");
const https = require("https");

// ============================================================
// Inicializações
// ============================================================
admin.initializeApp();
const db = admin.firestore();

// 🔹 Supabase (server-side only)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos no .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 🔹 Express + CORS
const app = express();
app.use(cors({origin: true}));

// Só JSON onde precisas:
app.use("/storage", express.json());
app.use("/admin", express.json());
app.use("/blogs", express.json());
app.use("/privacy", express.json());
app.use("/cookies", express.json());
app.use("/usage", express.json());

// ============================================================
// Helpers
// ============================================================

/**
 * Extrai o object path dentro do bucket do Supabase Storage a partir de um URL público.
 * @param {string} publicUrl
 * @return {string|null}
 */
function extractSupabaseObjectPath(publicUrl) {
  try {
    const urlObj = new URL(publicUrl);
    const pathname = urlObj.pathname; // /storage/v1/object/public/<bucket>/<file...>
    const prefix = "/storage/v1/object/public/";
    if (!pathname.startsWith(prefix)) return null;

    const full = pathname.replace(prefix, ""); // "<bucket>/<file...>"
    const parts = full.split("/");
    parts.shift(); // remove bucket
    return parts.join("/");
  } catch (e) {
    return null;
  }
}

/**
 * Extrai e sanitiza a extensão de um ficheiro.
 * @param {string} fileName
 * @return {string}
 */
function safeExtFromFilename(fileName) {
  const ext = (String(fileName).split(".").pop() || "jpg")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  return ext || "jpg";
}

/**
 * Sanitiza IDs para paths (sem caracteres estranhos).
 * @param {string} v
 * @return {string}
 */
function safeId(v) {
  return String(v || "").replace(/[^a-zA-Z0-9_-]/g, "");
}

/**
 * Tenta encontrar a imagem antiga de uma specialty pelo itemId dentro do doc de services.
 * @param {string} serviceId
 * @param {string} itemId
 * @return {Promise<string|null>}
 */
async function findOldSpecialtyImageUrl(serviceId, itemId) {
  try {
    const snap = await db.collection("services").doc(serviceId).get();
    if (!snap.exists) return null;

    const data = snap.data() || {};
    const arr = Array.isArray(data.specialties) ? data.specialties : [];
    const found = arr.find((x) => x && String(x.id || "") === String(itemId));
    if (!found) return null;

    return found.image || found.imageUrl || null;
  } catch (e) {
    return null;
  }
}

/**
 * Normaliza FAQs: [{question, answer}]
 * @param {any} raw
 * @return {Array<{question: string, answer: string}>}
 */
function normalizeFaqs(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
      .filter(Boolean)
      .map((x) => ({
        question: String(x && x.question ? x.question : "").trim(),
        answer: String(x && x.answer ? x.answer : "").trim(),
      }))
      .filter((x) => x.question.length > 0 || x.answer.length > 0);
}

/**
 * Normaliza Benefits: [{title, bullets: string[]}]
 * @param {any} raw
 * @return {Array<{title: string, bullets: string[]}>}
 */
function normalizeBenefits(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
      .filter(Boolean)
      .map((b) => {
        const bulletsRaw = b && b.bullets ? b.bullets : null;
        const bullets = Array.isArray(bulletsRaw) ?
          bulletsRaw.map((t) => String(t || "").trim()).filter(Boolean) :
          [];
        return {
          title: String(b && b.title ? b.title : "").trim(),
          bullets,
        };
      })
      .filter((b) => b.title.length > 0 || b.bullets.length > 0);
}

/**
 * Normaliza CTA Section (object):
 * { btn_text, cta_text, ... } (mantemos compat com nomes)
 * @param {any} raw
 * @return {{btn_text: string, cta_text: string}}
 */
function normalizeCtaSection(raw) {
  const obj = raw && typeof raw === "object" ? raw : {};
  const btnText = String(obj.btn_text || obj.btnText || "").trim();
  const ctaText = String(obj.cta_text || obj.ctaText || "").trim();
  return {
    btn_text: btnText,
    cta_text: ctaText,
  };
}

/**
 * Parse multipart/form-data (campos + 1 ficheiro opcional).
 * Usa req.rawBody quando disponível (Firebase Functions) para ser estável em emulators.
 * @param {Object} req Express request
 * @return {Promise<Object>} { fields, file }
 */
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = busboy({headers: req.headers});
    const fields = {};
    let file = null;

    let fileDone = true; // assume true se não houver ficheiro

    bb.on("field", (name, val) => {
      fields[name] = val;
    });

    bb.on("file", (name, stream, info) => {
      if (String(name) !== "file") {
        stream.resume();
        return;
      }

      fileDone = false;

      const filename = info?.filename || "";
      const mimeType = info?.mimeType || "";

      const chunks = [];
      let size = 0;

      stream.on("data", (d) => {
        size += d.length;
        chunks.push(d);
      });

      stream.on("limit", () => {
        // se definires limits no busboy, podes apanhar aqui
      });

      stream.on("end", () => {
        file = {
          filename,
          mimeType,
          size,
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
      // garante que não resolves antes do file terminar
      const wait = () => {
        if (fileDone) return resolve({fields, file});
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


/**
 * Verifica Cloudflare Turnstile server-side usando https (sem fetch).
 * @param {string} token
 * @param {string} ip
 * @return {Promise<any>}
 */
function verifyTurnstile(token, ip) {
  return new Promise((resolve, reject) => {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return reject(new Error("TURNSTILE_SECRET_KEY não definido"));
    }

    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);
    if (ip) params.append("remoteip", ip);

    const body = params.toString();

    const req = https.request({
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
          return resolve(json);
        } catch (e) {
          return reject(new Error("Resposta inválida do Turnstile"));
        }
      });
    });

    req.on("error", (e) => reject(e));
    req.write(body);
    req.end();
  });
}

// ============================================================
// ✅ RECRUTAMENTO SEGURO (Turnstile + Resend + PDF) — NOVO
// Endpoint: POST /recruitment
// ============================================================
app.post("/recruitment", async (req, res) => {
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

    const forwarded = String(req.headers["x-forwarded-for"] || "");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "";

    const host = String(req.headers.host || "");
    const isLocalhost = host.includes("127.0.0.1") || host.includes("localhost");

    const isEmulator =
      process.env.FUNCTIONS_EMULATOR === "true" ||
      String(process.env.FIREBASE_EMULATOR_HUB || "").length > 0 ||
      isLocalhost;

    if (isEmulator && turnstileToken === "DEV_BYPASS") {
      // ✅ bypass apenas em local/emulator
    } else {
      const turnRes = await verifyTurnstile(turnstileToken, ip);
      if (!turnRes || turnRes.success !== true) {
        return res.status(400).json({
          message: "Falha na validação Turnstile.",
          details: turnRes || null,
        });
      }
    }

    // Validar PDF (opcional)
    const attachments = [];
    if (file) {
      const max = 5 * 1024 * 1024; // 5MB
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

    // Resend config
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

    // ✅ IMPORTANT: o SDK do Resend retorna { data, error } e pode NÃO lançar exceção.
    const sendResult = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      bcc: [bccEmail],
      subject: `Candidatura — ${name} (${role})`,
      replyTo: email, // <- usa replyTo (camelCase)
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
    console.error("🔥 Erro /recruitment:", err);
    return res.status(500).json({message: "Erro interno ao enviar candidatura."});
  }
});

// ============================================================
// 🚀 1. Upload Assinado - BLOG
// ============================================================
app.post("/storage/blog-upload-url", async (req, res) => {
  try {
    const body = req.body || {};
    const fileName = body.fileName;
    const contentType = body.contentType;
    const articleId = body.articleId;

    if (!fileName || !contentType) {
      return res.status(400).send("fileName e contentType são obrigatórios");
    }

    const bucket = "blog-images";

    // 1️⃣ SE É EDIÇÃO → buscar URL antigo na Firestore
    let oldObjectPath = null;
    if (articleId) {
      const snap = await db.collection("blog").doc(articleId).get();
      if (snap.exists) {
        const oldUrl = snap.data() && snap.data().imageUrl ? snap.data().imageUrl : null;
        if (oldUrl) oldObjectPath = extractSupabaseObjectPath(oldUrl);
      }
    }

    // 2️⃣ Se existe ficheiro antigo → apagar
    if (oldObjectPath) {
      const del = await supabase.storage.from(bucket).remove([oldObjectPath]);
      const deleteErr = del && del.error ? del.error : null;

      if (deleteErr) {
        console.warn("⚠ Não foi possível remover a imagem antiga:", deleteErr.message);
      } else {
        console.log("🗑 Ficheiro antigo removido:", oldObjectPath);
      }
    }

    // 3️⃣ Criar novo nome de ficheiro único
    const ext = safeExtFromFilename(fileName);
    const safeDocId = articleId || crypto.randomUUID();
    const uniqueSuffix = crypto.randomUUID().slice(0, 8);
    const objectName = `article-${safeDocId}-${uniqueSuffix}.${ext}`;

    // 4️⃣ Gerar Signed Upload URL
    const signed = await supabase.storage.from(bucket).createSignedUploadUrl(objectName, 60);
    const data = signed && signed.data ? signed.data : null;
    const error = signed && signed.error ? signed.error : null;

    if (error) throw error;

    const pub = supabase.storage.from(bucket).getPublicUrl(objectName);
    const publicUrl = pub && pub.data && pub.data.publicUrl ? pub.data.publicUrl : "";

    return res.json({
      uploadUrl: data.signedUrl,
      publicUrl,
    });
  } catch (err) {
    console.error("🔥 Erro em /storage/blog-upload-url:", err);
    return res.status(500).send("Erro ao gerar URL assinado");
  }
});

// ============================================================
// 🚀 1B. Upload Assinado - SERVICES (imagem principal)
// ============================================================
app.post("/storage/service-upload-url", async (req, res) => {
  try {
    const body = req.body || {};
    const fileName = body.fileName;
    const contentType = body.contentType;
    const serviceId = body.serviceId;

    if (!fileName || !contentType) {
      return res.status(400).send("fileName e contentType são obrigatórios");
    }

    const bucket = "service-images";

    // 1️⃣ SE É EDIÇÃO → buscar URL antigo na Firestore (services)
    let oldObjectPath = null;
    if (serviceId) {
      const snap = await db.collection("services").doc(serviceId).get();
      if (snap.exists) {
        const snapData = snap.data() || {};
        const oldUrl = snapData.imageUrl || snapData.image || null;
        if (oldUrl) oldObjectPath = extractSupabaseObjectPath(oldUrl);
      }
    }

    // 2️⃣ Se existe ficheiro antigo → apagar
    if (oldObjectPath) {
      const del = await supabase.storage.from(bucket).remove([oldObjectPath]);
      const deleteErr = del && del.error ? del.error : null;

      if (deleteErr) {
        console.warn("⚠ Não foi possível remover a imagem antiga (service):", deleteErr.message);
      } else {
        console.log("🗑 Ficheiro antigo removido (service):", oldObjectPath);
      }
    }

    // 3️⃣ Criar nome único
    const ext = safeExtFromFilename(fileName);
    const safeDocId = serviceId || crypto.randomUUID();
    const uniqueSuffix = crypto.randomUUID().slice(0, 8);
    const objectName = `service-${safeDocId}-${uniqueSuffix}.${ext}`;

    // 4️⃣ Signed upload URL
    const signed = await supabase.storage.from(bucket).createSignedUploadUrl(objectName, 60);
    const data = signed && signed.data ? signed.data : null;
    const error = signed && signed.error ? signed.error : null;

    if (error) throw error;

    const pub = supabase.storage.from(bucket).getPublicUrl(objectName);
    const publicUrl = pub && pub.data && pub.data.publicUrl ? pub.data.publicUrl : "";

    return res.json({
      uploadUrl: data.signedUrl,
      publicUrl,
    });
  } catch (err) {
    console.error("🔥 Erro em /storage/service-upload-url:", err);
    return res.status(500).send("Erro ao gerar URL assinado");
  }
});

// ============================================================
// 🚀 Upload assinado - imagens das indications (cards) por serviço
// ============================================================
app.post("/storage/service-indication-upload-url", async (req, res) => {
  try {
    const body = req.body || {};
    const fileName = body.fileName;
    const contentType = body.contentType;
    const serviceId = body.serviceId;
    const itemId = body.itemId;

    if (!fileName || !contentType || !serviceId || !itemId) {
      return res.status(400).send("fileName, contentType, serviceId e itemId são obrigatórios");
    }

    const bucket = "service-images";

    const ext = safeExtFromFilename(fileName);
    const safeServiceId = safeId(serviceId);
    const safeItemId = safeId(itemId);

    const objectName = `indications/${safeServiceId}/${safeItemId}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    const signed = await supabase.storage.from(bucket).createSignedUploadUrl(objectName, 60);
    const data = signed && signed.data ? signed.data : null;
    const error = signed && signed.error ? signed.error : null;

    if (error) throw error;

    const pub = supabase.storage.from(bucket).getPublicUrl(objectName);
    const publicUrl = pub && pub.data && pub.data.publicUrl ? pub.data.publicUrl : "";

    return res.json({
      uploadUrl: data.signedUrl,
      publicUrl,
    });
  } catch (err) {
    console.error("🔥 Erro em /storage/service-indication-upload-url:", err);
    return res.status(500).send("Erro ao gerar URL assinado");
  }
});

// ============================================================
// ✅ Upload assinado - imagens das specialties por serviço
// ============================================================
app.post("/storage/service-specialty-upload-url", async (req, res) => {
  try {
    const body = req.body || {};
    const fileName = body.fileName;
    const contentType = body.contentType;
    const serviceId = body.serviceId;
    const itemId = body.itemId;
    const previousUrl = body.previousUrl;

    if (!fileName || !contentType || !serviceId || !itemId) {
      return res.status(400).send("fileName, contentType, serviceId e itemId são obrigatórios");
    }

    const bucket = "service-images";
    const ext = safeExtFromFilename(fileName);

    const safeServiceId = safeId(serviceId);
    const safeItemId = safeId(itemId);

    // 1) tentar descobrir imagem antiga
    let oldUrl = previousUrl || null;
    if (!oldUrl) {
      oldUrl = await findOldSpecialtyImageUrl(serviceId, itemId);
    }

    const oldObjectPath = oldUrl ? extractSupabaseObjectPath(oldUrl) : null;

    // 2) apagar antiga
    if (oldObjectPath) {
      const del = await supabase.storage.from(bucket).remove([oldObjectPath]);
      const deleteErr = del && del.error ? del.error : null;

      if (deleteErr) {
        console.warn("⚠ Não foi possível remover a imagem antiga (specialty):", deleteErr.message);
      } else {
        console.log("🗑 Ficheiro antigo removido (specialty):", oldObjectPath);
      }
    }

    // 3) criar path novo
    const objectName = `specialties/${safeServiceId}/${safeItemId}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    // 4) gerar signed upload url
    const signed = await supabase.storage.from(bucket).createSignedUploadUrl(objectName, 60);
    const data = signed && signed.data ? signed.data : null;
    const error = signed && signed.error ? signed.error : null;

    if (error) throw error;

    const pub = supabase.storage.from(bucket).getPublicUrl(objectName);
    const publicUrl = pub && pub.data && pub.data.publicUrl ? pub.data.publicUrl : "";

    return res.json({
      uploadUrl: data.signedUrl,
      publicUrl,
    });
  } catch (err) {
    console.error("🔥 Erro em /storage/service-specialty-upload-url:", err);
    return res.status(500).send("Erro ao gerar URL assinado");
  }
});

// ============================================================
// 🚀 2. Rotas - SERVICES ✅ (lista + público por slug + admin CRUD)
// ============================================================

// --- Serviços (lista) ---
app.get("/services", async (req, res) => {
  try {
    const snapshot = await db.collection("services").orderBy("createdAt").get();
    const services = snapshot.docs.map((doc) => ({_id: doc.id, ...doc.data()})); // compat com front
    return res.json(services);
  } catch (err) {
    console.error("Erro a buscar serviços:", err);
    return res.status(500).send("Erro a buscar serviços");
  }
});

// ============================================================
// 🔹 Serviço por SLUG (URL pública)
// /services/fisioterapia
// ============================================================
app.get("/services/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug || "").toLowerCase().trim();

    const qSnap = await db.collection("services").where("slug", "==", slug).limit(1).get();

    if (qSnap.empty) {
      return res.status(404).send("Serviço não encontrado");
    }

    const doc = qSnap.docs[0];
    return res.json({id: doc.id, ...doc.data()});
  } catch (err) {
    console.error("Erro ao carregar serviço por slug:", err);
    return res.status(500).send("Erro ao carregar serviço");
  }
});

// ADMIN - buscar por ID (docId)
app.get("/admin/services/:id", async (req, res) => {
  try {
    const snap = await db.collection("services").doc(req.params.id).get();
    if (!snap.exists) return res.status(404).send("Serviço não encontrado");
    return res.json({id: snap.id, ...snap.data()});
  } catch (err) {
    console.error("Erro admin get service:", err);
    return res.status(500).send("Erro ao carregar serviço");
  }
});

// ============================================================
// ADMIN - criar serviço
// ============================================================
app.post("/admin/services", async (req, res) => {
  try {
    const body = req.body || {};

    const title = String(body.title || "").trim();
    const subtitle = String(body.subtitle || "").trim();
    const slug = String(body.slug || "").trim();
    const text = String(body.text || "").trim();

    const biggerDescription = String(body.bigger_description || body.biggerDescription || "").trim();
    const ctaText = String(body.ctaText || "").trim();

    const image = String(body.image || body.imageUrl || "").trim();
    const imageUrl = String(body.imageUrl || body.image || "").trim();

    const indications = Array.isArray(body.indications) ? body.indications : [];

    const treatmentSteps = Array.isArray(body.treatment_steps) ?
      body.treatment_steps :
      (Array.isArray(body.treatmentSteps) ? body.treatmentSteps : []);

    const treatmentTypes = Array.isArray(body.treatment_types) ?
      body.treatment_types :
      (Array.isArray(body.treatmentTypes) ? body.treatmentTypes : []);

    const specialties = Array.isArray(body.specialties) ? body.specialties : [];

    const benefits = normalizeBenefits(body.benefits);
    const faqs = normalizeFaqs(body.faqs);
    const ctaSection = normalizeCtaSection(body.cta_section || body.ctaSection);

    if (!title || !slug) return res.status(400).send("title e slug são obrigatórios");

    const docRef = await db.collection("services").add({
      title,
      subtitle,
      slug,
      text,
      bigger_description: biggerDescription,
      ctaText,

      image,
      imageUrl,

      indications,
      treatment_steps: Array.isArray(treatmentSteps) ? treatmentSteps : [],
      treatment_types: Array.isArray(treatmentTypes) ? treatmentTypes : [],
      specialties,

      benefits,
      faqs,
      cta_section: ctaSection,

      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({id: docRef.id});
  } catch (err) {
    console.error("Erro admin create service:", err);
    return res.status(500).send("Erro ao criar serviço");
  }
});

// ============================================================
// ADMIN - atualizar serviço por ID
// ============================================================
app.put("/admin/services/:id", async (req, res) => {
  try {
    const body = req.body || {};

    const title = String(body.title || "").trim();
    const subtitle = String(body.subtitle || "").trim();
    const slug = String(body.slug || "").trim();
    const text = String(body.text || "").trim();

    const biggerDescription = String(body.bigger_description || body.biggerDescription || "").trim();
    const ctaText = String(body.ctaText || "").trim();

    const image = String(body.image || body.imageUrl || "").trim();
    const imageUrl = String(body.imageUrl || body.image || "").trim();

    const indications = Array.isArray(body.indications) ? body.indications : [];

    const treatmentSteps = Array.isArray(body.treatment_steps) ?
      body.treatment_steps :
      (Array.isArray(body.treatmentSteps) ? body.treatmentSteps : []);

    const treatmentTypes = Array.isArray(body.treatment_types) ?
      body.treatment_types :
      (Array.isArray(body.treatmentTypes) ? body.treatmentTypes : []);

    const specialties = Array.isArray(body.specialties) ? body.specialties : [];

    const benefits = normalizeBenefits(body.benefits);
    const faqs = normalizeFaqs(body.faqs);
    const ctaSection = normalizeCtaSection(body.cta_section || body.ctaSection);

    if (!title || !slug) return res.status(400).send("title e slug são obrigatórios");

    await db.collection("services").doc(req.params.id).set({
      title,
      subtitle,
      slug,
      text,
      bigger_description: biggerDescription,
      ctaText,

      image,
      imageUrl,

      indications,
      treatment_steps: Array.isArray(treatmentSteps) ? treatmentSteps : [],
      treatment_types: Array.isArray(treatmentTypes) ? treatmentTypes : [],
      specialties,

      benefits,
      faqs,
      cta_section: ctaSection,

      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});

    return res.json({success: true});
  } catch (err) {
    console.error("Erro admin update service:", err);
    return res.status(500).send("Erro ao atualizar serviço");
  }
});

// ============================================================
// 🚀 3. Rotas - FEEDBACKS
// ============================================================
app.get("/feedbacks", async (req, res) => {
  try {
    const snapshot = await db.collection("feedback").orderBy("createdAt", "desc").get();
    const feedbacks = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    return res.json(feedbacks);
  } catch (err) {
    console.error("Erro ao buscar feedbacks:", err);
    return res.status(500).send("Erro ao buscar feedbacks");
  }
});

// ============================================================
// 🚀 4. Rotas - BLOGS + TAGS
// ============================================================

// --- Blogs (todos) ---
app.get("/blogs", async (req, res) => {
  try {
    const blogSnap = await db.collection("blog").orderBy("createdAt", "desc").get();
    const blogs = blogSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data && data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : null,
        updatedAt: data && data.updatedAt && data.updatedAt.toDate ? data.updatedAt.toDate() : null,
      };
    });

    const tagsSnap = await db.collection("tags").get();
    const allTags = tagsSnap.docs.map((doc) => ({id: doc.id, ...doc.data()}));

    const blogsWithTags = blogs.map((article) => {
      const fullTags = (article.tags || [])
          .map((tagId) => allTags.find((t) => t.id === tagId))
          .filter(Boolean);
      return {...article, tags: fullTags};
    });

    return res.json(blogsWithTags);
  } catch (err) {
    console.error("Erro ao carregar blogs:", err);
    return res.status(500).send("Erro ao carregar blogs");
  }
});

// --- Blog por ID ---
app.get("/blogs/:id", async (req, res) => {
  try {
    const docRef = db.collection("blog").doc(req.params.id);
    const snap = await docRef.get();

    if (!snap.exists) return res.status(404).send("Artigo não encontrado");

    const data = snap.data();

    const tagsSnap = await db.collection("tags").get();
    const allTags = tagsSnap.docs.map((d) => ({id: d.id, ...d.data()}));

    const fullTags = (data.tags || [])
        .map((tagId) => allTags.find((t) => t.id === tagId))
        .filter(Boolean);

    return res.json({
      id: snap.id,
      ...data,
      tags: fullTags,
      createdAt: data && data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data && data.updatedAt && data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt,
    });
  } catch (err) {
    console.error("Erro ao carregar artigo:", err);
    return res.status(500).send("Erro ao carregar artigo");
  }
});

// --- Tags ---
app.get("/tags", async (req, res) => {
  try {
    const tagsSnap = await db.collection("tags").get();
    const tags = tagsSnap.docs.map((d) => ({id: d.id, ...d.data()}));
    return res.json(tags);
  } catch (err) {
    console.error("Erro ao carregar tags:", err);
    return res.status(500).send("Erro ao carregar tags");
  }
});

// --- Criar artigo ---
app.post("/blogs", async (req, res) => {
  try {
    const body = req.body || {};
    const title = body.title;
    const author = body.author;
    const content = body.content;
    const imageUrl = body.imageUrl;
    const tags = Array.isArray(body.tags) ? body.tags : [];

    if (!title || !author || !content) {
      return res.status(400).send("Campos obrigatórios em falta");
    }

    const docRef = await db.collection("blog").add({
      title,
      author,
      content,
      imageUrl: imageUrl || "",
      tags,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({id: docRef.id});
  } catch (err) {
    console.error("🔥 Erro ao criar artigo:", err);
    return res.status(500).send("Erro ao criar artigo");
  }
});

// --- Atualizar artigo ---
app.put("/blogs/:id", async (req, res) => {
  try {
    const body = req.body || {};
    const title = body.title;
    const author = body.author;
    const content = body.content;
    const imageUrl = body.imageUrl;
    const tags = Array.isArray(body.tags) ? body.tags : [];

    const docRef = db.collection("blog").doc(req.params.id);

    await docRef.set({
      title,
      author,
      content,
      imageUrl: imageUrl || "",
      tags,
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});

    return res.json({success: true});
  } catch (err) {
    console.error("🔥 Erro ao atualizar artigo:", err);
    return res.status(500).send("Erro ao atualizar artigo");
  }
});

// ============================================================
// 🚀 5. Policies (Privacy / Cookies / Usage)
// ============================================================
app.get("/privacy", async (req, res) => {
  try {
    const snap = await db.collection("privacy_policy").doc("main").get();
    if (!snap.exists) return res.json({content: "<p></p>"});

    const data = snap.data() || {};
    return res.json({
      content: data.content || "<p></p>",
      updatedAt: data.updatedAt || null,
    });
  } catch (err) {
    console.error("Erro ao carregar política:", err);
    return res.status(500).send("Erro ao carregar política");
  }
});

app.put("/privacy", async (req, res) => {
  try {
    const body = req.body || {};
    const content = body.content;

    if (!content) return res.status(400).send("Conteúdo vazio.");

    await db.collection("privacy_policy").doc("main").set({
      content,
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});

    return res.json({success: true});
  } catch (err) {
    console.error("Erro ao guardar política:", err);
    return res.status(500).send("Erro ao guardar política");
  }
});

// Cookies
app.get("/cookies", async (req, res) => {
  try {
    const snap = await db.collection("cookies_policy").doc("main").get();
    if (!snap.exists) return res.json({content: "<p></p>"});

    const data = snap.data() || {};
    return res.json({
      content: data.content || "<p></p>",
      updatedAt: data.updatedAt || null,
    });
  } catch (err) {
    console.error("Erro ao carregar política de cookies:", err);
    return res.status(500).send("Erro ao carregar política de cookies");
  }
});

app.put("/cookies", async (req, res) => {
  try {
    const body = req.body || {};
    const content = body.content;

    if (!content) return res.status(400).send("Conteúdo vazio.");

    await db.collection("cookies_policy").doc("main").set({
      content,
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});

    return res.json({success: true});
  } catch (err) {
    console.error("Erro ao guardar política de cookies:", err);
    return res.status(500).send("Erro ao guardar política de cookies");
  }
});

// Usage
app.get("/usage", async (req, res) => {
  try {
    const snap = await db.collection("usage_policy").doc("main").get();
    if (!snap.exists) return res.json({content: "<p></p>"});

    const data = snap.data() || {};
    return res.json({
      content: data.content || "<p></p>",
      updatedAt: data.updatedAt || null,
    });
  } catch (err) {
    console.error("Erro ao carregar termos de utilização:", err);
    return res.status(500).send("Erro ao carregar termos de utilização");
  }
});

app.put("/usage", async (req, res) => {
  try {
    const body = req.body || {};
    const content = body.content;

    if (!content) return res.status(400).send("Conteúdo vazio.");

    await db.collection("usage_policy").doc("main").set({
      content,
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});

    return res.json({success: true});
  } catch (err) {
    console.error("Erro ao guardar termos de utilização:", err);
    return res.status(500).send("Erro ao guardar termos de utilização");
  }
});

// ============================================================
// Export Firebase Function (simples e estável)
// ============================================================
exports.api = functions
    .region("europe-west1")
    .runWith({
      memory: "512MB",
      timeoutSeconds: 60,
      minInstances: 0,
    })
    .https
    .onRequest(app);
