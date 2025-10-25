import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import Header from "./Header";
import ImageUpload from "./ImageUpload";
import { supabase } from "../lib/supabaseClient";
import "./BlogForm.css";

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 🔹 TAGS
  const [allTags, setAllTags] = useState([]);         // [{id, name, color}]
  const [selectedTags, setSelectedTags] = useState([]); // ["tagId1", "tagId2"]

  // Carregar lista de tags
  useEffect(() => {
    async function fetchTags() {
      const snap = await getDocs(collection(db, "tags"));
      setAllTags(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    fetchTags();
  }, []);

  // Carregar artigo (edição)
  useEffect(() => {
    let ignore = false;
    async function fetchPost() {
      try {
        if (!id) return;
        const snap = await getDoc(doc(db, "blog", id));
        if (!ignore && snap.exists()) {
          const data = snap.data();
          setTitle(data.title || "");
          setAuthor(data.author || "");
          setContent(data.content || "");
          setImageUrl(data.imageUrl || "");
          setSelectedTags(Array.isArray(data.tags) ? data.tags : []); // ← tags (array de IDs)
        }
      } catch {
        setError("Não foi possível carregar o artigo.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchPost();
    return () => { ignore = true; };
  }, [id]);

  const isValidImage = !!imageUrl && imageUrl.startsWith("http");

  // Guardar artigo
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const clean = (s) => (s || "").trim();
    const payloadBase = {
      title: clean(title),
      author: clean(author),
      content: clean(content),
      imageUrl: clean(imageUrl),
      tags: selectedTags, // ✅ array de IDs de tags
    };

    if (!payloadBase.title || !payloadBase.author || !payloadBase.content) {
      setError("Preenche Título, Autor e Conteúdo.");
      return;
    }

    try {
      setSaving(true);

      if (!id) {
        const docRef = await addDoc(collection(db, "blog"), {
          ...payloadBase,
          createdAt: serverTimestamp(),
        });

        // Renomear imagem “temp” → “article-[id].jpg”
        if (imageUrl.includes("article-temp")) {
          const newId = docRef.id;
          const newFileName = `article-${newId}.jpg`;
          await supabase.storage.from("blog-images").move("article-temp.jpg", newFileName);
          const { data: publicData } = supabase.storage
            .from("blog-images")
            .getPublicUrl(newFileName);
          const finalUrl = `${publicData.publicUrl}?v=${Date.now()}`;
          await setDoc(doc(db, "blog", newId), { imageUrl: finalUrl }, { merge: true });
        }
      } else {
        await setDoc(
          doc(db, "blog", id),
          { ...payloadBase, updatedAt: serverTimestamp() },
          { merge: true }
        );
      }

      navigate("/admin/blog", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao guardar o artigo.");
    } finally {
      setSaving(false);
    }
  }

  // Alternar seleção de tags
  function toggleTag(tagId) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((x) => x !== tagId) : [...prev, tagId]
    );
  }

  return (
    <div className="blogform-page">
      <Header />
      <main className="blogform-container">
        <div className="blogform-header">
          <h2>{id ? "Editar Artigo" : "Novo Artigo"}</h2>
          <div className="blogform-actions">
            <button
              type="button"
              className="btn-secundary"
              onClick={() => navigate("/admin/blog")}
              disabled={saving}
            >
              Voltar
            </button>
            <button
              form="blogform"
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
          <div className="blogform-grid">
            <form id="blogform" onSubmit={handleSubmit} className="form-card">
              <label>
                <span>Título</span>
                <input
                  placeholder="Ex.: Benefícios do Pilates Clínico"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>

              <label>
                <span>Autor</span>
                <input
                  placeholder="Ex.: Equipa Sanus Vitae"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </label>

              {/* 🔹 Tags (multi-select com pílulas coloridas) */}
              <label>
                <span>Tags</span>
                <div className="services-dropdown">
                  {allTags.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      className={`service-pill ${selectedTags.includes(t.id) ? "selected" : ""}`}
                      style={{
                        backgroundColor: selectedTags.includes(t.id) ? t.color : "#f0f0f0",
                        color: selectedTags.includes(t.id) ? "#fff" : "#333",
                      }}
                      onClick={() => toggleTag(t.id)}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </label>

              <label>
                <span>Imagem</span>
                <ImageUpload onUploadComplete={setImageUrl} articleId={id} />
              </label>

              <label>
                <span>Conteúdo</span>
                <textarea
                  rows="10"
                  placeholder="Escreve o conteúdo do artigo…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
                <div className="meta-row">
                  <small>{content.trim().split(/\s+/).filter(Boolean).length} palavras</small>
                </div>
              </label>
            </form>

            <aside className="preview-card">
              <h3>Preview</h3>
              <div className="preview">
                {isValidImage ? (
                  <img src={imageUrl} alt="Pré-visualização" />
                ) : (
                  <div className="preview-placeholder">Sem imagem válida</div>
                )}
                <div className="preview-body">
                  <h4>{title || "Título do artigo"}</h4>
                  <p className="preview-author">{author ? `por ${author}` : "Autor"}</p>

                  {/* 🔹 Preview das tags selecionadas */}
                  <div className="preview-tags">
                    {selectedTags.map((tagId) => {
                      const t = allTags.find((x) => x.id === tagId);
                      return t ? (
                        <span key={tagId} className="tag" style={{ backgroundColor: t.color }}>
                          {t.name}
                        </span>
                      ) : null;
                    })}
                  </div>

                  <p className="preview-excerpt">
                    {content
                      ? content.slice(0, 180) + (content.length > 180 ? "…" : "")
                      : "Introdução do artigo…"}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}