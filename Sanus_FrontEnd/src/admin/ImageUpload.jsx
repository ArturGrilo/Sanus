import { useEffect, useState } from "react";
import "./ImageUpload.css";

export default function ImageUpload({ onFileSelect, existingUrl }) {
  const [previewUrl, setPreviewUrl] = useState(existingUrl || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setPreviewUrl(existingUrl || "");
  }, [existingUrl]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // Validação simples
    if (!file.type.startsWith("image/")) {
      setError("O ficheiro tem de ser uma imagem.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Imagem demasiado grande (máx. 5MB).");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    onFileSelect?.(file);
  }

  return (
    <div className="upload-widget">
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {previewUrl && (
        <div className="preview-upload">
          <img src={previewUrl} alt="Pré-visualização" />
        </div>
      )}
    </div>
  );
}
