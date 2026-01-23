function extractSupabaseObjectPath(publicUrl) {
  try {
    const urlObj = new URL(publicUrl);
    const pathname = urlObj.pathname;
    const prefix = "/storage/v1/object/public/";
    if (!pathname.startsWith(prefix)) return null;

    const full = pathname.replace(prefix, "");
    const parts = full.split("/");
    parts.shift(); // remove bucket
    return parts.join("/");
  } catch (e) {
    return null;
  }
}

module.exports = {extractSupabaseObjectPath};