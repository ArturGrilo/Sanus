import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import Header from "./Header";
import "./BlogForm.css";
import ImageUpload from "./ImageUpload";
import { supabase } from "../lib/supabaseClient";

export default function ServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [slug, setSlug] = useState("");
  const [text, setText] = useState("");
  const [biggerDescription, setBiggerDescription] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Gerar slug automaticamente com base no título
  useEffect(() => {
    if (title && !id) {
      const generatedSlug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setSlug(generatedSlug);
    }
  }, [title, id]);

  useEffect(() => {
    async function fetchService() {
      if (!id) return;
      const snap = await getDoc(doc(db, "services", id));
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title || "");
        setSubtitle(data.subtitle || "");
        setSlug(data.slug || "");
        setText(data.text || "");
        setBiggerDescription(data.bigger_description || "");
        setCtaText(data.ctaText || "");
        setImageUrl(data.image || "");
      }
      setLoading(false);
    }
    fetchService();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      slug: slug.trim(),
      text: text.trim(),
      bigger_description: biggerDescription.trim(),
      ctaText: ctaText.trim(),
      image: imageUrl.trim(),
      updatedAt: serverTimestamp(),
    };

    try {
      setSaving(true);
      let newDocRef;

      if (id) {
        await setDoc(doc(db, "services", id), payload, { merge: true });
        newDocRef = { id };
      } else {
        newDocRef = await addDoc(collection(db, "services"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      // 🔹 Atualizar imagem temporária se necessário
      if (imageUrl.includes("service-temp.jpg")) {
        const { error: moveError } = await supabase.storage
          .from("services-images")
          .move("service-temp.jpg", `service-${newDocRef.id}.jpg`);

        if (!moveError) {
          const { data } = supabase.storage
            .from("services-images")
            .getPublicUrl(`service-${newDocRef.id}.jpg`);
          const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
          await setDoc(
            doc(db, "services", newDocRef.id),
            { image: publicUrl },
            { merge: true }
          );
        }
      }

      navigate("/admin/services", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Erro ao guardar o serviço.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="blogform-page">
      <Header />
      <main className="blogform-container">
        <div className="blogform-header">
          <h2>{id ? "Editar Serviço" : "Novo Serviço"}</h2>
          <div className="blogform-actions">
            <button
              type="button"
              className="btn-secundary"
              onClick={() => navigate("/admin/services")}
              disabled={saving}
            >
              Voltar
            </button>
            <button
              form="serviceform"
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? "A guardar…" : "Guardar"}
            </button>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="skeleton">A carregar…</div>
        ) : (
          <form id="serviceform" onSubmit={handleSubmit} className="form-card">
            <label>
              <span>Título</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>

            <label>
              <span>Subtítulo</span>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </label>

            <label>
              <span>Slug</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} required />
              <small style={{ color: "gray" }}>ex: fisioterapia, servicos-ao-domicilio</small>
            </label>

            <label>
              <span>Descrição para o cartão na pagina inicial</span>
              <textarea rows="4" value={text} onChange={(e) => setText(e.target.value)} />
            </label>

            <label>
              <span>Descrição para a página com mais detalhes</span>
              <textarea
                rows="8"
                value={biggerDescription}
                onChange={(e) => setBiggerDescription(e.target.value)}
                placeholder="Escreva aqui o conteúdo da página detalhada em formato Markdown..."
              />
              <div
                style={{
                  fontSize: "0.85rem",
                  background: "#f9fafb",
                  padding: "0.75rem 1rem",
                  borderRadius: "6px",
                  marginTop: "0.5rem",
                  color: "#444",
                  lineHeight: 1.5,
                }}
              >
                <strong>Dicas de formatação do texto acima:</strong>
                <ul style={{ marginTop: "0.5rem", marginLeft: "1.2rem", textAlign: "left" }}>
                  <li>
                    <code>**texto**</code> → <strong>negrito</strong>
                  </li>
                  <li>
                    <code>- item</code> → cria uma lista com pontos
                  </li>
                  <li>
                    <code>[texto do link](https://...)</code> → cria um link
                  </li>
                  <li>
                    <code>---</code> → linha horizontal
                  </li>
                  <li>
                    Duas quebras de linha → novo parágrafo
                  </li>
                </ul>
              </div>
            </label>
            <label>
              <span>Texto do botão</span>
              <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
            </label>

            <label>
              <span>Imagem</span>
              <ImageUpload onUploadComplete={setImageUrl} serviceId={id} />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Pré-visualização"
                  style={{
                    maxWidth: "300px",
                    marginTop: 10,
                    borderRadius: 10,
                  }}
                />
              )}
            </label>
          </form>
        )}
      </main>
    </div>
  );
}