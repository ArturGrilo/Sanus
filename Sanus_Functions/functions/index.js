// ============================================================
// Sanus Vitae - Cloud Functions API (versão simplificada e estável)
// ============================================================

// 🔹 1. Carregar variáveis do .env (antes de tudo)
require("dotenv").config();

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore"); // ✅ CORREÇÃO AQUI
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const {createClient} = require("@supabase/supabase-js");

// ============================================================
// Inicializações
// ============================================================
admin.initializeApp();
const db = admin.firestore();

// 🔹 Supabase
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
// 🚀 1. Rotas Utilitárias e Upload Assinado
// ============================================================

app.post("/storage/blog-upload-url", async (req, res) => {
  try {
    const {fileName, contentType, articleId} = req.body || {};
    if (!fileName || !contentType) {
      return res.status(400).send("fileName e contentType são obrigatórios");
    }

    const bucket = "blog-images";

    // ============================================================
    // 1️⃣ SE É EDIÇÃO → buscar URL antigo na Firestore
    // ============================================================
    let oldFilePath = null;

    if (articleId) {
      const snap = await db.collection("blog").doc(articleId).get();
      if (snap.exists) {
        const oldUrl = snap.data().imageUrl;
        if (oldUrl) {
          const urlObj = new URL(oldUrl);
          const pathname = urlObj.pathname;
          const prefix = "/storage/v1/object/public/";
          oldFilePath = pathname.replace(prefix, "");
        }
      }
    }


    // ============================================================
    // 2️⃣ Se existe ficheiro antigo → apagar
    // ============================================================
    if (oldFilePath) {
      const {error: deleteErr} = await supabase.storage.from(bucket).remove([oldFilePath]);

      if (deleteErr) {
        console.warn("⚠ Não foi possível remover a imagem antiga:", deleteErr.message);
      } else {
        console.log("🗑 Ficheiro antigo removido:", oldFilePath);
      }
    }

    // ============================================================
    // 3️⃣ Criar novo nome de ficheiro único
    // ============================================================
    const ext = fileName.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "");
    const safeId = articleId || crypto.randomUUID();
    const uniqueSuffix = crypto.randomUUID().slice(0, 8);

    const objectName = `article-${safeId}-${uniqueSuffix}.${ext}`;

    // ============================================================
    // 4️⃣ Gerar Signed Upload URL
    // ============================================================
    const {data, error} = await supabase.storage.from(bucket).createSignedUploadUrl(objectName, 60);

    if (error) throw error;

    const {data: pub} = supabase.storage.from(bucket).getPublicUrl(objectName);

    return res.json({
      uploadUrl: data.signedUrl,
      publicUrl: pub.publicUrl,
    });
  } catch (err) {
    console.error("🔥 Erro em /storage/blog-upload-url:", err);
    res.status(500).send("Erro ao gerar URL assinado");
  }
});

// ============================================================
// 🚀 2. Outras Rotas
// ============================================================

// --- Serviços ---
app.get("/services", async (req, res) => {
  try {
    const snapshot = await db.collection("services").orderBy("createdAt").get();
    const services = snapshot.docs.map((doc) => ({_id: doc.id, ...doc.data()}));
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro a buscar serviços");
  }
});

// --- Feedbacks ---
app.get("/feedbacks", async (req, res) => {
  try {
    const snapshot = await db.collection("feedback").orderBy("createdAt", "desc").get();
    const feedbacks = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    res.json(feedbacks);
  } catch (err) {
    console.error("Erro ao buscar feedbacks:", err);
    res.status(500).send("Erro ao buscar feedbacks");
  }
});

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
      const fullTags = (article.tags || []).map((tagId) => allTags.find((t) => t.id === tagId)).filter(Boolean);
      return {...article, tags: fullTags};
    });

    res.json(blogsWithTags);
  } catch (err) {
    console.error("Erro ao carregar blogs:", err);
    res.status(500).send("Erro ao carregar blogs");
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

    const fullTags = (data.tags || []).map((tagId) => allTags.find((t) => t.id === tagId)).filter(Boolean);

    res.json({
      id: snap.id,
      ...data,
      tags: fullTags,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
    });
  } catch (err) {
    console.error("Erro ao carregar artigo:", err);
    res.status(500).send("Erro ao carregar artigo");
  }
});

// --- Tags ---
app.get("/tags", async (req, res) => {
  try {
    const tagsSnap = await db.collection("tags").get();
    const tags = tagsSnap.docs.map((d) => ({id: d.id, ...d.data()}));
    res.json(tags);
  } catch (err) {
    console.error("Erro ao carregar tags:", err);
    res.status(500).send("Erro ao carregar tags");
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

    res.status(201).json({id: docRef.id});
  } catch (err) {
    console.error("🔥 Erro ao criar artigo:", err);
    res.status(500).send("Erro ao criar artigo");
  }
});

// --- Atualizar artigo ---
app.put("/blogs/:id", async (req, res) => {
  try {
    const {title, author, content, imageUrl, tags = []} = req.body;
    const docRef = db.collection("blog").doc(req.params.id);

    await docRef.set(
        {title, author, content, imageUrl: imageUrl || "", tags, updatedAt: FieldValue.serverTimestamp()}, {merge: true});

    res.json({success: true});
  } catch (err) {
    console.error("🔥 Erro ao atualizar artigo:", err);
    res.status(500).send("Erro ao atualizar artigo");
  }
});

app.get("/privacy", async (req, res) => {
  try {
    const snap = await db.collection("privacy_policy").doc("main").get();

    if (!snap.exists) {
      return res.json({content: "<p></p>"});
    }

    res.json({
      content: snap.data().content || "<p></p>",
      updatedAt: snap.data().updatedAt || null,
    });
  } catch (err) {
    console.error("Erro ao carregar política:", err);
    res.status(500).send("Erro ao carregar política");
  }
});

app.put("/privacy", async (req, res) => {
  try {
    const {content} = req.body;
    if (!content) return res.status(400).send("Conteúdo vazio.");

    await db.collection("privacy_policy").doc("main").set(
        {
          content,
          updatedAt: FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        },
    );

    res.json({success: true});
  } catch (err) {
    console.error("Erro ao guardar política:", err);
    res.status(500).send("Erro ao guardar política");
  }
});

// ============================================================
// 🚀 Cookies Policy
// ============================================================

// GET - devolver política de cookies
app.get("/cookies", async (req, res) => {
  try {
    const snap = await db.collection("cookies_policy").doc("main").get();

    if (!snap.exists) {
      return res.json({content: "<p></p>"});
    }

    res.json({
      content: snap.data().content || "<p></p>",
      updatedAt: snap.data().updatedAt || null,
    });
  } catch (err) {
    console.error("Erro ao carregar política de cookies:", err);
    res.status(500).send("Erro ao carregar política de cookies");
  }
});

// PUT - atualizar política de cookies
app.put("/cookies", async (req, res) => {
  try {
    const {content} = req.body;
    if (!content) return res.status(400).send("Conteúdo vazio.");

    await db.collection("cookies_policy").doc("main").set({
      content,
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true},
    );

    res.json({success: true});
  } catch (err) {
    console.error("Erro ao guardar política de cookies:", err);
    res.status(500).send("Erro ao guardar política de cookies");
  }
});

// ============================================================
// 🚀 Termos de utilização
// ============================================================

// GET - devolver termos de utilização
app.get("/usage", async (req, res) => {
  try {
    const snap = await db.collection("usage_policy").doc("main").get();

    if (!snap.exists) {
      return res.json({content: "<p></p>"});
    }

    res.json({
      content: snap.data().content || "<p></p>",
      updatedAt: snap.data().updatedAt || null,
    });
  } catch (err) {
    console.error("Erro ao carregar termos de utilização:", err);
    res.status(500).send("Erro ao carregar termos de utilização");
  }
});

// PUT - atualizar política de cookies
app.put("/usage", async (req, res) => {
  try {
    const {content} = req.body;
    if (!content) return res.status(400).send("Conteúdo vazio.");

    await db.collection("usage_policy").doc("main").set({
      content,
      updatedAt: FieldValue.serverTimestamp(),
    },
    {merge: true},
    );

    res.json({success: true});
  } catch (err) {
    console.error("Erro ao guardar termos de utilização:", err);
    res.status(500).send("Erro ao guardar termos de utilização");
  }
});


// ============================================================
// Export Firebase Function (sem multer, simples e estável)
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

