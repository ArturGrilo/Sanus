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
// 🚀 1. Rotas Utilitárias e Upload Assinado (sem multer)
// ============================================================

// --- Gerar URL assinado para upload de imagem ---
app.post("/storage/blog-upload-url", async (req, res) => {
  try {
    const {fileName, contentType, articleId} = req.body || {};
    if (!fileName || !contentType) {
      return res.status(400).send("fileName e contentType são obrigatórios");
    }

    const ext = (fileName.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const objectName = `article-${articleId || crypto.randomUUID()}.${ext}`;
    const bucket = "blog-images";

    const {data, error} = await supabase.storage.from(bucket).createSignedUploadUrl(objectName, 60); // válido 60s

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

// ============================================================
// Export Firebase Function (sem multer, simples e estável)
// ============================================================
exports.api = functions.https.onRequest(app);
