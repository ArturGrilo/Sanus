// ServiceFormSpecialtiesTab.jsx
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

// 🔹 Tiptap (Rich Text Editor) para a big_description
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

// ✅ Custom Heading: quando for H2, guarda como <header><h2>...</h2></header>
const HeadingWithHeader = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level;
    if (level !== 2) return ["h" + level, HTMLAttributes, 0];
    return ["header", {}, ["h2", HTMLAttributes, 0]];
  },
});

function RichTextEditor({ value, onChange, placeholder = "Escreve a descrição longa…" }) {
  const initial = value && String(value).trim().length > 0 ? value : `<p>${placeholder}</p>`;
  const [localHtml, setLocalHtml] = useState(initial);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      HeadingWithHeader.configure({ levels: [2, 3] }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Underline,
    ],
    content: initial,
    autofocus: false,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      setLocalHtml(html);
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const next =
      value && String(value).trim().length > 0 ? value : `<p>${placeholder}</p>`;

    setLocalHtml(next);
    if (editor.getHTML() !== next) editor.commands.setContent(next);
  }, [value, editor, placeholder]);

  const plainText = useMemo(() => {
    const tmp = document.createElement("div");
    tmp.innerHTML = localHtml || "";
    return tmp.textContent || tmp.innerText || "";
  }, [localHtml]);

  const isActive = (name, attrs = {}) => editor?.isActive(name, attrs);

  const run = (fn) => {
    if (!editor) return;
    editor.chain().focus()[fn]().run();
  };

  if (!editor) {
    return (
      <div className="editor-wrapper">
        <div className="skeleton">A carregar editor…</div>
      </div>
    );
  }

  return (
    <div className="sv-richfield">
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

        <button
          type="button"
          className={isActive("strike") ? "active" : ""}
          onClick={() => run("toggleStrike")}
          aria-label="Riscado"
          title="Riscado"
        >
          S
        </button>

        <span className="toolbar-sep" />

        <button
          type="button"
          className={isActive("heading", { level: 2 }) ? "active" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          Título
        </button>

        <button
          type="button"
          className={isActive("heading", { level: 3 }) ? "active" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
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
          title="Citação / Destaque"
          aria-label="Citação"
        >
          “”
        </button>

        <button
          type="button"
          onClick={() => run("setHorizontalRule")}
          aria-label="Separador"
          title="Separador"
        >
          — —
        </button>

        <span className="toolbar-sep" />

        <button
          type="button"
          className={isActive("link") ? "active" : ""}
          onClick={() => {
            const url = window.prompt("Insere o link (https://…):");
            if (!url) return;
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
        >
          🔗 Link
        </button>

        <button type="button" onClick={() => editor.chain().focus().unsetLink().run()}>
          ❌ Link
        </button>

        <span className="toolbar-sep" />

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Limpar formatação"
          aria-label="Limpar formatação"
        >
          Tx
        </button>

        <span className="toolbar-sep" />

        <button type="button" onClick={() => editor.chain().focus().undo().run()}>
          ↺
        </button>

        <button type="button" onClick={() => editor.chain().focus().redo().run()}>
          ↻
        </button>
      </div>

      <div className="editor-wrapper">
        <EditorContent editor={editor} />
      </div>

      <div className="meta-row">
        <small>{plainText.trim().split(/\s+/).filter(Boolean).length} palavras</small>
      </div>
    </div>
  );
}

export default function ServiceFormSpecialtiesTab({ specialties, setSpecialties }) {
  const API = import.meta.env.VITE_BACKEND_URL;

  // ✅ Accordion: guarda o ID aberto (single open)
  const [openId, setOpenId] = useState(null);

  // ✅ Se removeres/alterares lista, garante que openId existe
  useEffect(() => {
    if (!openId) return;
    const stillExists = specialties.some((s) => (s.id || "") === openId);
    if (!stillExists) setOpenId(null);
  }, [specialties, openId]);

  const updateItem = (index, patch) => {
    const copy = [...specialties];
    copy[index] = { ...copy[index], ...patch };
    setSpecialties(copy);
  };

  const moveItem = (from, to) => {
    if (to < 0 || to >= specialties.length) return;
    const copy = [...specialties];
    const tmp = copy[from];
    copy[from] = copy[to];
    copy[to] = tmp;
    setSpecialties(copy);
  };

  const removeItem = (index) => {
    setSpecialties(specialties.filter((_, i) => i !== index));
  };

  const addItem = () => {
    const id = uuidv4();
    setSpecialties([
      ...specialties,
      {
        id,
        order: specialties.length + 1,
        title: "",
        subtitle: "",
        slug: "",
        small_description: "",
        big_description: "",
        image: "",
      },
    ]);

    // ✅ abre automaticamente o novo item
    setOpenId(id);
  };

  const handleUpload = async (index, file) => {
    const item = specialties[index];
    if (!item?.id) return;

    const serviceId = window.location.pathname.split("/").pop();

    const sigRes = await fetch(`${API}/storage/service-specialty-upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        serviceId,
        itemId: item.id,
        previousUrl: item.image || item.imageUrl || "",
      }),
    });

    if (!sigRes.ok) throw new Error("Falha ao obter URL assinado (specialty).");

    const { uploadUrl, publicUrl } = await sigRes.json();

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!putRes.ok) throw new Error("Falha no upload da imagem (specialty).");

    updateItem(index, { image: publicUrl, imageUrl: publicUrl });
  };

  const toggleOpen = (id) => {
    setOpenId((curr) => (curr === id ? null : id));
  };

  return (
    <div className="sv-tabpanel">
      <div className="sv-section-head">
        <div>
          <h3>Especialidades</h3>
          <p className="sv-muted">
            Gestão das sub-páginas / áreas dentro do serviço (título, slug, descrições e imagem).
          </p>
        </div>

        <button type="button" className="btn btn-secundary" onClick={addItem}>
          + Adicionar especialidade
        </button>
      </div>

      <div className="indications-admin-list">
        {specialties.map((sp, index) => {
          const id = sp.id || String(index);
          const isOpen = openId === id;

          return (
            <div key={id} className={`indication-admin-card ${isOpen ? "is-open" : ""}`}>
              {/* ✅ Accordion header */}
              <button
                type="button"
                className="sv-acc-head"
                onClick={() => toggleOpen(id)}
                aria-expanded={isOpen}
              >
                <div className="sv-acc-left">
                  <span className="sv-acc-order">{sp.order ?? index + 1}</span>
                  <div className="sv-acc-titles">
                    <div className="sv-acc-title">
                      {sp.title?.trim() ? sp.title : "Nova especialidade"}
                    </div>
                    <div className="sv-acc-sub">
                      {sp.slug?.trim() ? `/${sp.slug}` : "slug por definir"}
                      {sp.subtitle?.trim() ? ` • ${sp.subtitle}` : ""}
                    </div>
                  </div>
                </div>

                <div className="sv-acc-right">
                  <span className="sv-acc-chevron" aria-hidden="true">
                    {isOpen ? "▾" : "▸"}
                  </span>
                </div>
              </button>

              {/* ✅ Só renderiza os detalhes quando aberto */}
              {isOpen && (
                <div className="sv-acc-body">
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      placeholder="Ordem (ex: 1)"
                      style={{ width: 120 }}
                      value={sp.order ?? index + 1}
                      onChange={(e) => updateItem(index, { order: e.target.value })}
                    />

                    <input
                      placeholder="Slug (ex: musculo-esqueletica)"
                      value={sp.slug || ""}
                      onChange={(e) => updateItem(index, { slug: e.target.value })}
                    />
                  </div>

                  <input
                    placeholder="Título (ex: Fisioterapia Músculo-Esquelética)"
                    value={sp.title || ""}
                    onChange={(e) => updateItem(index, { title: e.target.value })}
                  />

                  <input
                    placeholder="Subtítulo (opcional)"
                    value={sp.subtitle || ""}
                    onChange={(e) => updateItem(index, { subtitle: e.target.value })}
                  />

                  <textarea
                    placeholder="Descrição curta (small_description)"
                    value={sp.small_description || ""}
                    onChange={(e) => updateItem(index, { small_description: e.target.value })}
                    rows={3}
                  />

                  <div style={{ marginTop: 6 }}>
                    <div style={{ marginBottom: 6, fontWeight: 600, opacity: 0.85 }}>
                      Descrição longa (big_description)
                    </div>

                    <RichTextEditor
                      value={sp.big_description || ""}
                      onChange={(html) => updateItem(index, { big_description: html })}
                      placeholder="Escreve a descrição longa (com títulos, listas e destaques)…"
                    />
                  </div>

                  <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        try {
                          await handleUpload(index, file);
                        } catch (err) {
                          console.error(err);
                          alert(err?.message || "Erro no upload.");
                        }
                      }}
                    />

                    {(sp.image || sp.imageUrl) && (
                      <img
                        src={sp.image || sp.imageUrl}
                        alt=""
                        style={{ maxWidth: 260, borderRadius: 12 }}
                      />
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secundary"
                      onClick={() => moveItem(index, index - 1)}
                      disabled={index === 0}
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      className="btn btn-secundary"
                      onClick={() => moveItem(index, index + 1)}
                      disabled={index === specialties.length - 1}
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeItem(index)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {specialties.length === 0 && (
        <div className="sv-empty">
          Ainda não tens especialidades. Clica em “Adicionar especialidade”.
        </div>
      )}
    </div>
  );
}
