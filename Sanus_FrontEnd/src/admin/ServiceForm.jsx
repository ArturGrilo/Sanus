import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Header from "./Header";
import "./BlogForm.css";
import "./ServiceForm.css";

// Tabs (nomes conforme colocaste)
import ServiceFormBaseTab from "./ServiceFormBaseTab";
import ServiceFormContentTab from "./ServiceFormContentTab";
import ServiceFormTreatmentTypesTab from "./ServiceFormTreatmentTypesTab";
import ServiceFormTreatmentStepsTab from "./ServiceFormTreatmentStepsTab";
import ServiceFormIndicationsTab from "./ServiceFormIndicationsTab";
import ServiceFormSpecialtiesTab from "./ServiceFormSpecialtiesTab";

// 🔹 Tiptap (Rich Text Editor) para a descrição detalhada
import { useEditor } from "@tiptap/react";
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

export default function ServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;

  const [activeTab, setActiveTab] = useState("base");

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [slug, setSlug] = useState("");
  const [text, setText] = useState("");
  const [biggerDescription, setBiggerDescription] = useState(""); // HTML do editor
  const [ctaText, setCtaText] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [indications, setIndications] = useState([]);
  const [treatmentSteps, setTreatmentSteps] = useState([]);
  const [treatmentTypes, setTreatmentTypes] = useState([]);
  const [specialties, setSpecialties] = useState([]); // ✅ NOVO

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Gerar slug automaticamente (apenas ao criar)
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

  // 🔹 ADMIN: carregar serviço por ID
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API}/admin/services/${id}`);
        if (!res.ok) throw new Error("Erro ao carregar serviço");
        const data = await res.json();

        setTitle(data.title || "");
        setSubtitle(data.subtitle || "");
        setSlug(data.slug || "");
        setText(data.text || "");
        setBiggerDescription(data.bigger_description || "");
        setCtaText(data.ctaText || "");
        setImageUrl(data.image || data.imageUrl || "");

        setIndications(Array.isArray(data.indications) ? data.indications : []);
        setTreatmentSteps(Array.isArray(data.treatment_steps) ? data.treatment_steps : []);
        setTreatmentTypes(Array.isArray(data.treatment_types) ? data.treatment_types : []);

        // ✅ NOVO
        setSpecialties(Array.isArray(data.specialties) ? data.specialties : []);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar o serviço.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, API]);

  // ============================================================
  // 🔹 TIPTAP EDITOR (Descrição detalhada)
  // ============================================================
  const biggerEditor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      HeadingWithHeader.configure({ levels: [2, 3] }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Underline,
    ],
    content: "<p>Escreve a descrição detalhada…</p>",
    autofocus: false,
    onUpdate: ({ editor }) => setBiggerDescription(editor.getHTML()),
  });

  // Quando terminamos de carregar (edição), colocamos o conteúdo no editor
  useEffect(() => {
    if (biggerEditor && !loading) {
      biggerEditor.commands.setContent(biggerDescription || "<p></p>");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biggerEditor, loading]);

  // 🔸 Util para contar palavras (texto sem HTML)
  const biggerPlainText = useMemo(() => {
    const tmp = document.createElement("div");
    tmp.innerHTML = biggerDescription || "";
    return tmp.textContent || tmp.innerText || "";
  }, [biggerDescription]);

  // 🔸 Toolbar helpers
  const isActiveBigger = (name, attrs = {}) => biggerEditor?.isActive(name, attrs);
  const runBigger = (fn) => biggerEditor?.chain().focus()[fn]().run();

  // ============================================================
  // 🔹 HELPERS: Normalização
  // ============================================================
  const normalizeTreatmentSteps = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((s, idx) => ({
        id: s?.id || uuidv4(),
        order: Number.isFinite(Number(s?.order)) ? Number(s.order) : idx + 1,
        icon: (s?.icon || "").trim(),
        title: (s?.title || "").trim(),
        bullets: Array.isArray(s?.bullets)
          ? s.bullets.map((b) => String(b || "").trim()).filter(Boolean)
          : [],
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  const normalizeTreatmentTypes = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((t, idx) => ({
        id: t?.id || uuidv4(),
        order: Number.isFinite(Number(t?.order)) ? Number(t.order) : idx + 1,
        icon: (t?.icon || "").trim(),
        title: (t?.title || "").trim(),
        subtitle: (t?.subtitle || "").trim(),
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  const normalizeSpecialties = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((s, idx) => ({
        id: s?.id || uuidv4(),
        order: Number.isFinite(Number(s?.order)) ? Number(s.order) : idx + 1,
        title: String(s?.title || "").trim(),
        subtitle: String(s?.subtitle || "").trim(),
        slug: String(s?.slug || "").trim(),
        small_description: String(s?.small_description || "").trim(),
        big_description: String(s?.big_description || "").trim(),
        // compat: aceita imageUrl/image
        image: String(s?.image || s?.imageUrl || "").trim(),
        imageUrl: String(s?.imageUrl || s?.image || "").trim(),
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  // ============================================================
  // 🔹 SUBMIT
  // ============================================================
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const clean = (s) => (s || "").trim();

    if (!clean(title) || !clean(slug)) {
      setError("Preenche pelo menos Título e Slug.");
      setActiveTab("base");
      return;
    }

    try {
      setSaving(true);
      let finalImageUrl = imageUrl;

      // 1️⃣ Upload imagem principal do serviço
      if (imageFile) {
        const sigRes = await fetch(`${API}/storage/service-upload-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: imageFile.name,
            contentType: imageFile.type,
            serviceId: id || null,
          }),
        });

        if (!sigRes.ok) throw new Error("Falha ao obter URL assinado");
        const { uploadUrl, publicUrl } = await sigRes.json();

        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": imageFile.type },
          body: imageFile,
        });

        if (!putRes.ok) throw new Error("Falha no upload da imagem");
        finalImageUrl = publicUrl;
      }

      const normalizedSteps = normalizeTreatmentSteps(treatmentSteps);
      const normalizedTypes = normalizeTreatmentTypes(treatmentTypes);
      const normalizedSpecialties = normalizeSpecialties(specialties);

      const payload = {
        title: clean(title),
        subtitle: clean(subtitle),
        slug: clean(slug),
        text: clean(text),
        bigger_description: biggerDescription || "",
        ctaText: clean(ctaText),
        image: finalImageUrl,
        imageUrl: finalImageUrl,
        indications: Array.isArray(indications) ? indications : [],
        treatment_steps: normalizedSteps,
        treatment_types: normalizedTypes,

        // ✅ NOVO
        specialties: normalizedSpecialties,
      };

      const method = id ? "PUT" : "POST";
      const endpoint = id ? `${API}/admin/services/${id}` : `${API}/admin/services`;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao guardar o serviço");

      navigate("/admin/services", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao guardar o serviço.");
    } finally {
      setSaving(false);
    }
  }

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : imageUrl || "";

  // ============================================================
  // 🔹 RENDER
  // ============================================================
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
            <button form="serviceform" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "A guardar…" : "Guardar"}
            </button>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="skeleton">A carregar…</div>
        ) : (
          <form id="serviceform" onSubmit={handleSubmit} className="form-card">
            {/* Tabs header */}
            <div className="sv-tabs">
              <div className="sv-tablist">
                <button
                  type="button"
                  className="sv-tab"
                  aria-selected={activeTab === "base"}
                  onClick={() => setActiveTab("base")}
                >
                  Base
                </button>

                <button
                  type="button"
                  className="sv-tab"
                  aria-selected={activeTab === "content"}
                  onClick={() => setActiveTab("content")}
                >
                  Conteúdo
                </button>

                <button
                  type="button"
                  className="sv-tab"
                  aria-selected={activeTab === "types"}
                  onClick={() => setActiveTab("types")}
                >
                  Técnicas
                </button>

                <button
                  type="button"
                  className="sv-tab"
                  aria-selected={activeTab === "steps"}
                  onClick={() => setActiveTab("steps")}
                >
                  Etapas
                </button>

                <button
                  type="button"
                  className="sv-tab"
                  aria-selected={activeTab === "indications"}
                  onClick={() => setActiveTab("indications")}
                >
                  Indicações
                </button>

                <button
                  type="button"
                  className="sv-tab"
                  aria-selected={activeTab === "specialties"}
                  onClick={() => setActiveTab("specialties")}
                >
                  Especialidades
                </button>
              </div>

              {/* Tabs content */}
              {activeTab === "base" && (
                <ServiceFormBaseTab
                  title={title}
                  setTitle={setTitle}
                  subtitle={subtitle}
                  setSubtitle={setSubtitle}
                  slug={slug}
                  setSlug={setSlug}
                  text={text}
                  setText={setText}
                  ctaText={ctaText}
                  setCtaText={setCtaText}
                  imageUrl={imageUrl}
                  setImageFile={setImageFile}
                  previewUrl={previewUrl}
                />
              )}

              {activeTab === "content" && (
                <ServiceFormContentTab
                  biggerEditor={biggerEditor}
                  biggerPlainText={biggerPlainText}
                  isActiveBigger={isActiveBigger}
                  runBigger={runBigger}
                />
              )}

              {activeTab === "types" && (
                <ServiceFormTreatmentTypesTab
                  treatmentTypes={treatmentTypes}
                  setTreatmentTypes={setTreatmentTypes}
                  error={error}
                />
              )}

              {activeTab === "steps" && (
                <ServiceFormTreatmentStepsTab
                  treatmentSteps={treatmentSteps}
                  setTreatmentSteps={setTreatmentSteps}
                />
              )}

              {activeTab === "indications" && (
                <ServiceFormIndicationsTab
                  indications={indications}
                  setIndications={setIndications}
                  API={API}
                  serviceId={id}
                  setError={setError}
                />
              )}

              {activeTab === "specialties" && (
                <ServiceFormSpecialtiesTab
                  specialties={specialties}
                  setSpecialties={setSpecialties}
                  API={API}
                  serviceId={id}
                  setError={setError}
                />
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
