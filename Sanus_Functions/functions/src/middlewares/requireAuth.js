/* eslint-disable max-len */
const admin = require("firebase-admin");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const match = authHeader.match(/^Bearer (.+)$/);

    if (!match) {
      return res.status(401).json({ error: "Missing Bearer token" });
    }

    const decoded = await admin.auth().verifyIdToken(match[1]);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error("[requireAuth] error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { requireAuth };