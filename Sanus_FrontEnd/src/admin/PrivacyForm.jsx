import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "./BlogForm.css";
import { authedFetch } from "../lib/authedFetch";

// Tiptap
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

export default function PrivacyForm() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Editor Tiptap
  const editor = useEditor({
    extensions: [StarterKit, Link, Underline],
    content: "<p>Carregando…</p>",
    autofocus: false,
    onUpdate: ({ editor: ed }) => setContent(ed.getHTML()),
  });

  // Carregar política existente (GET público)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/privacy`);
        if (!res.ok) throw new Error("Erro ao carregar política.");
        const data = await res.json();

        const html = data.content || "<p></p>";
        setContent(html);

        // garantir que o editor já existe
        if (editor) editor.commands.setContent(html);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar a política.");
      } finally {
        setLoading(false);
      }
    })();
  }, [API, editor]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await authedFetch(`${API}/admin/privacy`, {
        method: "PUT",
        body: JSON.stringify({ content }),
      });

      navigate("/admin", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err?.message || "Erro ao guardar política.");
    } finally {
      setSaving(false);
    }
  }

  const isActive = (name, attrs = {}) => editor?.isActive(name, attrs);

  return (
    <div className="blogform-page">
      <Header />
      <main className="blogform-container">
        <div className="blogform-header">
          <h2>Política de Privacidade</h2>

          <div className="blogform-actions">
            <button type="button" className="btn-secundary" onClick={() => navigate("/admin")}>
              Voltar
            </button>

            <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
              {saving ? "A guardar…" : "Guardar"}
            </button>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="skeleton">A carregar…</div>
        ) : (
          <div className="form-card">
            {/* Toolbar */}
            <div className="editor-toolbar">
              <button
                type="button"
                className={isActive("bold") ? "active" : ""}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                B
              </button>

              <button
                type="button"
                className={isActive("italic") ? "active" : ""}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                I
              </button>

              <button
                type="button"
                className={isActive("underline") ? "active" : ""}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              >
                U
              </button>

              <span className="toolbar-sep" />

              <button
                type="button"
                className={isActive("link") ? "active" : ""}
                onClick={() => {
                  const url = window.prompt("Link (https://…):");
                  if (!url) return;
                  editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                }}
              >
                🔗 Link
              </button>

              <button type="button" onClick={() => editor?.chain().focus().unsetLink().run()}>
                ❌ Link
              </button>
            </div>

            <div className="editor-wrapper">
              <EditorContent editor={editor} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}