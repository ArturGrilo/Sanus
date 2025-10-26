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

app.get("/blogs", async (req, res) => {
  try {
    const blogSnap = await db.collection("blog").
        orderBy("createdAt", "desc").get();
    const blogs = blogSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt &&
            data.createdAt.toDate ?
            data.createdAt.toDate() : null,
        updatedAt: data.updatedAt &&
            data.updatedAt.toDate ?
            data.updatedAt.toDate() : null,
      };
    });

    const tagsSnap = await db.collection("tags").get();
    const allTags = tagsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const blogsWithTags = blogs.map((article) => {
      const fullTags = (article.tags || [])
          .map((tagId) => allTags.find((t) => t.id === tagId))
          .filter(Boolean);
      return {...article, tags: fullTags};
    });

    res.json(blogsWithTags);
  } catch (err) {
    console.error("Erro ao carregar blogs:", err);
    res.status(500).send("Erro ao carregar blogs");
  }
});

app.get("/servico/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const snapshot = await db.
        collection("services").
        where("slug", "==", slug).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).send("Serviço não encontrado");
    }

    const data = snapshot.docs[0].data();
    res.json({id: snapshot.docs[0].id, ...data});
  } catch (err) {
    console.error("Erro ao buscar serviço:", err);
    res.status(500).send("Erro ao buscar serviço");
  }
});

// ✅ EXPORTAR A FUNÇÃO COMO /api
exports.api = functions.https.onRequest(app);
