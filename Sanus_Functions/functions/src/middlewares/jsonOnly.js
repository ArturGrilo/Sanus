function jsonOnly(req, res, next) {
  // Permite GET/HEAD sem Content-Type
  const method = String(req.method || "").toUpperCase();
  if (method === "GET" || method === "HEAD") {
    return next();
  }

  const contentType = String(req.headers["content-type"] || "").toLowerCase();

  // Aceita application/json e também application/json; charset=utf-8
  const isJson = contentType.indexOf("application/json") !== -1;

  if (!isJson) {
    return res.status(415).json({
      message: "Content-Type inválido. Use application/json.",
    });
  }

  return next();
}

module.exports = { jsonOnly };