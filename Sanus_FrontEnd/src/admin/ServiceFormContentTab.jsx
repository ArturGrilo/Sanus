// ContentTab.jsx
import { EditorContent } from "@tiptap/react";

export default function ContentTab({
  biggerEditor,
  biggerPlainText,
  isActiveBigger,
  runBigger,
}) {
  return (
    <section className="sv-tabpanel">
      <div className="sv-form-section">
        <div className="sv-form-section-title">
          <h3>Conteúdo</h3>
          <p>Detailed description (rich text)</p>
        </div>

        <label>
          <span>Descrição detalhada</span>

          <div className="editor-toolbar">
            <button
              type="button"
              className={isActiveBigger("bold") ? "active" : ""}
              onClick={() => runBigger("toggleBold")}
              aria-label="Negrito"
            >
              B
            </button>
            <button
              type="button"
              className={isActiveBigger("italic") ? "active" : ""}
              onClick={() => runBigger("toggleItalic")}
              aria-label="Itálico"
            >
              I
            </button>
            <button
              type="button"
              className={isActiveBigger("underline") ? "active" : ""}
              onClick={() => runBigger("toggleUnderline")}
              aria-label="Sublinhado"
            >
              U
            </button>

            <span className="toolbar-sep" />

            <button
              type="button"
              className={isActiveBigger("heading", { level: 2 }) ? "active" : ""}
              onClick={() => biggerEditor?.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              Título
            </button>

            <button
              type="button"
              className={isActiveBigger("heading", { level: 3 }) ? "active" : ""}
              onClick={() => biggerEditor?.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              Subtítulo
            </button>

            <span className="toolbar-sep" />

            <button
              type="button"
              className={isActiveBigger("bulletList") ? "active" : ""}
              onClick={() => runBigger("toggleBulletList")}
            >
              • Lista
            </button>

            <button
              type="button"
              className={isActiveBigger("orderedList") ? "active" : ""}
              onClick={() => runBigger("toggleOrderedList")}
            >
              1. Lista
            </button>

            <span className="toolbar-sep" />

            <button
              type="button"
              className={isActiveBigger("link") ? "active" : ""}
              onClick={() => {
                const url = window.prompt("Insere o link (https://…):");
                if (!url) return;
                biggerEditor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
              }}
            >
              🔗 Link
            </button>

            <button type="button" onClick={() => biggerEditor?.chain().focus().unsetLink().run()}>
              ❌ Link
            </button>

            <span className="toolbar-sep" />

            <button type="button" onClick={() => biggerEditor?.chain().focus().undo().run()}>
              ↺
            </button>
            <button type="button" onClick={() => biggerEditor?.chain().focus().redo().run()}>
              ↻
            </button>
          </div>

          <div className="editor-wrapper">
            <EditorContent editor={biggerEditor} />
          </div>

          <div className="meta-row">
            <small>{biggerPlainText.trim().split(/\s+/).filter(Boolean).length} palavras</small>
          </div>
        </label>
      </div>
    </section>
  );
}
