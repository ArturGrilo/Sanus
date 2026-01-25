const cors = require("cors");

const allowlist = [
  "https://sanus.pt",
  "https://www.sanus.pt",
  "https://sanusvitae.netlify.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowlist.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const corsMiddleware = cors(corsOptions);

module.exports = { corsMiddleware };