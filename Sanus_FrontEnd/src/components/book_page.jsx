// book_page.jsx (AgendarPage.jsx)
import Header from "./header";
import Footer from "./footer";
import PageTransition from "./page_transition";
import SanusHero from "./sanus_hero";
import ContactCTA from "./contact_cta_break_section";
import FAQSection from "./faq_section";
import AppointmentRequestForm from "./book_page_mail_form";

import { WhatsappLogoIcon, DeviceMobileIcon, EnvelopeIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import "../styles/book_page.css";

// ✅ Substitui estes valores pelos contactos reais
const CLINIC_PHONE_DISPLAY = "+351 928 410 954";

export default function AgendarPage() {
  const [name] = useState("");
  const [contact] = useState("");
  const [service] = useState("");
  const [message] = useState("");

  const whatsappLink = useMemo(() => {
    const base = "https://wa.me/" + CLINIC_PHONE_DISPLAY;
    const text = encodeURIComponent(
      "Olá! Gostaria de agendar.\n\nNome: " +
        (name || "-") +
        "\nContacto: " +
        (contact || "-") +
        "\nServiço: " +
        (service || "-") +
        "\nMensagem: " +
        (message || "-")
    );
    return base + "?text=" + text;
  }, [name, contact, service, message]);

  return (
    <PageTransition>
      <Header />

      <SanusHero
        title="Agendar"
        subtitle="Marcação simples, rápida e personalizada."
        imageUrl="./Clinica/agendar.png"
      />

      <section className="sanus-recrutamento-page sanus-services-page">
        <div className="sanus-recrutamento-page-container">
          <div className="feedback-comment-list" style={{ width: "100%", justifyContent: "center" }}>
            <h3>
              <span className="feedback-comment">Estamos a preparar o agendamento online,</span>
              <span className="feedback-comment other-color"> sem comprometer a sua experiência.</span>
            </h3>
          </div>

          <p className="sv-lead">
            Enquanto finalizamos o sistema automático, a nossa equipa garante um agendamento rápido e
            orientado, com base na sua necessidade e disponibilidade.
          </p>
        </div>
      </section>

      <section className="sv-agendar-page">
        <div className="sv-agendar-container">
          {/* Como funciona (3 passos) */}
          <div className="sv-agendar-steps">
            <div className="sv-agendar-step">
              <div className="sv-step-badge">1</div>
              <div>
                <div className="sv-step-title">Escolha um canal</div>
                <div className="sv-step-desc">Telefone, WhatsApp ou pedido de contacto — como preferir.</div>
              </div>
            </div>

            <div className="sv-agendar-step">
              <div className="sv-step-badge">2</div>
              <div>
                <div className="sv-step-title">Orientação personalizada</div>
                <div className="sv-step-desc">Ajudamos a identificar o serviço mais indicado e o melhor horário.</div>
              </div>
            </div>

            <div className="sv-agendar-step">
              <div className="sv-step-badge">3</div>
              <div>
                <div className="sv-step-title">Confirmação do agendamento</div>
                <div className="sv-step-desc">Recebe a confirmação de forma clara — sem complicações.</div>
              </div>
            </div>
          </div>

          {/* Cards de contacto */}
          <div className="sv-agendar-grid">
            <div className="sv-agendar-card">
              <div className="sv-agendar-card-head">
                <div className="sv-agendar-icon">
                  <DeviceMobileIcon size={120} weight="duotone" color="var(--color-primary-dark)" />
                </div>
                <div>
                  <div className="sv-agendar-card-title">Telefone</div>
                </div>
              </div>

              <p className="sv-agendar-card-text">
                Para agendamentos rápidos ou situações urgentes, ligue diretamente.
              </p>

              <a className="btn btn-secundary sv-agendar-btn" href={"tel:" + CLINIC_PHONE_DISPLAY}>
                Ligar agora
              </a>

              <div className="sv-agendar-meta">{CLINIC_PHONE_DISPLAY}</div>
            </div>

            <div className="sv-agendar-card">
              <div className="sv-agendar-card-head">
                <div className="sv-agendar-icon">
                  <WhatsappLogoIcon size={120} weight="duotone" color="var(--color-primary-dark)" />
                </div>
                <div>
                  <div className="sv-agendar-card-title">WhatsApp</div>
                </div>
              </div>

              <p className="sv-agendar-card-text">
                Envie mensagem com a sua disponibilidade. Pode incluir serviço e breve descrição.
              </p>

              <a className="btn btn-secundary sv-agendar-btn" href={whatsappLink} target="_blank" rel="noreferrer">
                Abrir WhatsApp
              </a>

              <div className="sv-agendar-meta">Tempo médio: até 24h úteis</div>
            </div>

            {/* Pedido de contacto (componente reutilizável) */}
            <div className="sv-agendar-card sv-agendar-card-form">
              <AppointmentRequestForm
                title="Pedido de contacto"
                description="Deixe os seus dados e uma breve mensagem. Entraremos em contacto para confirmar o melhor horário."
                buttonText="Pedir contacto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA final elegante */}
      <div className="sv-agendar-cta">
        <svg className="sv-agendar-waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,128L120,154.7C240,181,480,235,720,261.3C960,288,1200,288,1320,288L1440,288L1440,320L0,320Z"
          />
        </svg>

        <svg className="sv-agendar-waves" style={{ zIndex: 2 }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="var(--color-primary-dark)"
            fillOpacity="1"
            d="M0,128L120,154.7C240,181,480,235,720,261.3C960,288,1200,288,1320,288L1440,288L1440,320L0,320Z"
          />
        </svg>

        <ContactCTA
          title="Quer saber mais sobre a Sanus Vitae?"
          buttonText="Entre em contacto"
          buttonLink="/contactos"
        />
      </div>

      {/* FAQ */}
      <section className="sv-agendar-faq">
        <FAQSection faqKey="agendar" />
      </section>

      <Footer />
    </PageTransition>
  );
}