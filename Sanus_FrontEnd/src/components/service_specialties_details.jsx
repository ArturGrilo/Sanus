import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import WhatsappButton from "./whatsapp_button";
import TextSkeleton from "./skeleton_text";
import PageTransition from "./page_transition";
import SanusHero from "./sanus_hero";
import "../styles/service_specialties_details.css";

export default function ServiceSpecialtyDetail() {
  const { serviceSlug, specialtySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [service, setService] = useState(null);
  const [specialty, setSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_BACKEND_URL;

  // ✅ URL de origem (para voltar exatamente ao sítio certo)
  const from = useMemo(() => {
    const raw = location?.state?.from;
    return typeof raw === "string" && raw.trim() ? raw : "";
  }, [location]);

  const backSmart = useCallback(() => {
    // 1) Se temos "from", voltamos para lá (inclui #specialties)
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    // 2) Fallback “sempre correto”
    navigate(`/servicos/${serviceSlug}#specialties`, { replace: true });
  }, [from, navigate, serviceSlug]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch(`${API}/services/${serviceSlug}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const list = Array.isArray(data?.specialties) ? data.specialties : [];

        const wanted = String(specialtySlug || "").toLowerCase().trim();
        const found = list.find((s) => {
          const current = String(s?.slug || "").toLowerCase().trim();
          return current && wanted && current === wanted;
        });

        if (!alive) return;
        setService(data);
        setSpecialty(found || null);
      } catch (err) {
        console.error("Erro ao carregar especialidade:", err);
        if (!alive) return;
        setService(null);
        setSpecialty(null);
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    load();

    return () => {
      alive = false;
    };
  }, [API, serviceSlug, specialtySlug]);

  const heroTitle = useMemo(() => {
    if (loading) return "A carregar…";
    if (!specialty) return "Especialidade não encontrada";
    return specialty.title || "Especialidade";
  }, [loading, specialty]);

  const heroSubtitle = useMemo(() => {
    if (loading) return "";
    if (!specialty) return "";
    return specialty.subtitle || (service?.title ? `Serviço: ${service.title}` : "");
  }, [loading, specialty, service]);

  const heroImage = useMemo(() => {
    if (loading) return "/Clinica/foto8.jpeg";
    if (!specialty) return "/Clinica/foto4.jpeg";

    return (
      specialty.image ||
      specialty.imageUrl ||
      service?.image ||
      service?.imageUrl ||
      "/Clinica/foto4.jpeg"
    );
  }, [loading, specialty, service]);

  if (loading) {
    return (
      <PageTransition>
        <Header />
        <SanusHero
          title={heroTitle}
          subtitle={heroSubtitle}
          imageUrl={heroImage}
          height="480px"
          titleSize="2rem"
          subtitleSize="1.2rem"
        />
        <section className="sanus-specialty-detail-content">
          <div className="sanus-specialty-detail-container">
            <TextSkeleton />
          </div>
        </section>
        <Footer />
      </PageTransition>
    );
  }

  if (!specialty) {
    return (
      <PageTransition>
        <Header />
        <SanusHero
          title={heroTitle}
          subtitle={heroSubtitle}
          imageUrl={heroImage}
          height="480px"
          titleSize="2rem"
          subtitleSize="1.2rem"
        />
        <section className="sanus-specialty-detail-content">
          <div className="sanus-specialty-detail-container">
            <button
              className="btn btn-secundary sanus-specialty-details-back-button"
              onClick={backSmart}
            >
              Voltar
            </button>
          </div>
        </section>

        <WhatsappButton />
        <div className="sanus-about-us-footer">
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Header />
      <SanusHero
        title={heroTitle}
        subtitle={heroSubtitle}
        imageUrl={heroImage}
        height="480px"
        titleSize="2rem"
        subtitleSize="1.2rem"
      />

      <section className="sanus-specialty-detail-content">
        <div className="sanus-specialty-detail-container">
          <article
            className="sanus-specialty-detail-body"
            dangerouslySetInnerHTML={{ __html: specialty.big_description || "" }}
          />
        </div>
      </section>

      <button
        className="btn btn-secundary sanus-specialty-details-back-button"
        onClick={backSmart}
      >
        Voltar
      </button>

      <WhatsappButton />
      <div className="sanus-about-us-footer">
        <Footer />
      </div>
    </PageTransition>
  );
}
