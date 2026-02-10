/* eslint-disable max-len */
const express = require("express");
const { FieldValue } = require("firebase-admin/firestore");
const { getDb } = require("../config/firebase");

// ============================================================
// Public router (FO) -> mounted at /faqs
// GET /faqs?key=quem-somos
// ============================================================
const faqsPublicRouter = express.Router();

faqsPublicRouter.get("/", async (req, res) => {
  try {
    const db = getDb();
    const key = String(req.query.key || "").trim();
    if (!key) return res.status(400).json({ error: "Missing key" });

    const snap = await db
      .collection("faq_sets")
      .where("key", "==", key)
      .where("isEnabled", "==", true)
      .limit(1)
      .get();

    if (snap.empty) return res.json({ set: null, items: [] });

    const setDoc = snap.docs[0];
    const setData = { id: setDoc.id, ...setDoc.data() };

    const itemsSnap = await db
      .collection("faq_sets")
      .doc(setDoc.id)
      .collection("items")
      .orderBy("order", "asc")
      .get();

    const items = itemsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((x) => x.isEnabled !== false);

    return res.json({ set: setData, items });
  } catch (err) {
    console.error("[faqs] public GET /faqs error:", err);
    return res.status(500).json({ error: err?.message || "Failed to load FAQs" });
  }
});

// ============================================================
// Admin router (BO) -> mounted at /admin/faqs
// (proteção vem do app.use("/admin", requireAuth))
// ============================================================
const faqsAdminRouter = express.Router();

// GET /admin/faqs/sets
faqsAdminRouter.get("/sets", async (req, res) => {
  try {
    const db = getDb();
    const snap = await db.collection("faq_sets").orderBy("updatedAt", "desc").get();
    const sets = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json({ sets });
  } catch (err) {
    console.error("[faqs] admin list sets error:", err);
    return res.status(500).json({ error: err?.message || "Failed to list sets" });
  }
});

// GET /admin/faqs/sets/:setId
faqsAdminRouter.get("/sets/:setId", async (req, res) => {
  try {
    const db = getDb();
    const { setId } = req.params;

    const setRef = db.collection("faq_sets").doc(setId);
    const setDoc = await setRef.get();
    if (!setDoc.exists) return res.status(404).json({ error: "Set not found" });

    const itemsSnap = await setRef.collection("items").orderBy("order", "asc").get();
    const items = itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return res.json({ set: { id: setDoc.id, ...setDoc.data() }, items });
  } catch (err) {
    console.error("[faqs] admin get set error:", err);
    return res.status(500).json({ error: err?.message || "Failed to load set" });
  }
});

// POST /admin/faqs/sets
faqsAdminRouter.post("/sets", async (req, res) => {
  try {
    const db = getDb();
    const { key, title, subtitle, isEnabled } = req.body || {};
    const trimmedKey = String(key || "").trim();
    if (!trimmedKey) return res.status(400).json({ error: "key is required" });

    // impedir keys duplicadas
    const existing = await db.collection("faq_sets").where("key", "==", trimmedKey).limit(1).get();
    if (!existing.empty) return res.status(409).json({ error: "Key already exists" });

    const now = FieldValue.serverTimestamp();

    const ref = await db.collection("faq_sets").add({
      key: trimmedKey,
      title: title ? String(title).trim() : "Perguntas Frequentes",
      subtitle: subtitle ? String(subtitle).trim() : "Dúvidas",
      isEnabled: typeof isEnabled === "boolean" ? isEnabled : true,
      scope: "public",
      createdAt: now,
      updatedAt: now,
    });

    return res.status(201).json({ ok: true, id: ref.id });
  } catch (err) {
    console.error("[faqs] admin create set error:", err);
    return res.status(500).json({ error: err?.message || "Failed to create set" });
  }
});

// PUT /admin/faqs/sets/:setId
faqsAdminRouter.put("/sets/:setId", async (req, res) => {
  try {
    const db = getDb();
    const { setId } = req.params;
    const { title, subtitle, isEnabled, key } = req.body || {};

    const setRef = db.collection("faq_sets").doc(setId);
    const setDoc = await setRef.get();
    if (!setDoc.exists) return res.status(404).json({ error: "Set not found" });

    // validar key duplicada
    if (typeof key === "string") {
      const trimmedKey = key.trim();
      if (!trimmedKey) return res.status(400).json({ error: "key cannot be empty" });

      const other = await db.collection("faq_sets").where("key", "==", trimmedKey).limit(1).get();
      if (!other.empty && other.docs[0].id !== setId) {
        return res.status(409).json({ error: "Key already exists" });
      }
    }

    const updates = {};
    if (typeof title === "string") updates.title = title.trim();
    if (typeof subtitle === "string") updates.subtitle = subtitle.trim();
    if (typeof key === "string") updates.key = key.trim();
    if (typeof isEnabled === "boolean") updates.isEnabled = isEnabled;

    updates.updatedAt = FieldValue.serverTimestamp();

    await setRef.update(updates);
    return res.json({ ok: true });
  } catch (err) {
    console.error("[faqs] admin update set error:", err);
    // devolve a mensagem real para o BO (ajuda muito a debugar)
    return res.status(500).json({ error: err?.message || "Failed to update set" });
  }
});

// DELETE /admin/faqs/sets/:setId
faqsAdminRouter.delete("/sets/:setId", async (req, res) => {
  try {
    const db = getDb();
    const { setId } = req.params;
    const setRef = db.collection("faq_sets").doc(setId);

    const itemsSnap = await setRef.collection("items").get();
    const batch = db.batch();
    itemsSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(setRef);
    await batch.commit();

    return res.json({ ok: true });
  } catch (err) {
    console.error("[faqs] admin delete set error:", err);
    return res.status(500).json({ error: err?.message || "Failed to delete set" });
  }
});

// POST /admin/faqs/sets/:setId/items
faqsAdminRouter.post("/sets/:setId/items", async (req, res) => {
  try {
    const db = getDb();
    const { setId } = req.params;
    const { question, answer, order, isEnabled } = req.body || {};

    if (!question || !answer) {
      return res.status(400).json({ error: "question and answer are required" });
    }

    const setRef = db.collection("faq_sets").doc(setId);
    const setDoc = await setRef.get();
    if (!setDoc.exists) return res.status(404).json({ error: "Set not found" });

    const now = FieldValue.serverTimestamp();

    const ref = await setRef.collection("items").add({
      question: String(question).trim(),
      answer: String(answer).trim(),
      order: typeof order === "number" ? order : 100,
      isEnabled: typeof isEnabled === "boolean" ? isEnabled : true,
      createdAt: now,
      updatedAt: now,
    });

    return res.status(201).json({ ok: true, id: ref.id });
  } catch (err) {
    console.error("[faqs] admin create item error:", err);
    return res.status(500).json({ error: err?.message || "Failed to create item" });
  }
});

// PUT /admin/faqs/sets/:setId/items/:itemId
faqsAdminRouter.put("/sets/:setId/items/:itemId", async (req, res) => {
  try {
    const db = getDb();
    const { setId, itemId } = req.params;
    const { question, answer, order, isEnabled } = req.body || {};

    const updates = {};
    if (typeof question === "string") updates.question = question.trim();
    if (typeof answer === "string") updates.answer = answer.trim();
    if (typeof order === "number") updates.order = order;
    if (typeof isEnabled === "boolean") updates.isEnabled = isEnabled;
    updates.updatedAt = FieldValue.serverTimestamp();

    await db.collection("faq_sets").doc(setId).collection("items").doc(itemId).update(updates);
    return res.json({ ok: true });
  } catch (err) {
    console.error("[faqs] admin update item error:", err);
    return res.status(500).json({ error: err?.message || "Failed to update item" });
  }
});

// DELETE /admin/faqs/sets/:setId/items/:itemId
faqsAdminRouter.delete("/sets/:setId/items/:itemId", async (req, res) => {
  try {
    const db = getDb();
    const { setId, itemId } = req.params;
    await db.collection("faq_sets").doc(setId).collection("items").doc(itemId).delete();
    return res.json({ ok: true });
  } catch (err) {
    console.error("[faqs] admin delete item error:", err);
    return res.status(500).json({ error: err?.message || "Failed to delete item" });
  }
});

// PUT /admin/faqs/sets/:setId/reorder
faqsAdminRouter.put("/sets/:setId/reorder", async (req, res) => {
  try {
    const db = getDb();
    const { setId } = req.params;
    const { orderedIds } = req.body || {};

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: "orderedIds must be an array" });
    }

    const setRef = db.collection("faq_sets").doc(setId);
    const batch = db.batch();

    orderedIds.forEach((id, idx) => {
      batch.update(setRef.collection("items").doc(id), {
        order: idx + 1,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    return res.json({ ok: true });
  } catch (err) {
    console.error("[faqs] admin reorder error:", err);
    return res.status(500).json({ error: err?.message || "Failed to reorder" });
  }
});

module.exports = { faqsPublicRouter, faqsAdminRouter };