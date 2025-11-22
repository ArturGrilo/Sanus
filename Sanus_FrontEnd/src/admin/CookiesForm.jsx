import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import "./BlogForm.css";

// Tiptap
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

export default function CookiesForm() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Editor Tiptap
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Underline,
    ],
    content: "<p>Carregando…</p>",
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  // Carregar política existente
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/cookies`);
        if (!res.ok) throw new Error("Erro ao carregar política.");
        const data = await res.json();

        setContent(data.content || "<p></p>");
        editor?.commands.setContent(data.content || "<p></p>");
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
      const res = await fetch(`${API}/cookies`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Erro ao guardar política.");

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="blogform-page">
      <Header />
      <main className="blogform-container">

        <div className="blogform-header">
          <h2>Política de Cookies</h2>

          <div className="blogform-actions">
            <button
              type="button"
              className="btn-secundary"
              onClick={() => navigate("/admin")}
            >
              Voltar
            </button>

            <button
              onClick={handleSave}
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
          <div className="form-card">

            {/* Toolbar */}
            <div className="editor-toolbar">
              <button onClick={() => editor?.chain().focus().toggleBold().run()}>B</button>
              <button onClick={() => editor?.chain().focus().toggleItalic().run()}>I</button>
              <button onClick={() => editor?.chain().focus().toggleUnderline().run()}>U</button>

              <button
                onClick={() => {
                  const url = prompt("Link:");
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
              >🔗 Link</button>

              <button onClick={() => editor?.chain().focus().unsetLink().run()}>
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