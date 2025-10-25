const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "env") });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.get("/api/services", async (req, res) => {
  try {
    const snapshot = await db.collection("services").orderBy("createdAt", "asc").get();
    const services = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(services);
  } catch (error) {
    console.error("Erro ao obter serviços:", error);
    res.status(500).json({ error: "Erro ao buscar serviços" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend da Sanus Vitae a funcionar");
});

app.listen(PORT, () => {
  console.log(`Servidor backend a correr em http://localhost:${PORT}`);
});