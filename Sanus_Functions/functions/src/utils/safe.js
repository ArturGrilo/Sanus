function safeExtFromFilename(fileName) {
  const ext = (String(fileName).split(".").pop() || "jpg")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return ext || "jpg";
}

function safeId(v) {
  return String(v || "").replace(/[^a-zA-Z0-9_-]/g, "");
}

module.exports = {safeExtFromFilename, safeId};
