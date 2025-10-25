import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { auth } from "../lib/firebase";
import "./ImageUpload.css";

export default function ImageUpload({
  onUploadComplete,
  existingUrl,
  articleId,
  serviceId,
}) {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState(existingUrl || "");
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    if (!auth.currentUser) return alert("Não autorizado: faça login primeiro.");
    if (!file.type.startsWith("image/")) return alert("Selecione uma imagem válida.");

    setUploading(true);

    try {
      const isService = Boolean(serviceId);
      const type = isService ? "service" : "article";
      const id = serviceId || articleId || "temp";
      const fixedFileName = `${type}-${id}.jpg`;
      const bucket = isService ? "service-images" : "blog-images";

      const convertedBlob = await convertToJpeg(file);
      if (!convertedBlob) throw new Error("Falha ao converter imagem.");

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fixedFileName, convertedBlob, {
          upsert: true,
          contentType: "image/jpeg",
        });
      if (uploadError) throw uploadError;

      const { data: publicData, error: publicUrlError } = supabase.storage
        .from(bucket)
        .getPublicUrl(fixedFileName);
      if (publicUrlError) throw publicUrlError;

      const publicUrl = `${publicData.publicUrl}?v=${Date.now()}`;
      setUrl(publicUrl);
      onUploadComplete(publicUrl);
    } catch (err) {
      console.error(err);
      setError("Erro ao enviar imagem: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function convertToJpeg(file) {
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
      });
    } catch (err) {
      console.error("Erro na conversão para JPEG:", err);
      return null;
    }
  }

  return (
    <div className="upload-widget">
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={uploading}
      />
      {uploading && <p>⏳ A enviar imagem...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {url && !uploading && (
        <div className="preview-upload">
          <img src={url} alt="Pré-visualização" key={url} />
        </div>
      )}
    </div>
  );
}