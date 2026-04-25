// service_details.jsx
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import Header from "../components/header";
import Footer from "../components/footer";
import "../styles/service_details.css";
import SanusCardsSection from "./sanus_little_cards";
import ProfilesSection from "./recrutamento_profiles";
import InBetweenWaves from "./in_between_waves";
import PageTransition from "./page_transition";
import SanusHero from "./sanus_hero";
import TextSkeleton from "./skeleton_text";
import ServiceSpecialties from "./service_specialties";
import ContactCTA from "./contact_cta_break_section";
import FAQSection from "./faq_section";

const SITE_URL = "https://sanus.pt";

function stripHtml(html = "") {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildAbsoluteImageUrl(image) {
  if (!image) return `${SITE_URL}/Clinica/foto4.jpeg`;
  if (image.startsWith("http")) return image;
  if (image.startsWith("/")) return `${SITE_URL}${image}`;
  return `${SITE_URL}/${image}`;
}

export default function ServicoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [servico, setServico] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    let alive = true;

    async function loadService() {
      try {
        const res = await fetch(`${API}/services/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!alive) return;
        setServico(data);
      } catch (err) {
        console.error("Erro ao carregar serviço:", err);
        if (!alive) return;
        setServico(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    setLoading(true);
    loadService();

    return () => {
      alive = false;
    };
  }, [id, API]);

  useEffect(() => {
    if (loading) return;

    const hash = location.hash;

    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    let rafId = null;
    let tries = 0;
    const maxTries = 90;

    const tryScroll = () => {
      const el = document.querySelector(hash);

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      tries += 1;
      if (tries >= maxTries) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      rafId = window.requestAnimationFrame(tryScroll);
    };

    rafId = window.requestAnimationFrame(tryScroll);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [location.hash, loading]);

  const steps = useMemo(() => {
    const raw = servico?.treatment_steps;
    if (!Array.isArray(raw) || raw.length === 0) return [];

    return raw
      .filter(Boolean)
      .map((s, idx) => ({
        order: Number.isFinite(Number(s.order)) ? Number(s.order) : idx + 1,
        iconText: String(s.icon || String(idx + 1)).trim(),
        title: String(s.title || "").trim(),
        bullets: Array.isArray(s.bullets)
          ? s.bullets.map((b) => String(b || "").trim()).filter(Boolean)
          : [],
      }))
      .filter((s) => s.title || s.bullets.length > 0)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((s) => ({
        icon: <span>{s.iconText}</span>,
        title: s.title,
        steps: s.bullets,
      }));
  }, [servico]);

  const treatmentTypesItems = useMemo(() => {
    const raw = servico?.treatment_types;
    if (!Array.isArray(raw) || raw.length === 0) return [];

    return raw
      .filter(Boolean)
      .map((t, idx) => ({
        order: Number.isFinite(Number(t.order)) ? Number(t.order) : idx + 1,
        iconName: String(t.icon || "").trim(),
        title: String(t.title || "").trim(),
        subtitle: String(t.subtitle || "").trim(),
        imageUrl: String(t.imageUrl || t.image || "").trim(),
      }))
      .filter((t) => t.title.length > 0 || t.subtitle.length > 0)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((t) => ({
        iconName: t.iconName,
        title: t.title || "—",
        desc: t.subtitle || "",
        imageUrl: t.imageUrl || "",
      }));
  }, [servico]);

  const indicationsCards = useMemo(() => {
    const raw = servico?.indications;
    if (!Array.isArray(raw) || raw.length === 0) return [];

    return raw
      .filter((x) => x && (x.title || x.imageUrl || x.image))
      .map((x, idx) => ({
        id: x.id || String(idx),
        image: x.imageUrl || x.image || "",
        subtitle: x.subtitle || "",
        title: x.title || "",
        text: x.text || "",
        alt: x.alt || x.title || "Indicação",
      }));
  }, [servico]);

  const specialtiesList = useMemo(() => {
    const raw = servico?.specialties;
    return Array.isArray(raw) ? raw.filter(Boolean) : [];
  }, [servico]);

  const serviceSlugForSpecialties = useMemo(() => {
    return String(servico?.slug || id || "").trim();
  }, [servico, id]);

  const benefitsItems = useMemo(() => {
    const raw = servico?.benefits;
    if (!Array.isArray(raw) || raw.length === 0) return [];

    return raw
      .filter(Boolean)
      .map((b, idx) => ({
        iconText: String(idx + 1),
        title: String(b?.title || "").trim(),
        bullets: Array.isArray(b?.bullets)
          ? b.bullets.map((x) => String(x || "").trim()).filter(Boolean)
          : [],
      }))
      .filter((b) => b.title.length > 0 || b.bullets.length > 0)
      .map((b) => ({
        icon: <span>{b.iconText}</span>,
        title: b.title || "—",
        steps: b.bullets,
      }));
  }, [servico]);

  const faqsItems = useMemo(() => {
    const raw = servico?.faqs;
    if (!Array.isArray(raw) || raw.length === 0) return [];

    return raw
      .filter(Boolean)
      .map((f) => ({
        question: String(f?.question || "").trim(),
        answer: String(f?.answer || "").trim(),
      }))
      .filter((f) => f.question.length > 0 || f.answer.length > 0);
  }, [servico]);

  const ctaSection = useMemo(() => {
    const raw = servico?.cta_section;
    if (!raw || typeof raw !== "object") return null;

    const btnText = String(raw.btn_text || "").trim();
    const ctaText = String(raw.cta_text || "").trim();

    if (!btnText && !ctaText) return null;

    return { btnText, ctaText };
  }, [servico]);

  const seo = useMemo(() => {
    if (!servico) return null;

    const title = servico.title || "Serviço";
    const slug = servico.slug || id;
    const canonicalUrl = `${SITE_URL}/servicos/${slug}`;
    const imageUrl = buildAbsoluteImageUrl(servico.image || servico.imageUrl);

    const rawText =
      stripHtml(servico.bigger_description) ||
      servico.subtitle ||
      `Serviço clínico personalizado na Sanus Vitae, no Barreiro.`;

    const description =
      rawText.length > 155 ? `${rawText.slice(0, 152).trim()}...` : rawText;

    const seoTitle = `${title} no Barreiro | Sanus Vitae`;

    const keywords = [
      title,
      `${title} Barreiro`,
      `clínica ${title} Barreiro`,
      "fisioterapia Barreiro",
      "Sanus Vitae",
      "clínica Sanus Vitae Barreiro",
    ].join(", ");

    const schema = {
      "@context": "https://schema.org",
      "@type": "MedicalTherapy",
      name: title,
      description,
      image: imageUrl,
      url: canonicalUrl,
      areaServed: {
        "@type": "City",
        name: "Barreiro",
      },
      provider: {
        "@type": "MedicalClinic",
        name: "Sanus Vitae",
        url: SITE_URL,
      },
    };

    return {
      title: seoTitle,
      description,
      keywords,
      canonicalUrl,
      imageUrl,
      schema,
    };
  }, [servico, id]);

  if (loading) {
    return (
      <>
        <Helmet>
          <title>A carregar serviço | Sanus Vitae</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <PageTransition>
          <Header />
          <SanusHero />
          <section className="sanus-servico-content">
            <div className="sanus-servico-container">
              <TextSkeleton />
            </div>
          </section>
          <Footer />
        </PageTransition>
      </>
    );
  }

  if (!servico) {
    return (
      <>
        <Helmet>
          <title>Serviço não encontrado | Sanus Vitae</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>

        <PageTransition>
          <Header />
          <SanusHero
            title="Serviço não encontrado"
            subtitle=""
            imageUrl="/Clinica/foto4.jpeg"
            height="480px"
            titleSize="2rem"
            subtitleSize="1.2rem"
          />
          <section className="sanus-servico-content">
            <div className="sanus-servico-container">
              <button
                className="btn btn-secundary sanus-service-details-back-button"
                onClick={() => navigate("/servicos")}
              >
                Voltar
              </button>
            </div>
          </section>
          <Footer />
        </PageTransition>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={seo.canonicalUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:locale" content="pt_PT" />
        <meta property="og:site_name" content="Sanus Vitae" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={seo.canonicalUrl} />
        <meta property="og:image" content={seo.imageUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={seo.imageUrl} />

        <script type="application/ld+json">
          {JSON.stringify(seo.schema)}
        </script>
      </Helmet>

      <PageTransition>
        <Header />

        <SanusHero
          title={servico.title || "Serviço"}
          subtitle={servico.subtitle || ""}
          imageUrl={servico.image || servico.imageUrl || "/Clinica/foto4.jpeg"}
        />

        <section className="sanus-servico-content">
          <div className="sanus-servico-container">
            <article
              className="sanus-servico-detail-body"
              dangerouslySetInnerHTML={{
                __html: servico.bigger_description || "",
              }}
            />
          </div>
        </section>

        {indicationsCards.length > 0 && (
          <section style={{ marginTop: "2.5rem" }} className="sanus-services-indications">
            <SanusCardsSection
              title="Quando é indicado?"
              subtitle=""
              cards={indicationsCards}
              showWaves={true}
            />
          </section>
        )}

        {steps.length > 0 && (
          <section style={{ marginTop: "-.5px" }}>
            <ProfilesSection
              title="O nosso método"
              subtitle="Acompanhamento contínuo"
              items={steps}
              zdeIndex={9}
            />
          </section>
        )}

        <InBetweenWaves />

        {treatmentTypesItems.length > 0 && (
          <section style={{ marginTop: "-.5px", position: "relative", zIndex: 3 }}>
            <ProfilesSection
              title="Como tratamos"
              subtitle="Abordagem terapêutica"
              items={treatmentTypesItems}
              zdeIndex={10}
              showTopSvg={false}
            />
          </section>
        )}

        <InBetweenWaves color="var(--color-primary-alt)" />

        {benefitsItems.length > 0 && (
          <section id="benefits" style={{ marginTop: "-0.5px" }}>
            <ProfilesSection
              title="Benefícios"
              subtitle="O que pode esperar"
              items={benefitsItems}
              zdeIndex={9}
              showTopSvg={false}
            />
          </section>
        )}

        {specialtiesList.length > 0 && (
          <div>
            <InBetweenWaves color="var(--color-primary-dark)" />
            <section
              id="specialties"
              className="sanus-service-specialties"
              style={{ marginTop: "-.5px", zIndex: 10, position: "relative" }}
            >
              <ServiceSpecialties
                specialties={specialtiesList}
                loading={false}
                subtitle="Áreas de intervenção"
                title="Especialidades"
                serviceSlug={serviceSlugForSpecialties}
              />
            </section>
          </div>
        )}

        {ctaSection && (
          <section style={{ position: "relative" }}>
            <svg
              className="sv-services-waves"
              style={{ zIndex: 2, bottom: "98%" }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
            >
              <path
                fill="var(--color-primary-dark)"
                fillOpacity="1"
                d="M0,128L120,154.7C240,181,480,235,720,261.3C960,288,1200,288,1320,288L1440,288L1440,320L0,320Z"
              />
            </svg>

            <div
              style={{ position: "relative", zIndex: 12, marginTop: "-2px" }}
              className="sanus-services-page-cta-container"
            >
              <ContactCTA
                title={ctaSection.ctaText}
                buttonText={ctaSection.btnText}
                buttonLink="/agendar"
              />
            </div>
          </section>
        )}

        <section style={{ marginBottom: "-80px", marginTop: "40px" }}>
          <FAQSection title="Perguntas Frequentes" subtitle="Serviços" faqs={faqsItems} />
        </section>

        <div className="sanus-about-us-footer">
          <Footer />
        </div>
      </PageTransition>
    </>
  );
}