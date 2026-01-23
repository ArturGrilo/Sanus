/* eslint-disable max-len */
require("dotenv").config();

const functions = require("firebase-functions");
const {buildApp} = require("./src/app");

const app = buildApp();

exports.api = functions
    .region("europe-west1")
    .runWith({
      memory: "512MB",
      timeoutSeconds: 60,
      minInstances: 0,
    })
    .https
    .onRequest(app);
