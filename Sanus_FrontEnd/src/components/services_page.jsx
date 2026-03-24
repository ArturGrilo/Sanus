// ServicesPage.jsx
import { useEffect, useState } from "react";

import Header from "./header";
import Footer from "./footer";
import PageTransition from "./page_transition";
import SanusHero from "./sanus_hero";
import ContactCTA from "./contact_cta_break_section";
import FAQSection from "./faq_section";

import "../styles/services_page.css";

import ServiceCard from "./service_card";
import ServiceCardSkeleton from "./skeleton_service_card";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_BACKEND_URL;

  // ✅ FAQ (mesmo padrão do Recrutamento)
  const faqs = [
    {
      question: "Como escolher o serviço mais indicado para mim?",
      answer:
        "Se tiver dor, limitação de movimento ou estiver em recuperação, a Fisioterapia é geralmente o ponto de partida. Se o objetivo for melhorar postura, força e controlo do movimento, o Pilates com Equipamentos é uma excelente opção. Se prefere cuidados no conforto da sua casa, os Serviços ao Domicílio permitem acompanhar o seu plano com segurança e personalização. Se tiver dúvidas, contacte-nos e ajudamos a orientar."
    },
    {
      question: "Os tratamentos são personalizados?",
      answer:
        "Sim. Cada plano é ajustado à sua condição clínica, objetivos e contexto de vida. A abordagem é baseada em evidência e a progressão é revista ao longo do acompanhamento."
    },
    {
      question: "Quantas sessões são necessárias para ver resultados?",
      answer:
        "Depende da condição, objetivos e regularidade. Algumas situações melhoram em poucas sessões; outras exigem um plano mais contínuo. Durante a avaliação definimos objetivos e um percurso realista, com reavaliações periódicas."
    },
    {
        question: "Trabalham com seguros ou acordos?",
        answer:
            "Sim, temos parcerias e acordos selecionados, que podem variar conforme o serviço e o seu plano. Para confirmarmos sem complicações, basta indicar o nome do seguro/plano (e o nº de apólice, se disponível). Em alternativa, pode consultar as parcerias na página principal do site."
    },
  ];

  useEffect(() => {
    let mounted = true;

    async function fetchServices() {
      try {
        setLoading(true);
        const res = await fetch(`${API}/services`);
        const data = await res.json();
        if (!mounted) return;
        setServices(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchServices();
    return () => {
      mounted = false;
    };
  }, [API]);

  return (
    <PageTransition>
      <Header />

      <SanusHero
        title="Serviços"
        subtitle="Cuidado personalizado, orientado para resultados."
        imageUrl="./Clinica/servicos.png"
        loading={loading}
      />

      {/* INTRO (estilo recrutamento) */}
      <section className="sanus-recrutamento-page sanus-services-page">
        <div className="sanus-recrutamento-page-container">
          <div className="feedback-comment-list" style={{ width: "100%", justifyContent: "center" }}>
            <h3>
              <span className="feedback-comment">Os nossos serviços,</span>
              <span className="feedback-comment other-color"> pensados para si.</span>
            </h3>
          </div>

          <p className="sv-lead">
            Cada plano é adaptado à sua condição clínica, objetivos e contexto de vida — com uma
            abordagem baseada na evidência e foco na sua evolução.
          </p>
        </div>
      </section>

      {/* GRID */}
      <section className="sv-services-page">
        <div className="sanus-services-container">
            {services.length === 0 ? (
            <>
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
            </>
            ) : (
            services.map((service, index) => (
            <ServiceCard
                key={service.id || index}
                image={service.image}
                subtitle={service.subtitle}
                title={service.title}
                text={service.text}
                ctaText={service.ctaText}
                alt={service.alt}
                btnStyle={service.btnStyle}
                slug={service.slug}
            />
            ))
        )}
        </div>

        {/* Waves */}
        <svg className="sv-services-waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,128L120,154.7C240,181,480,235,720,261.3C960,288,1200,288,1320,288L1440,288L1440,320L0,320Z"
          />
        </svg>

        <svg
          className="sv-services-waves"
          style={{ zIndex: 2 }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="var(--color-primary-dark)"
            fillOpacity="1"
            d="M0,128L120,154.7C240,181,480,235,720,261.3C960,288,1200,288,1320,288L1440,288L1440,320L0,320Z"
          />
        </svg>
      </section>

      {/* CTA */}
      <div style={{ position: "relative", zIndex: 12, marginTop: "-2px"}} className="sanus-services-page-cta-container">
        <ContactCTA
          title="Quer saber mais sobre os nossos serviços?"
          buttonText="Entre em contacto"
          buttonLink="/contactos"
        />
      </div>
      {/* ✅ FAQ (mesmo padrão do recrutamento) */}
      <section style={{ marginBottom: "-80px", marginTop: "40px" }}>
        <FAQSection title="Perguntas Frequentes" subtitle="Serviços" faqs={faqs} />
      </section>
      <Footer />
    </PageTransition>
  );
}
