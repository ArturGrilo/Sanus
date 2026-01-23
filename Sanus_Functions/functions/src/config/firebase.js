const admin = require("firebase-admin");

let db = null;

function getDb() {
  if (db) return db;

  if (admin.apps.length === 0) {
    admin.initializeApp();
  }

  db = admin.firestore();
  return db;
}

module.exports = {getDb};