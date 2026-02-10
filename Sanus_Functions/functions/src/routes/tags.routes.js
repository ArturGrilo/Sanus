/* eslint-disable max-len */
const express = require("express");
const { FieldValue } = require("firebase-admin/firestore");
const { getDb } = require("../config/firebase");

const tagsRouter = express.Router();

function normalizeColor(input) {
  const c = String(input || "").trim();
  // aceita #RGB ou #RRGGBB
  if (/^#[0-9a-fA-F]{3}$/.test(c)) return c.toUpperCase();
  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c.toUpperCase();
  return "#4BCAAD";
}

// ============================================================
// PUBLIC
// GET /tags  -> usado no site e no BO (listagem e picker)
// ============================================================
tagsRouter.get("/tags", async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection("tags").orderBy("createdAt", "asc").get();
    const tags = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json(tags);
  } catch (err) {
    console.error("Erro ao carregar tags:", err);
    return res.status(500).send("Erro ao carregar tags");
  }
});

// ============================================================
// ADMIN (protegido por app.use("/admin", requireAuth))
// ============================================================

// GET /admin/tags  -> lista para BO
tagsRouter.get("/admin/tags", async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection("tags").orderBy("createdAt", "asc").get();
    const tags = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json({ tags });
  } catch (err) {
    console.error("Erro admin get tags:", err);
    return res.status(500).send("Erro ao carregar tags");
  }
});

// GET /admin/tags/:id -> carregar 1 tag
tagsRouter.get("/admin/tags/:id", async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection("tags").doc(req.params.id).get();
    if (!snap.exists) return res.status(404).send("Tag não encontrada");
    return res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error("Erro admin get tag:", err);
    return res.status(500).send("Erro ao carregar tag");
  }
});

// POST /admin/tags -> criar
tagsRouter.post("/admin/tags", async (req, res) => {
  try {
    const db = getDb();
    const body = req.body || {};

    const name = String(body.name || "").trim();
    const color = normalizeColor(body.color);

    if (!name) return res.status(400).send("name é obrigatório");

    const ref = await db.collection("tags").add({
      name: name,
      color: color,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ id: ref.id });
  } catch (err) {
    console.error("Erro admin create tag:", err);
    return res.status(500).send("Erro ao criar tag");
  }
});

// PUT /admin/tags/:id -> atualizar
tagsRouter.put("/admin/tags/:id", async (req, res) => {
  try {
    const db = getDb();
    const body = req.body || {};

    const name = String(body.name || "").trim();
    const color = normalizeColor(body.color);

    if (!name) return res.status(400).send("name é obrigatório");

    await db.collection("tags").doc(req.params.id).set(
      {
        name: name,
        color: color,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Erro admin update tag:", err);
    return res.status(500).send("Erro ao atualizar tag");
  }
});

// DELETE /admin/tags/:id -> apagar
tagsRouter.delete("/admin/tags/:id", async (req, res) => {
  try {
    const db = getDb();
    await db.collection("tags").doc(req.params.id).delete();
    return res.json({ ok: true });
  } catch (err) {
    console.error("Erro admin delete tag:", err);
    return res.status(500).send("Erro ao apagar tag");
  }
});

module.exports = { tagsRouter };