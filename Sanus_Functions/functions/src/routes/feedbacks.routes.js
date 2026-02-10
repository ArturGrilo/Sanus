/* eslint-disable max-len */
const express = require("express");
const { FieldValue } = require("firebase-admin/firestore");
const { getDb } = require("../config/firebase");

const feedbacksRouter = express.Router();

// ============================================================
// PUBLIC
// ============================================================

// GET /feedbacks (público)
feedbacksRouter.get("/feedbacks", async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection("feedback").orderBy("createdAt", "desc").get();
    const feedbacks = snapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });
    return res.json(feedbacks);
  } catch (err) {
    console.error("Erro ao buscar feedbacks:", err);
    return res.status(500).send("Erro ao buscar feedbacks");
  }
});

// ============================================================
// ADMIN (PROTEGIDO por app.use("/admin", requireAuth))
// ============================================================

// GET /admin/feedbacks (lista no BO)
feedbacksRouter.get("/admin/feedbacks", async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection("feedback").orderBy("createdAt", "desc").get();
    const feedbacks = snapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });
    return res.json(feedbacks);
  } catch (err) {
    console.error("Erro admin ao buscar feedbacks:", err);
    return res.status(500).send("Erro ao buscar feedbacks");
  }
});

// GET /admin/feedbacks/:id (carregar para editar)
feedbacksRouter.get("/admin/feedbacks/:id", async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection("feedback").doc(req.params.id).get();

    if (!snap.exists) return res.status(404).send("Feedback não encontrado");

    return res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error("Erro admin get feedback:", err);
    return res.status(500).send("Erro ao carregar feedback");
  }
});

// POST /admin/feedbacks (criar)
feedbacksRouter.post("/admin/feedbacks", async (req, res) => {
  try {
    const db = getDb();
    const body = req.body || {};

    const name = String(body.name || "").trim();
    const commentInitial = String(body.comment_initial || "").trim();
    const commentOtherColor = String(body.comment_other_color || "").trim();
    const commentFinal = String(body.comment_final || "").trim();
    const source = String(body.source || "").trim();

    if (!name) return res.status(400).send("name é obrigatório");

    const ref = await db.collection("feedback").add({
      name: name,
      comment_initial: commentInitial,
      comment_other_color: commentOtherColor,
      comment_final: commentFinal,
      source: source,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ id: ref.id });
  } catch (err) {
    console.error("Erro admin create feedback:", err);
    return res.status(500).send("Erro ao criar feedback");
  }
});

// PUT /admin/feedbacks/:id (atualizar)
feedbacksRouter.put("/admin/feedbacks/:id", async (req, res) => {
  try {
    const db = getDb();
    const body = req.body || {};

    const name = String(body.name || "").trim();
    const commentInitial = String(body.comment_initial || "").trim();
    const commentOtherColor = String(body.comment_other_color || "").trim();
    const commentFinal = String(body.comment_final || "").trim();
    const source = String(body.source || "").trim();

    if (!name) return res.status(400).send("name é obrigatório");

    await db.collection("feedback").doc(req.params.id).set(
      {
        name: name,
        comment_initial: commentInitial,
        comment_other_color: commentOtherColor,
        comment_final: commentFinal,
        source: source,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Erro admin update feedback:", err);
    return res.status(500).send("Erro ao atualizar feedback");
  }
});

// DELETE /admin/feedbacks/:id (apagar)
feedbacksRouter.delete("/admin/feedbacks/:id", async (req, res) => {
  try {
    const db = getDb();
    await db.collection("feedback").doc(req.params.id).delete();
    return res.json({ ok: true });
  } catch (err) {
    console.error("Erro admin delete feedback:", err);
    return res.status(500).send("Erro ao apagar feedback");
  }
});

module.exports = { feedbacksRouter };