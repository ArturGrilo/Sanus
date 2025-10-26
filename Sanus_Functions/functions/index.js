const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({origin: true}));
app.use(express.json());

// 🚀 ROTA DENTRO DO EXPRESS
app.get("/services", async (req, res) => {
  try {
    const snapshot = await db.collection("services").orderBy("createdAt").get();
    const services = snapshot.docs.map((doc) =>({_id: doc.id, ...doc.data()}));
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro a buscar serviços");
  }
});

app.get("/feedbacks", async (req, res) => {
  try {
    const snapshot = await db.
        collection("feedback").
        orderBy("createdAt", "desc").
        get();
    const feedbacks = snapshot.docs.map((doc) =>({id: doc.id, ...doc.data()}));
    res.json(feedbacks);
  } catch (err) {
    console.error("Erro ao buscar feedbacks:", err);
    res.status(500).send("Erro ao buscar feedbacks");
  }
});

// ✅ EXPORTAR A FUNÇÃO COMO /api
exports.api = functions.https.onRequest(app);
