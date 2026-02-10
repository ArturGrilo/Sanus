/* eslint-disable max-len */
const express = require("express");
const { FieldValue } = require("firebase-admin/firestore");
const { getDb } = require("../config/firebase");

const blogsRouter = express.Router();

// ============================================================
// PUBLIC
// ============================================================

// GET /blogs (todos com tags resolvidas)
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
    const allTags = tagsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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

// GET /blogs/:id
blogsRouter.get("/blogs/:id", async (req, res) => {
  try {
    const db = getDb();

    const docRef = db.collection("blog").doc(req.params.id);
    const snap = await docRef.get();

    if (!snap.exists) return res.status(404).send("Artigo não encontrado");

    const data = snap.data() || {};

    const tagsSnap = await db.collection("tags").get();
    const allTags = tagsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

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

// GET /tags (público)
blogsRouter.get("/tags", async (req, res) => {
  try {
    const db = getDb();

    const tagsSnap = await db.collection("tags").get();
    const tags = tagsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return res.json(tags);
  } catch (err) {
    console.error("Erro ao carregar tags:", err);
    return res.status(500).send("Erro ao carregar tags");
  }
});

// ============================================================
// ADMIN (PROTEGIDO POR app.use("/admin", requireAuth))
// ============================================================

// GET /admin/blogs/:id  (usar no BO para editar sem depender do público)
blogsRouter.get("/admin/blogs/:id", async (req, res) => {
  try {
    const db = getDb();

    const docRef = db.collection("blog").doc(req.params.id);
    const snap = await docRef.get();

    if (!snap.exists) return res.status(404).send("Artigo não encontrado");

    const data = snap.data() || {};
    return res.json({
      id: snap.id,
      ...data,
      createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt && data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt,
    });
  } catch (err) {
    console.error("Erro admin ao carregar artigo:", err);
    return res.status(500).send("Erro ao carregar artigo");
  }
});

// POST /admin/blogs (criar)
blogsRouter.post("/admin/blogs", async (req, res) => {
  try {
    const db = getDb();

    const body = req.body || {};
    const title = String(body.title || "").trim();
    const author = String(body.author || "").trim();
    const content = String(body.content || "").trim();
    const imageUrl = String(body.imageUrl || "").trim();
    const tags = Array.isArray(body.tags) ? body.tags : [];

    if (!title || !author || !content) {
      return res.status(400).send("Campos obrigatórios em falta");
    }

    const docRef = await db.collection("blog").add({
      title,
      author,
      content,
      imageUrl,
      tags,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error("🔥 Erro admin ao criar artigo:", err);
    return res.status(500).send("Erro ao criar artigo");
  }
});

// PUT /admin/blogs/:id (atualizar)
blogsRouter.put("/admin/blogs/:id", async (req, res) => {
  try {
    const db = getDb();

    const body = req.body || {};
    const title = String(body.title || "").trim();
    const author = String(body.author || "").trim();
    const content = String(body.content || "").trim();
    const imageUrl = String(body.imageUrl || "").trim();
    const tags = Array.isArray(body.tags) ? body.tags : [];

    if (!title || !author || !content) {
      return res.status(400).send("Campos obrigatórios em falta");
    }

    const docRef = db.collection("blog").doc(req.params.id);

    await docRef.set(
      {
        title,
        author,
        content,
        imageUrl,
        tags,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("🔥 Erro admin ao atualizar artigo:", err);
    return res.status(500).send("Erro ao atualizar artigo");
  }
});

// DELETE /admin/blogs/:id (opcional mas recomendado)
blogsRouter.delete("/admin/blogs/:id", async (req, res) => {
  try {
    const db = getDb();
    await db.collection("blog").doc(req.params.id).delete();
    return res.json({ ok: true });
  } catch (err) {
    console.error("🔥 Erro admin ao apagar artigo:", err);
    return res.status(500).send("Erro ao apagar artigo");
  }
});

module.exports = { blogsRouter };