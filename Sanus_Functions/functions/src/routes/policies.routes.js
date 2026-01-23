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

// ============================================================
// Privacy
// GET /privacy
// PUT /privacy
// ============================================================
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

policiesRouter.put("/privacy", async (req, res) => {
  try {
    const db = getDb();

    const body = req.body || {};
    const content = body.content;

    if (!content) {
      return res.status(400).send("Conteúdo vazio.");
    }

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

// ============================================================
// Cookies
// GET /cookies
// PUT /cookies
// ============================================================
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

policiesRouter.put("/cookies", async (req, res) => {
  try {
    const db = getDb();

    const body = req.body || {};
    const content = body.content;

    if (!content) {
      return res.status(400).send("Conteúdo vazio.");
    }

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

// ============================================================
// Usage
// GET /usage
// PUT /usage
// ============================================================
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

policiesRouter.put("/usage", async (req, res) => {
  try {
    const db = getDb();

    const body = req.body || {};
    const content = body.content;

    if (!content) {
      return res.status(400).send("Conteúdo vazio.");
    }

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