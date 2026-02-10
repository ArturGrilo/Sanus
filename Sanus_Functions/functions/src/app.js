/* eslint-disable max-len */
const express = require("express");
const { jsonOnly } = require("./middlewares/jsonOnly");
const { corsMiddleware } = require("./middlewares/cors");
const { errorHandler } = require("./middlewares/errorHandler");
const { requireAuth } = require("./middlewares/requireAuth");

// Routes
const { recruitmentRouter } = require("./routes/recruitment.routes");
const { storageRouter } = require("./routes/storage.routes");
const { servicesRouter } = require("./routes/services.routes");
const { blogsRouter } = require("./routes/blogs.routes");
const { feedbacksRouter } = require("./routes/feedbacks.routes");
const { policiesRouter } = require("./routes/policies.routes");
const { appointmentsRouter } = require("./routes/appointments.routes");
const { contactRouter } = require("./routes/contact.routes");
const { faqsPublicRouter, faqsAdminRouter } = require("./routes/faqs.routes");
const { tagsRouter } = require("./routes/tags.routes");

function buildApp() {
  const app = express();

  // ✅ CORS PRIMEIRO
  app.use(corsMiddleware);
  app.options("*", corsMiddleware);

  // ✅ JSON parsing por grupos (mantém o teu padrão)
  app.use("/storage", jsonOnly, express.json());
  app.use("/admin", jsonOnly, express.json());
  app.use("/blogs", jsonOnly, express.json());
  app.use("/privacy", jsonOnly, express.json());
  app.use("/cookies", jsonOnly, express.json());
  app.use("/usage", jsonOnly, express.json());
  app.use("/faqs", express.json()); 

  app.use("/contact-request", jsonOnly, express.json());
  app.use("/appointment-request", jsonOnly, express.json());

  // ============================================================
  // 🔒 PASSO 2 — PROTEGER TUDO O QUE COMEÇA POR /admin
  // ============================================================
  // Isto impede que alguém faça POST/PUT/DELETE em /admin/* sem token
  app.use("/admin", requireAuth);

  // ============================================================
  // Mount routers
  // ============================================================
  app.use(recruitmentRouter);
  app.use("/storage", storageRouter);

  // Routers que expõem endpoints /admin/* (agora protegidos)
  app.use(servicesRouter);
  app.use(blogsRouter);
  app.use(feedbacksRouter);
  app.use(policiesRouter);
  app.use(appointmentsRouter);
  app.use(contactRouter);
  app.use(tagsRouter);
  app.use("/faqs", faqsPublicRouter);
  app.use("/admin/faqs", faqsAdminRouter);

  // ✅ sempre no fim
  app.use(errorHandler);

  return app;
}

module.exports = { buildApp };