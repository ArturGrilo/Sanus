const https = require("https");

function verifyTurnstile(token, ip) {
  return new Promise((resolve, reject) => {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return reject(new Error("TURNSTILE_SECRET_KEY não definido"));

    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);
    if (ip) params.append("remoteip", ip);

    const body = params.toString();

    const req = https.request({
      method: "POST",
      hostname: "challenges.cloudflare.com",
      path: "/turnstile/v0/siteverify",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "content-length": Buffer.byteLength(body),
      },
    }, (resp) => {
      let data = "";
      resp.on("data", (chunk) => { data += String(chunk); });
      resp.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error("Resposta inválida do Turnstile"));
        }
      });
    });

    req.on("error", (e) => reject(e));
    req.write(body);
    req.end();
  });
}

function getClientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "");
  return forwarded ? forwarded.split(",")[0].trim() : "";
}

function isEmulatorRequest(req) {
  const host = String(req.headers.host || "");
  const isLocalhost = host.includes("127.0.0.1") || host.includes("localhost");

  return (
    process.env.FUNCTIONS_EMULATOR === "true" ||
    String(process.env.FIREBASE_EMULATOR_HUB || "").length > 0 ||
    isLocalhost
  );
}

module.exports = {verifyTurnstile, getClientIp, isEmulatorRequest};