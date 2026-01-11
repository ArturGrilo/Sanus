// ============================================================
// Sanus Vitae - Cloud Functions API (versão simplificada e estável)
// ============================================================

// 🔹 1. Carregar variáveis do .env (antes de tudo)
require("dotenv").config();

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const {createClient} = require("@supabase/supabase-js");

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
app.use(express.json());

// ============================================================
// Helpers
// ============================================================
/**
 * Extrai o object path dentro do bucket do Supabase Storage a partir de um URL público.
 *
 * Ex:
 * https://xxx.supabase.co/storage/v1/object/public/blog-images/file.jpg
 * (bucket="blog-images") -> "file.jpg"
 *
 * Ex:
 * https://xxx.supabase.co/storage/v1/object/public/service-images/indications/abc/x.jpg
 * (bucket="service-images") -> "indications/abc/x.jpg"
 *
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
 * Garante apenas caracteres [a-z0-9] e fallback para jpg.
 *
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

// ============================================================
// 🚀 1. Upload Assinado - BLOG
// ============================================================
app.post("/storage/blog-upload-url", async (req, res) => {
  try {
    const {fileName, contentType, articleId} = req.body || {};
    if (!fileName || !contentType) {
      return res.status(400).send("fileName e contentType são obrigatórios");
    }

    const bucket = "blog-images";

    // 1️⃣ SE É EDIÇÃO → buscar URL antigo na Firestore
    let oldObjectPath = null;
    if (articleId) {
      const snap = await db.collection("blog").doc(articleId).get();
      if (snap.exists) {
        const oldUrl = snap.data().imageUrl;
        if (oldUrl) oldObjectPath = extractSupabaseObjectPath(oldUrl);
      }
    }

    // 2️⃣ Se existe ficheiro antigo → apagar
    if (oldObjectPath) {
      const {error: deleteErr} = await supabase.storage
          .from(bucket)
          .remove([oldObjectPath]);

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
    const {data, error} = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(objectName, 60);

    if (error) throw error;

    const {data: pub} = supabase.storage.from(bucket).getPublicUrl(objectName);

    return res.json({
      uploadUrl: data.signedUrl,
      publicUrl: pub.publicUrl,
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
    const {fileName, contentType, serviceId} = req.body || {};
    if (!fileName || !contentType) {
      return res.status(400).send("fileName e contentType são obrigatórios");
    }

    const bucket = "service-images";

    // 1️⃣ SE É EDIÇÃO → buscar URL antigo na Firestore (services)
    let oldObjectPath = null;
    if (serviceId) {
      const snap = await db.collection("services").doc(serviceId).get();
      if (snap.exists) {
        const oldUrl = snap.data().imageUrl || snap.data().image;
        if (oldUrl) oldObjectPath = extractSupabaseObjectPath(oldUrl);
      }
    }

    // 2️⃣ Se existe ficheiro antigo → apagar
    if (oldObjectPath) {
      const {error: deleteErr} = await supabase.storage
          .from(bucket)
          .remove([oldObjectPath]);

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
    const {data, error} = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(objectName, 60);

    if (error) throw error;

    const {data: pub} = supabase.storage.from(bucket).getPublicUrl(objectName);

    return res.json({
      uploadUrl: data.signedUrl,
      publicUrl: pub.publicUrl,
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
    const {fileName, contentType, serviceId, itemId} = req.body || {};

    if (!fileName || !contentType || !serviceId || !itemId) {
      return res
          .status(400)
          .send("fileName, contentType, serviceId e itemId são obrigatórios");
    }

    const bucket = "service-images";

    const ext = safeExtFromFilename(fileName);
    const safeServiceId = safeId(serviceId);
    const safeItemId = safeId(itemId);

    const objectName = `indications/${safeServiceId}/${safeItemId}-${crypto
        .randomUUID()
        .slice(0, 8)}.${ext}`;

    const {data, error} = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(objectName, 60);

    if (error) throw error;

    const {data: pub} = supabase.storage.from(bucket).getPublicUrl(objectName);

    return res.json({
      uploadUrl: data.signedUrl,
      publicUrl: pub.publicUrl,
    });
  } catch (err) {
    console.error("🔥 Erro em /storage/service-indication-upload-url:", err);
    return res.status(500).send("Erro ao gerar URL assinado");
  }
});

// ============================================================
// ✅ NOVO: Upload assinado - imagens das specialties por serviço
// ============================================================
app.post("/storage/service-specialty-upload-url", async (req, res) => {
  try {
    const {fileName, contentType, serviceId, itemId, previousUrl} = req.body || {};

    if (!fileName || !contentType || !serviceId || !itemId) {
      return res
          .status(400)
          .send("fileName, contentType, serviceId e itemId são obrigatórios");
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
      const {error: deleteErr} = await supabase.storage
          .from(bucket)
          .remove([oldObjectPath]);

      if (deleteErr) {
        console.warn("⚠ Não foi possível remover a imagem antiga (specialty):", deleteErr.message);
      } else {
        console.log("🗑 Ficheiro antigo removido (specialty):", oldObjectPath);
      }
    }

    // 3) criar path novo
    const objectName = `specialties/${safeServiceId}/${safeItemId}-${crypto
        .randomUUID()
        .slice(0, 8)}.${ext}`;

    // 4) gerar signed upload url
    const {data, error} = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(objectName, 60);

    if (error) throw error;

    const {data: pub} = supabase.storage.from(bucket).getPublicUrl(objectName);

    return res.json({
      uploadUrl: data.signedUrl,
      publicUrl: pub.publicUrl,
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
    const services = snapshot.docs.map((doc) => ({_id: doc.id, ...doc.data()}));
    return res.json(services);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Erro a buscar serviços");
  }
});

// ============================================================
// 🔹 Serviço por SLUG (URL pública)
// /services/fisioterapia
// ============================================================
app.get("/services/:slug", async (req, res) => {
  try {
    const slug = (req.params.slug || "").toLowerCase().trim();

    const qSnap = await db
        .collection("services")
        .where("slug", "==", slug)
        .limit(1)
        .get();

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

// ADMIN - criar serviço
app.post("/admin/services", async (req, res) => {
  try {
    const {
      title,
      subtitle = "",
      slug,
      text = "",
      // eslint-disable-next-line camelcase
      bigger_description = "",
      ctaText = "",
      image = "",
      imageUrl = "",
      indications = [],
      // eslint-disable-next-line camelcase
      treatment_steps = [],
      // eslint-disable-next-line camelcase
      treatment_types = [],
      specialties = [],
    } = req.body || {};

    if (!title || !slug) return res.status(400).send("title e slug são obrigatórios");

    const docRef = await db.collection("services").add({
      title,
      subtitle,
      slug,
      text,
      // eslint-disable-next-line camelcase
      bigger_description,
      ctaText,
      image: image || imageUrl || "",
      imageUrl: imageUrl || image || "",
      indications: Array.isArray(indications) ? indications : [],
      // eslint-disable-next-line camelcase
      treatment_steps: Array.isArray(treatment_steps) ? treatment_steps : [],
      // eslint-disable-next-line camelcase
      treatment_types: Array.isArray(treatment_types) ? treatment_types : [],
      specialties: Array.isArray(specialties) ? specialties : [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({id: docRef.id});
  } catch (err) {
    console.error("Erro admin create service:", err);
    return res.status(500).send("Erro ao criar serviço");
  }
});

// ADMIN - atualizar serviço por ID
app.put("/admin/services/:id", async (req, res) => {
  try {
    const {
      title,
      subtitle = "",
      slug,
      text = "",
      // eslint-disable-next-line camelcase
      bigger_description = "",
      ctaText = "",
      image = "",
      imageUrl = "",
      indications = [],
      // eslint-disable-next-line camelcase
      treatment_steps = [],
      // eslint-disable-next-line camelcase
      treatment_types = [],
      specialties = [],
    } = req.body || {};

    if (!title || !slug) return res.status(400).send("title e slug são obrigatórios");

    await db.collection("services").doc(req.params.id).set({
      title,
      subtitle,
      slug,
      text,
      // eslint-disable-next-line camelcase
      bigger_description,
      ctaText,
      image: image || imageUrl || "",
      imageUrl: imageUrl || image || "",
      indications: Array.isArray(indications) ? indications : [],
      // eslint-disable-next-line camelcase
      treatment_steps: Array.isArray(treatment_steps) ? treatment_steps : [],
      // eslint-disable-next-line camelcase
      treatment_types: Array.isArray(treatment_types) ? treatment_types : [],
      specialties: Array.isArray(specialties) ? specialties : [],
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
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
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
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
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
    const {title, author, content, imageUrl, tags = []} = req.body;
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
    const {title, author, content, imageUrl, tags = []} = req.body;
    const docRef = db.collection("blog").doc(req.params.id);

    await docRef.set(
        {
          title,
          author,
          content,
          imageUrl: imageUrl || "",
          tags,
          updatedAt: FieldValue.serverTimestamp(),
        },
        {merge: true},
    );

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

    return res.json({
      content: snap.data().content || "<p></p>",
      updatedAt: snap.data().updatedAt || null,
    });
  } catch (err) {
    console.error("Erro ao carregar política:", err);
    return res.status(500).send("Erro ao carregar política");
  }
});

app.put("/privacy", async (req, res) => {
  try {
    const {content} = req.body;
    if (!content) return res.status(400).send("Conteúdo vazio.");

    await db.collection("privacy_policy").doc("main").set(
        {content, updatedAt: FieldValue.serverTimestamp()},
        {merge: true},
    );

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

    return res.json({
      content: snap.data().content || "<p></p>",
      updatedAt: snap.data().updatedAt || null,
    });
  } catch (err) {
    console.error("Erro ao carregar política de cookies:", err);
    return res.status(500).send("Erro ao carregar política de cookies");
  }
});

app.put("/cookies", async (req, res) => {
  try {
    const {content} = req.body;
    if (!content) return res.status(400).send("Conteúdo vazio.");

    await db.collection("cookies_policy").doc("main").set(
        {content, updatedAt: FieldValue.serverTimestamp()},
        {merge: true},
    );

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

    return res.json({
      content: snap.data().content || "<p></p>",
      updatedAt: snap.data().updatedAt || null,
    });
  } catch (err) {
    console.error("Erro ao carregar termos de utilização:", err);
    return res.status(500).send("Erro ao carregar termos de utilização");
  }
});

app.put("/usage", async (req, res) => {
  try {
    const {content} = req.body;
    if (!content) return res.status(400).send("Conteúdo vazio.");

    await db.collection("usage_policy").doc("main").set(
        {content, updatedAt: FieldValue.serverTimestamp()},
        {merge: true},
    );

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
