const express = require("express");
const { getDb } = require("../config/firebase");

const feedbacksRouter = express.Router();

// GET /feedbacks
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

module.exports = { feedbacksRouter };