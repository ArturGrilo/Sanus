/* eslint-disable max-len */
const express = require("express");
const { FieldValue } = require("firebase-admin/firestore");
const { getDb } = require("../config/firebase");

const policiesRouter = express.Router();

function toPolicyResponse(snap) {
  if (!snap.exists) {
    return { content: "<p></p>", updatedAt: null };
  }

  const data = snap.data() || {};
  return {
    content: data.content || "<p></p>",
    updatedAt: data.updatedAt || null,
  };
}

function normalizeContent(body) {
  const raw = body && typeof body === "object" ? body.content : "";
  const content = String(raw || "").trim();
  return content;
}

// ============================================================
// PUBLIC (read-only)
// ============================================================

// GET /privacy
policiesRouter.get("/privacy", async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection("privacy_policy").doc("main").get();
    return res.json(toPolicyResponse(snap));
  } catch (err) {
    console.error("Erro ao carregar política:", err);
    return res.status(500).send("Erro ao carregar política");
  }
});

// GET /cookies
policiesRouter.get("/cookies", async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection("cookies_policy").doc("main").get();
    return res.json(toPolicyResponse(snap));
  } catch (err) {
    console.error("Erro ao carregar política de cookies:", err);
    return res.status(500).send("Erro ao carregar política de cookies");
  }
});

// GET /usage
policiesRouter.get("/usage", async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection("usage_policy").doc("main").get();
    return res.json(toPolicyResponse(snap));
  } catch (err) {
    console.error("Erro ao carregar termos de utilização:", err);
    return res.status(500).send("Erro ao carregar termos de utilização");
  }
});

// ============================================================
// ADMIN (write protected by app.use("/admin", requireAuth))
// ============================================================

// PUT /admin/privacy
policiesRouter.put("/admin/privacy", async (req, res) => {
  try {
    const db = getDb();
    const content = normalizeContent(req.body);

    if (!content) return res.status(400).send("Conteúdo vazio.");

    await db.collection("privacy_policy").doc("main").set(
      {
        content: content,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Erro ao guardar política:", err);
    return res.status(500).send("Erro ao guardar política");
  }
});

// PUT /admin/cookies
policiesRouter.put("/admin/cookies", async (req, res) => {
  try {
    const db = getDb();
    const content = normalizeContent(req.body);

    if (!content) return res.status(400).send("Conteúdo vazio.");

    await db.collection("cookies_policy").doc("main").set(
      {
        content: content,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Erro ao guardar política de cookies:", err);
    return res.status(500).send("Erro ao guardar política de cookies");
  }
});

// PUT /admin/usage
policiesRouter.put("/admin/usage", async (req, res) => {
  try {
    const db = getDb();
    const content = normalizeContent(req.body);

    if (!content) return res.status(400).send("Conteúdo vazio.");

    await db.collection("usage_policy").doc("main").set(
      {
        content: content,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Erro ao guardar termos de utilização:", err);
    return res.status(500).send("Erro ao guardar termos de utilização");
  }
});

module.exports = { policiesRouter };