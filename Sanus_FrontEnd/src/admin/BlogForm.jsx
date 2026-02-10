import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import ImageUpload from "./ImageUpload";
import "./BlogForm.css";
import { authedFetch } from "../lib/authedFetch";

// 🔹 Tiptap (Rich Text Editor)
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;

  // 🔹 Campos principais
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState(""); // HTML do editor
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Tags
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // 🔸 Util para preview: texto sem HTML
  const plainText = useMemo(() => {
    const tmp = document.createElement("div");
    tmp.innerHTML = content || "";
    return tmp.textContent || tmp.innerText || "";
  }, [content]);

  // 🔸 Carregar tags (público)
  useEffect(() => {
    fetch(`${API}/tags`)
      .then((r) => r.json())
      .then(setAllTags)
      .catch((err) => console.error("Erro a carregar tags:", err));
  }, [API]);

  // 🔸 Carregar artigo existente (edição) — ADMIN
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await authedFetch(`${API}/admin/blogs/${id}`, { method: "GET" });

        setTitle(data.title || "");
        setAuthor(data.author || "");
        setContent(data.content || ""); // HTML
        setImageUrl(data.imageUrl || "");

        // aqui no admin guardamos tags como array de ids
        const ids = Array.isArray(data.tags) ? data.tags : [];
        setSelectedTags(ids);
      } catch (err) {
        console.error(err);
        setError(err?.message || "Não foi possível carregar o artigo.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, API]);

  // 🔸 Editor Tiptap
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [2, 3] }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Underline,
    ],
    content: "<p>Escreve o conteúdo do artigo…</p>",
    autofocus: false,
    onUpdate: ({ editor: ed }) => {
      setContent(ed.getHTML());
    },
  });

  // Quando terminamos de carregar (edição), colocamos o conteúdo no editor
  useEffect(() => {
    if (editor && !loading) {
      editor.commands.setContent(content || "<p></p>");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, loading]);

  // 🔸 Alternar tags
  function toggleTag(tagId) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((x) => x !== tagId) : [...prev, tagId]
    );
  }

  // 🔸 Submeter artigo
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const clean = (s) => String(s || "").trim();

    if (!clean(title) || !clean(author) || !clean(content)) {
      setError("Preenche Título, Autor e Conteúdo.");
      return;
    }

    try {
      setSaving(true);
      let finalImageUrl = imageUrl;

      // 1️⃣ Se há nova imagem, pede URL assinado (PROTEGIDO) e faz o upload
      if (imageFile) {
        const { uploadUrl, publicUrl } = await authedFetch(`${API}/storage/blog-upload-url`, {
          method: "POST",
          body: JSON.stringify({
            fileName: imageFile.name,
            contentType: imageFile.type,
            articleId: id || null,
          }),
        });

        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });

        if (!putRes.ok) throw new Error("Falha no upload da imagem");
        finalImageUrl = publicUrl;
      }

      // 2️⃣ Envia JSON ao backend (ADMIN)
      const payload = {
        title: clean(title),
        author: clean(author),
        content: content,
        tags: Array.isArray(selectedTags) ? selectedTags : [],
        imageUrl: finalImageUrl,
      };

      const method = id ? "PUT" : "POST";
      const endpoint = id ? `${API}/admin/blogs/${id}` : `${API}/admin/blogs`;

      await authedFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      navigate("/admin/blog", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err?.message || "Erro ao guardar artigo.");
    } finally {
      setSaving(false);
    }
  }

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : imageUrl || "";

  // 🔸 Toolbar helpers
  const isActive = (name, attrs = {}) => editor?.isActive(name, attrs);
  const run = (fn) => editor?.chain().focus()[fn]().run();

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
            <button form="blogform" type="submit" className="btn btn-primary" disabled={saving}>
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

              <label>
                <span>Tags</span>
                <div className="services-dropdown">
                  {allTags.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      className={`service-pill ${selectedTags.includes(t.id) ? "selected" : ""}`}
                      style={{
                        backgroundColor: selectedTags.includes(t.id)
                          ? t.color || "var(--color-primary)"
                          : "#f0f0f0",
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
                <ImageUpload existingUrl={imageUrl} onFileSelect={setImageFile} />
              </label>

              <label>
                <span>Conteúdo</span>

                {/* 🔹 Toolbar do editor */}
                <div className="editor-toolbar">
                  <button
                    type="button"
                    className={isActive("bold") ? "active" : ""}
                    onClick={() => run("toggleBold")}
                    aria-label="Negrito"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    className={isActive("italic") ? "active" : ""}
                    onClick={() => run("toggleItalic")}
                    aria-label="Itálico"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    className={isActive("underline") ? "active" : ""}
                    onClick={() => run("toggleUnderline")}
                    aria-label="Sublinhado"
                  >
                    U
                  </button>

                  <span className="toolbar-sep" />

                  <button
                    type="button"
                    className={isActive("heading", { level: 2 }) ? "active" : ""}
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  >
                    Título
                  </button>
                  <button
                    type="button"
                    className={isActive("heading", { level: 3 }) ? "active" : ""}
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  >
                    Subtítulo
                  </button>

                  <span className="toolbar-sep" />

                  <button
                    type="button"
                    className={isActive("bulletList") ? "active" : ""}
                    onClick={() => run("toggleBulletList")}
                  >
                    • Lista
                  </button>
                  <button
                    type="button"
                    className={isActive("orderedList") ? "active" : ""}
                    onClick={() => run("toggleOrderedList")}
                  >
                    1. Lista
                  </button>
                  <button
                    type="button"
                    className={isActive("blockquote") ? "active" : ""}
                    onClick={() => run("toggleBlockquote")}
                  >
                    “ Citação
                  </button>

                  <button type="button" onClick={() => run("setHorizontalRule")} aria-label="Separador">
                    — Separador —
                  </button>

                  <span className="toolbar-sep" />

                  <button
                    type="button"
                    className={isActive("link") ? "active" : ""}
                    onClick={() => {
                      const url = window.prompt("Insere o link (https://…):");
                      if (!url) return;
                      editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                    }}
                  >
                    🔗 Link
                  </button>
                  <button type="button" onClick={() => editor?.chain().focus().unsetLink().run()}>
                    ❌ Link
                  </button>

                  <span className="toolbar-sep" />

                  <button type="button" onClick={() => editor?.chain().focus().undo().run()}>
                    ↺
                  </button>
                  <button type="button" onClick={() => editor?.chain().focus().redo().run()}>
                    ↻
                  </button>
                </div>

                {/* 🔹 Área do editor */}
                <div className="editor-wrapper">
                  <EditorContent editor={editor} />
                </div>

                <div className="meta-row">
                  <small>{plainText.trim().split(/\s+/).filter(Boolean).length} palavras</small>
                </div>
              </label>
            </form>

            <aside className="preview-card">
              <h3>Preview</h3>
              <div className="preview">
                {previewUrl ? (
                  <img src={previewUrl} alt="Pré-visualização" />
                ) : (
                  <div className="preview-placeholder">Sem imagem</div>
                )}

                <div className="preview-body">
                  <h4>{title || "Título do artigo"}</h4>
                  <p className="preview-author">{author ? `por ${author}` : "Autor"}</p>

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
                    {plainText
                      ? plainText.slice(0, 180) + (plainText.length > 180 ? "…" : "")
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