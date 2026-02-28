import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Header from "./Header";
import "./BlogForm.css";
import "./ServiceForm.css";
import { authedFetch } from "../lib/authedFetch";

// Tabs
import ServiceFormBaseTab from "./ServiceFormBaseTab";
import ServiceFormContentTab from "./ServiceFormContentTab";
import ServiceFormTreatmentTypesTab from "./ServiceFormTreatmentTypesTab";
import ServiceFormTreatmentStepsTab from "./ServiceFormTreatmentStepsTab";
import ServiceFormIndicationsTab from "./ServiceFormIndicationsTab";
import ServiceFormSpecialtiesTab from "./ServiceFormSpecialtiesTab";

// ✅ NOVOS TABS
import ServiceFormBenefitsTab from "./ServiceFormBenefitsTab";
import ServiceFormFaqsTab from "./ServiceFormFaqsTab";
import ServiceFormCtaSectionTab from "./ServiceFormCtaSectionTab";

// Tiptap para bigger_description (serviço)
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
  const { id } = useParams(); // ✅ docId do Firestore
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;

  const [activeTab, setActiveTab] = useState("base");

  // Base
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [slug, setSlug] = useState("");
  const [text, setText] = useState("");
  const [biggerDescription, setBiggerDescription] = useState(""); // HTML
  const [ctaText, setCtaText] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // Existing blocks
  const [indications, setIndications] = useState([]);
  const [treatmentSteps, setTreatmentSteps] = useState([]);
  const [treatmentTypes, setTreatmentTypes] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  // ✅ NOVOS CAMPOS
  const [benefits, setBenefits] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [ctaSection, setCtaSection] = useState({ btn_text: "", cta_text: "" });

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
        // ✅ authedFetch já devolve JSON (data)
        const data = await authedFetch(`${API}/admin/services/${id}`, { method: "GET" });

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
        setSpecialties(Array.isArray(data.specialties) ? data.specialties : []);

        // ✅ NOVOS
        setBenefits(Array.isArray(data.benefits) ? data.benefits : []);
        setFaqs(Array.isArray(data.faqs) ? data.faqs : []);
        setCtaSection(
          data.cta_section && typeof data.cta_section === "object"
            ? {
                btn_text: data.cta_section.btn_text || "",
                cta_text: data.cta_section.cta_text || "",
              }
            : { btn_text: "", cta_text: "" }
        );
      } catch (err) {
        console.error(err);
        setError(err?.message || "Não foi possível carregar o serviço.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, API]);

  // ============================================================
  // 🔹 TIPTAP EDITOR (Descrição detalhada do serviço)
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

  useEffect(() => {
    if (biggerEditor && !loading) {
      biggerEditor.commands.setContent(biggerDescription || "<p></p>");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biggerEditor, loading]);

  const biggerPlainText = useMemo(() => {
    const tmp = document.createElement("div");
    tmp.innerHTML = biggerDescription || "";
    return tmp.textContent || tmp.innerText || "";
  }, [biggerDescription]);

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
        icon: String(s?.icon || "").trim(),
        title: String(s?.title || "").trim(),
        bullets: Array.isArray(s?.bullets)
          ? s.bullets.map((b) => String(b || "").trim()).filter(Boolean)
          : [],
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  // ✅ FIX: preservar imageUrl (e retrocompat image)
  const normalizeTreatmentTypes = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((t, idx) => ({
        id: t?.id || uuidv4(),
        order: Number.isFinite(Number(t?.order)) ? Number(t.order) : idx + 1,
        icon: String(t?.icon || "").trim(),
        title: String(t?.title || "").trim(),
        subtitle: String(t?.subtitle || "").trim(),
        imageUrl: String(t?.imageUrl || t?.image || "").trim(), // ✅ novo
        image: String(t?.image || t?.imageUrl || "").trim(),     // ✅ retrocompat (opcional)
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
        image: String(s?.image || s?.imageUrl || "").trim(),
        imageUrl: String(s?.imageUrl || s?.image || "").trim(),
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  const normalizeBenefits = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(Boolean)
      .map((b) => ({
        title: String(b?.title || "").trim(),
        bullets: Array.isArray(b?.bullets)
          ? b.bullets.map((x) => String(x || "").trim()).filter(Boolean)
          : [],
      }))
      .filter((b) => b.title.length > 0 || b.bullets.length > 0);
  };

  const normalizeFaqs = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr
      .filter(Boolean)
      .map((f) => ({
        question: String(f?.question || "").trim(),
        answer: String(f?.answer || "").trim(),
      }))
      .filter((f) => f.question.length > 0 || f.answer.length > 0);
  };

  const normalizeCtaSection = (obj) => {
    const o = obj && typeof obj === "object" ? obj : {};
    return {
      btn_text: String(o.btn_text || "").trim(),
      cta_text: String(o.cta_text || "").trim(),
    };
  };

  // ============================================================
  // 🔹 SUBMIT
  // ============================================================
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const clean = (s) => String(s || "").trim();

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
        const { uploadUrl, publicUrl } = await authedFetch(`${API}/storage/service-upload-url`, {
          method: "POST",
          body: JSON.stringify({
            fileName: imageFile.name,
            contentType: imageFile.type,
            serviceId: id || null,
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

      const normalizedSteps = normalizeTreatmentSteps(treatmentSteps);
      const normalizedTypes = normalizeTreatmentTypes(treatmentTypes);
      const normalizedSpecialties = normalizeSpecialties(specialties);

      const normalizedBenefits = normalizeBenefits(benefits);
      const normalizedFaqs = normalizeFaqs(faqs);
      const normalizedCtaSection = normalizeCtaSection(ctaSection);

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
        specialties: normalizedSpecialties,

        benefits: normalizedBenefits,
        faqs: normalizedFaqs,
        cta_section: normalizedCtaSection,
      };

      const method = id ? "PUT" : "POST";
      const endpoint = id ? `${API}/admin/services/${id}` : `${API}/admin/services`;

      await authedFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      navigate("/admin/services", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err?.message || "Erro ao guardar o serviço.");
    } finally {
      setSaving(false);
    }
  }

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : imageUrl || "";

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
                <button
                  type="button"
                  className="sv-tab"
                  aria-selected={activeTab === "benefits"}
                  onClick={() => setActiveTab("benefits")}
                >
                  Benefícios
                </button>
                <button
                  type="button"
                  className="sv-tab"
                  aria-selected={activeTab === "faqs"}
                  onClick={() => setActiveTab("faqs")}
                >
                  FAQs
                </button>
                <button
                  type="button"
                  className="sv-tab"
                  aria-selected={activeTab === "cta"}
                  onClick={() => setActiveTab("cta")}
                >
                  CTA
                </button>
              </div>

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
                  API={API}
                  serviceId={id} // ✅ FIX: agora o upload sabe que serviço é
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

              {activeTab === "benefits" && (
                <ServiceFormBenefitsTab benefits={benefits} setBenefits={setBenefits} />
              )}

              {activeTab === "faqs" && <ServiceFormFaqsTab faqs={faqs} setFaqs={setFaqs} />}

              {activeTab === "cta" && (
                <ServiceFormCtaSectionTab ctaSection={ctaSection} setCtaSection={setCtaSection} />
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
}