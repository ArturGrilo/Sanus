// BaseTab.jsx
import ImageUpload from "./ImageUpload";

export default function BaseTab({
  title,
  setTitle,
  subtitle,
  setSubtitle,
  slug,
  setSlug,
  text,
  setText,
  ctaText,
  setCtaText,
  imageUrl,
  setImageFile,
  previewUrl,
}) {
  return (
    <section className="sv-tabpanel">
      <div className="sv-form-section">
        <div className="sv-form-section-title">
          <h3>Base</h3>
          <p>Title, slug, CTA and main image</p>
        </div>

        <div className="sv-form-grid-2">
          <label>
            <span>Título</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>

          <label>
            <span>Subtítulo</span>
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </label>
        </div>

        <div className="sv-form-grid-2">
          <label>
            <span>Slug</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </label>

          <label>
            <span>Texto do botão</span>
            <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
          </label>
        </div>

        <label>
          <span>Descrição (cartão inicial)</span>
          <textarea rows="4" value={text} onChange={(e) => setText(e.target.value)} />
        </label>
      </div>

      <div className="sv-form-section">
        <div className="sv-form-section-title">
          <h3>Imagem principal</h3>
          <p>Hero image used on listing & detail</p>
        </div>

        <label>
          <span>Imagem principal</span>
          <ImageUpload existingUrl={imageUrl} onFileSelect={setImageFile} />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Pré-visualização"
              style={{ maxWidth: "320px", marginTop: 10, borderRadius: 12 }}
            />
          )}
        </label>
      </div>
    </section>
  );
}
