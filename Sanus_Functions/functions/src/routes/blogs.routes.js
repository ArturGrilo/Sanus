const express = require("express");
const { FieldValue } = require("firebase-admin/firestore");

const { getDb } = require("../config/firebase");

const blogsRouter = express.Router();

// ============================================================
// GET /blogs (todos com tags resolvidas)
// ============================================================
blogsRouter.get("/blogs", async (req, res) => {
  try {
    const db = getDb();

    const blogSnap = await db.collection("blog").orderBy("createdAt", "desc").get();
    const blogs = blogSnap.docs.map((doc) => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : null,
        updatedAt: data.updatedAt && data.updatedAt.toDate ? data.updatedAt.toDate() : null,
        ...data,
      };
    });

    const tagsSnap = await db.collection("tags").get();
    const allTags = tagsSnap.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });

    const blogsWithTags = blogs.map((article) => {
      const fullTags = (article.tags || [])
        .map((tagId) => allTags.find((t) => t.id === tagId))
        .filter(Boolean);

      return { ...article, tags: fullTags };
    });

    return res.json(blogsWithTags);
  } catch (err) {
    console.error("Erro ao carregar blogs:", err);
    return res.status(500).send("Erro ao carregar blogs");
  }
});

// ============================================================
// GET /blogs/:id
// ============================================================
blogsRouter.get("/blogs/:id", async (req, res) => {
  try {
    const db = getDb();

    const docRef = db.collection("blog").doc(req.params.id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).send("Artigo não encontrado");
    }

    const data = snap.data() || {};

    const tagsSnap = await db.collection("tags").get();
    const allTags = tagsSnap.docs.map((d) => {
      return { id: d.id, ...d.data() };
    });

    const fullTags = (data.tags || [])
      .map((tagId) => allTags.find((t) => t.id === tagId))
      .filter(Boolean);

    return res.json({
      id: snap.id,
      ...data,
      tags: fullTags,
      createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt && data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt,
    });
  } catch (err) {
    console.error("Erro ao carregar artigo:", err);
    return res.status(500).send("Erro ao carregar artigo");
  }
});

// ============================================================
// GET /tags
// ============================================================
blogsRouter.get("/tags", async (req, res) => {
  try {
    const db = getDb();

    const tagsSnap = await db.collection("tags").get();
    const tags = tagsSnap.docs.map((d) => {
      return { id: d.id, ...d.data() };
    });

    return res.json(tags);
  } catch (err) {
    console.error("Erro ao carregar tags:", err);
    return res.status(500).send("Erro ao carregar tags");
  }
});

// ============================================================
// POST /blogs (criar artigo)
// ============================================================
blogsRouter.post("/blogs", async (req, res) => {
  try {
    const db = getDb();

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
      title: title,
      author: author,
      content: content,
      imageUrl: imageUrl || "",
      tags: tags,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error("🔥 Erro ao criar artigo:", err);
    return res.status(500).send("Erro ao criar artigo");
  }
});

// ============================================================
// PUT /blogs/:id (atualizar artigo)
// ============================================================
blogsRouter.put("/blogs/:id", async (req, res) => {
  try {
    const db = getDb();

    const body = req.body || {};
    const title = body.title;
    const author = body.author;
    const content = body.content;
    const imageUrl = body.imageUrl;
    const tags = Array.isArray(body.tags) ? body.tags : [];

    const docRef = db.collection("blog").doc(req.params.id);

    await docRef.set(
      {
        title: title,
        author: author,
        content: content,
        imageUrl: imageUrl || "",
        tags: tags,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("🔥 Erro ao atualizar artigo:", err);
    return res.status(500).send("Erro ao atualizar artigo");
  }
});

module.exports = { blogsRouter };