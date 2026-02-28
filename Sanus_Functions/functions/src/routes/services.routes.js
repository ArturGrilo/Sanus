const express = require("express");
const { FieldValue } = require("firebase-admin/firestore");

const { getDb } = require("../config/firebase");
const {
  normalizeFaqs,
  normalizeBenefits,
  normalizeCtaSection,
  normalizeTreatmentTypes,
} = require("../utils/normalize");

const servicesRouter = express.Router();

// ============================================================
// GET /services  (lista)
// ============================================================
servicesRouter.get("/services", async (req, res) => {
  try {
    const db = getDb();

    const snapshot = await db.collection("services").orderBy("createdAt").get();
    const services = snapshot.docs.map((doc) => {
      return { _id: doc.id, ...doc.data() };
    });

    return res.json(services);
  } catch (err) {
    console.error("Erro a buscar serviços:", err);
    return res.status(500).send("Erro a buscar serviços");
  }
});

// ============================================================
// GET /services/:slug  (público por slug)
// ============================================================
servicesRouter.get("/services/:slug", async (req, res) => {
  try {
    const db = getDb();

    const slug = String(req.params.slug || "").toLowerCase().trim();
    const qSnap = await db.collection("services").where("slug", "==", slug).limit(1).get();

    if (qSnap.empty) {
      return res.status(404).send("Serviço não encontrado");
    }

    const doc = qSnap.docs[0];
    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("Erro ao carregar serviço por slug:", err);
    return res.status(500).send("Erro ao carregar serviço");
  }
});

// ============================================================
// GET /admin/services/:id (admin por docId)
// ============================================================
servicesRouter.get("/admin/services/:id", async (req, res) => {
  try {
    const db = getDb();

    const snap = await db.collection("services").doc(req.params.id).get();
    if (!snap.exists) {
      return res.status(404).send("Serviço não encontrado");
    }

    return res.json({ id: snap.id, ...snap.data() });
  } catch (err) {
    console.error("Erro admin get service:", err);
    return res.status(500).send("Erro ao carregar serviço");
  }
});

// ============================================================
// POST /admin/services (criar)
// ============================================================
servicesRouter.post("/admin/services", async (req, res) => {
  try {
    const db = getDb();
    const body = req.body || {};

    const title = String(body.title || "").trim();
    const subtitle = String(body.subtitle || "").trim();
    const slug = String(body.slug || "").trim();
    const text = String(body.text || "").trim();

    const biggerDescription = String(body.bigger_description || body.biggerDescription || "").trim();
    const ctaText = String(body.ctaText || "").trim();

    const image = String(body.image || body.imageUrl || "").trim();
    const imageUrl = String(body.imageUrl || body.image || "").trim();

    const indications = Array.isArray(body.indications) ? body.indications : [];

    const treatmentSteps = Array.isArray(body.treatment_steps)
      ? body.treatment_steps
      : (Array.isArray(body.treatmentSteps) ? body.treatmentSteps : []);

    const treatmentTypesRaw = Array.isArray(body.treatment_types)
      ? body.treatment_types
      : (Array.isArray(body.treatmentTypes) ? body.treatmentTypes : []);
    const treatmentTypes = normalizeTreatmentTypes(treatmentTypesRaw);

    const specialties = Array.isArray(body.specialties) ? body.specialties : [];

    const benefits = normalizeBenefits(body.benefits);
    const faqs = normalizeFaqs(body.faqs);
    const ctaSection = normalizeCtaSection(body.cta_section || body.ctaSection);

    if (!title || !slug) {
      return res.status(400).send("title e slug são obrigatórios");
    }

    const docRef = await db.collection("services").add({
      title: title,
      subtitle: subtitle,
      slug: slug,
      text: text,

      bigger_description: biggerDescription,
      ctaText: ctaText,

      image: image,
      imageUrl: imageUrl,

      indications: indications,
      treatment_steps: Array.isArray(treatmentSteps) ? treatmentSteps : [],
      treatment_types: Array.isArray(treatmentTypes) ? treatmentTypes : [],
      specialties: specialties,

      benefits: benefits,
      faqs: faqs,
      cta_section: ctaSection,

      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ id: docRef.id });
  } catch (err) {
    console.error("Erro admin create service:", err);
    return res.status(500).send("Erro ao criar serviço");
  }
});

// ============================================================
// PUT /admin/services/:id (atualizar)
// ============================================================
servicesRouter.put("/admin/services/:id", async (req, res) => {
  try {
    const db = getDb();
    const body = req.body || {};

    const title = String(body.title || "").trim();
    const subtitle = String(body.subtitle || "").trim();
    const slug = String(body.slug || "").trim();
    const text = String(body.text || "").trim();

    const biggerDescription = String(body.bigger_description || body.biggerDescription || "").trim();
    const ctaText = String(body.ctaText || "").trim();

    const image = String(body.image || body.imageUrl || "").trim();
    const imageUrl = String(body.imageUrl || body.image || "").trim();

    const indications = Array.isArray(body.indications) ? body.indications : [];

    const treatmentSteps = Array.isArray(body.treatment_steps)
      ? body.treatment_steps
      : (Array.isArray(body.treatmentSteps) ? body.treatmentSteps : []);

    const treatmentTypesRaw = Array.isArray(body.treatment_types)
      ? body.treatment_types
      : (Array.isArray(body.treatmentTypes) ? body.treatmentTypes : []);
    const treatmentTypes = normalizeTreatmentTypes(treatmentTypesRaw);

    const specialties = Array.isArray(body.specialties) ? body.specialties : [];

    const benefits = normalizeBenefits(body.benefits);
    const faqs = normalizeFaqs(body.faqs);
    const ctaSection = normalizeCtaSection(body.cta_section || body.ctaSection);

    if (!title || !slug) {
      return res.status(400).send("title e slug são obrigatórios");
    }

    await db.collection("services").doc(req.params.id).set(
      {
        title: title,
        subtitle: subtitle,
        slug: slug,
        text: text,

        bigger_description: biggerDescription,
        ctaText: ctaText,

        image: image,
        imageUrl: imageUrl,

        indications: indications,
        treatment_steps: Array.isArray(treatmentSteps) ? treatmentSteps : [],
        treatment_types: Array.isArray(treatmentTypes) ? treatmentTypes : [],
        specialties: specialties,

        benefits: benefits,
        faqs: faqs,
        cta_section: ctaSection,

        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Erro admin update service:", err);
    return res.status(500).send("Erro ao atualizar serviço");
  }
});

module.exports = { servicesRouter };