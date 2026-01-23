const express = require("express");
const { jsonOnly } = require("./middlewares/jsonOnly");

const {corsMiddleware} = require("./middlewares/cors");
const {errorHandler} = require("./middlewares/errorHandler");

// Routes
const {recruitmentRouter} = require("./routes/recruitment.routes");
const {storageRouter} = require("./routes/storage.routes");
const {servicesRouter} = require("./routes/services.routes");
const {blogsRouter} = require("./routes/blogs.routes");
const {feedbacksRouter} = require("./routes/feedbacks.routes");
const {policiesRouter} = require("./routes/policies.routes");
const { appointmentsRouter } = require("./routes/appointments.routes");

function buildApp() {
  const app = express();

  app.use(corsMiddleware);

  app.use("/storage", jsonOnly, express.json());
  app.use("/admin", jsonOnly, express.json());
  app.use("/blogs", jsonOnly, express.json());
  app.use("/privacy", jsonOnly, express.json());
  app.use("/cookies", jsonOnly, express.json());
  app.use("/usage", jsonOnly, express.json());

  // Mount routers
  app.use(recruitmentRouter);
  app.use("/storage", storageRouter);
  app.use(servicesRouter);
  app.use(blogsRouter);
  app.use(feedbacksRouter);
  app.use(policiesRouter);
  app.use(appointmentsRouter);

  // Error handler (no fim)
  app.use(errorHandler);

  return app;
}

module.exports = {buildApp};