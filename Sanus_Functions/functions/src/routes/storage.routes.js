const express = require("express");
const crypto = require("crypto");

const { getDb } = require("../config/firebase");
const { getSupabase } = require("../config/supabase");

const { safeExtFromFilename, safeId } = require("../utils/safe");
const { extractSupabaseObjectPath } = require("../utils/storagePaths");

const storageRouter = express.Router();

/**
 * Tenta encontrar a imagem antiga de uma specialty pelo itemId dentro do doc de services.
 * @param {string} serviceId
 * @param {string} itemId
 * @return {Promise<string|null>}
 */
async function findOldSpecialtyImageUrl(serviceId, itemId) {
  try {
    const db = getDb();
    const snap = await db.collection("services").doc(serviceId).get();
    if (!snap.exists) return null;

    const data = snap.data() || {};
    const arr = Array.isArray(data.specialties) ? data.specialties : [];
    const found = arr.find((x) => x && String(x.id || "") === String(itemId));
    if (!found) return null;

    return found.image || found.imageUrl || null;
  } catch (e) {
    return null;
  }
}

// ============================================================
// 🚀 Upload Assinado - BLOG
// POST /storage/blog-upload-url
// ============================================================
storageRouter.post("/blog-upload-url", async (req, res) => {
  try {
    const supabase = getSupabase();
    const db = getDb();

    const body = req.body || {};
    const fileName = body.fileName;
    const contentType = body.contentType;
    const articleId = body.articleId;

    if (!fileName || !contentType) {
      return res.status(400).send("fileName e contentType são obrigatórios");
    }

    const bucket = "blog-images";

    // 1) se é edição → buscar URL antigo
    let oldObjectPath = null;
    if (articleId) {
      const snap = await db.collection("blog").doc(articleId).get();
      if (snap.exists) {
        const snapData = snap.data() || {};
        const oldUrl = snapData.imageUrl ? snapData.imageUrl : null;
        if (oldUrl) oldObjectPath = extractSupabaseObjectPath(oldUrl);
      }
    }

    // 2) apagar antigo
    if (oldObjectPath) {
      const del = await supabase.storage.from(bucket).remove([oldObjectPath]);
      const deleteErr = del && del.error ? del.error : null;

      if (deleteErr) {
        console.warn("⚠ Não foi possível remover a imagem antiga:", deleteErr.message);
      } else {
        console.log("🗑 Ficheiro antigo removido:", oldObjectPath);
      }
    }

    // 3) nome único
    const ext = safeExtFromFilename(fileName);
    const safeDocId = articleId || crypto.randomUUID();
    const uniqueSuffix = crypto.randomUUID().slice(0, 8);
    const objectName = "article-" + safeDocId + "-" + uniqueSuffix + "." + ext;

    // 4) signed upload url
    const signed = await supabase.storage.from(bucket).createSignedUploadUrl(objectName, 60);
    const data = signed && signed.data ? signed.data : null;
    const error = signed && signed.error ? signed.error : null;

    if (error) {
      throw error;
    }

    const pub = supabase.storage.from(bucket).getPublicUrl(objectName);
    const publicUrl = pub && pub.data && pub.data.publicUrl ? pub.data.publicUrl : "";

    return res.json({
      uploadUrl: data.signedUrl,
      publicUrl: publicUrl,
    });
  } catch (err) {
    console.error("🔥 Erro em /storage/blog-upload-url:", err);
    return res.status(500).send("Erro ao gerar URL assinado");
  }
});

// ============================================================
// 🚀 Upload Assinado - SERVICES (imagem principal)
// POST /storage/service-upload-url
// ============================================================
storageRouter.post("/service-upload-url", async (req, res) => {
  try {
    const supabase = getSupabase();
    const db = getDb();

    const body = req.body || {};
    const fileName = body.fileName;
    const contentType = body.contentType;
    const serviceId = body.serviceId;

    if (!fileName || !contentType) {
      return res.status(400).send("fileName e contentType são obrigatórios");
    }

    const bucket = "service-images";

    // 1) se é edição → buscar URL antigo
    let oldObjectPath = null;
    if (serviceId) {
      const snap = await db.collection("services").doc(serviceId).get();
      if (snap.exists) {
        const snapData = snap.data() || {};
        const oldUrl = snapData.imageUrl || snapData.image || null;
        if (oldUrl) oldObjectPath = extractSupabaseObjectPath(oldUrl);
      }
    }

    // 2) apagar antigo
    if (oldObjectPath) {
      const del = await supabase.storage.from(bucket).remove([oldObjectPath]);
      const deleteErr = del && del.error ? del.error : null;

      if (deleteErr) {
        console.warn("⚠ Não foi possível remover a imagem antiga (service):", deleteErr.message);
      } else {
        console.log("🗑 Ficheiro antigo removido (service):", oldObjectPath);
      }
    }

    // 3) nome único
    const ext = safeExtFromFilename(fileName);
    const safeDocId = serviceId || crypto.randomUUID();
    const uniqueSuffix = crypto.randomUUID().slice(0, 8);
    const objectName = "service-" + safeDocId + "-" + uniqueSuffix + "." + ext;

    // 4) signed upload url
    const signed = await supabase.storage.from(bucket).createSignedUploadUrl(objectName, 60);
    const data = signed && signed.data ? signed.data : null;
    const error = signed && signed.error ? signed.error : null;

    if (error) {
      throw error;
    }

    const pub = supabase.storage.from(bucket).getPublicUrl(objectName);
    const publicUrl = pub && pub.data && pub.data.publicUrl ? pub.data.publicUrl : "";

    return res.json({
      uploadUrl: data.signedUrl,
      publicUrl: publicUrl,
    });
  } catch (err) {
    console.error("🔥 Erro em /storage/service-upload-url:", err);
    return res.status(500).send("Erro ao gerar URL assinado");
  }
});

// ============================================================
// 🚀 Upload assinado - imagens das indications por serviço
// POST /storage/service-indication-upload-url
// ============================================================
storageRouter.post("/service-indication-upload-url", async (req, res) => {
  try {
    const supabase = getSupabase();

    const body = req.body || {};
    const fileName = body.fileName;
    const contentType = body.contentType;
    const serviceId = body.serviceId;
    const itemId = body.itemId;

    if (!fileName || !contentType || !serviceId || !itemId) {
      return res.status(400).send("fileName, contentType, serviceId e itemId são obrigatórios");
    }

    const bucket = "service-images";

    const ext = safeExtFromFilename(fileName);
    const safeServiceId = safeId(serviceId);
    const safeItemId = safeId(itemId);

    const objectName =
      "indications/" +
      safeServiceId +
      "/" +
      safeItemId +
      "-" +
      crypto.randomUUID().slice(0, 8) +
      "." +
      ext;

    const signed = await supabase.storage.from(bucket).createSignedUploadUrl(objectName, 60);
    const data = signed && signed.data ? signed.data : null;
    const error = signed && signed.error ? signed.error : null;

    if (error) {
      throw error;
    }

    const pub = supabase.storage.from(bucket).getPublicUrl(objectName);
    const publicUrl = pub && pub.data && pub.data.publicUrl ? pub.data.publicUrl : "";

    return res.json({
      uploadUrl: data.signedUrl,
      publicUrl: publicUrl,
    });
  } catch (err) {
    console.error("🔥 Erro em /storage/service-indication-upload-url:", err);
    return res.status(500).send("Erro ao gerar URL assinado");
  }
});

// ============================================================
// ✅ Upload assinado - imagens das specialties por serviço
// POST /storage/service-specialty-upload-url
// ============================================================
storageRouter.post("/service-specialty-upload-url", async (req, res) => {
  try {
    const supabase = getSupabase();

    const body = req.body || {};
    const fileName = body.fileName;
    const contentType = body.contentType;
    const serviceId = body.serviceId;
    const itemId = body.itemId;
    const previousUrl = body.previousUrl;

    if (!fileName || !contentType || !serviceId || !itemId) {
      return res.status(400).send("fileName, contentType, serviceId e itemId são obrigatórios");
    }

    const bucket = "service-images";
    const ext = safeExtFromFilename(fileName);

    const safeServiceId = safeId(serviceId);
    const safeItemId = safeId(itemId);

    // 1) descobrir imagem antiga
    let oldUrl = previousUrl || null;
    if (!oldUrl) {
      oldUrl = await findOldSpecialtyImageUrl(serviceId, itemId);
    }

    const oldObjectPath = oldUrl ? extractSupabaseObjectPath(oldUrl) : null;

    // 2) apagar antiga
    if (oldObjectPath) {
      const del = await supabase.storage.from(bucket).remove([oldObjectPath]);
      const deleteErr = del && del.error ? del.error : null;

      if (deleteErr) {
        console.warn("⚠ Não foi possível remover a imagem antiga (specialty):", deleteErr.message);
      } else {
        console.log("🗑 Ficheiro antigo removido (specialty):", oldObjectPath);
      }
    }

    // 3) path novo
    const objectName =
      "specialties/" +
      safeServiceId +
      "/" +
      safeItemId +
      "-" +
      crypto.randomUUID().slice(0, 8) +
      "." +
      ext;

    // 4) signed upload url
    const signed = await supabase.storage.from(bucket).createSignedUploadUrl(objectName, 60);
    const data = signed && signed.data ? signed.data : null;
    const error = signed && signed.error ? signed.error : null;

    if (error) {
      throw error;
    }

    const pub = supabase.storage.from(bucket).getPublicUrl(objectName);
    const publicUrl = pub && pub.data && pub.data.publicUrl ? pub.data.publicUrl : "";

    return res.json({
      uploadUrl: data.signedUrl,
      publicUrl: publicUrl,
    });
  } catch (err) {
    console.error("🔥 Erro em /storage/service-specialty-upload-url:", err);
    return res.status(500).send("Erro ao gerar URL assinado");
  }
});

module.exports = { storageRouter };