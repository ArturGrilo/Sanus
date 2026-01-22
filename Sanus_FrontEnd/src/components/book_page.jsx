// AgendarPage.jsx
import Header from "./header";
import Footer from "./footer";
import PageTransition from "./page_transition";
import SanusHero from "./sanus_hero";
import ContactCTA from "./contact_cta_break_section";
import FAQSection from "./faq_section";
import { WhatsappLogoIcon, DeviceMobileIcon, EnvelopeIcon } from "@phosphor-icons/react";

import { useMemo, useState } from "react";
import "../styles/book_page.css";

// ✅ Substitui estes valores pelos contactos reais
const CLINIC_PHONE_DISPLAY = "+351 928 410 954";

export default function AgendarPage() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");

  const whatsappLink = useMemo(() => {
    const base = `https://wa.me/${CLINIC_PHONE_DISPLAY}`;
    const text = encodeURIComponent(
      `Olá! Gostaria de agendar.\n\nNome: ${name || "-"}\nContacto: ${
        contact || "-"
      }\nServiço: ${service || "-"}\nMensagem: ${message || "-"}`
    );
    return `${base}?text=${text}`;
  }, [name, contact, service, message]);

  // ✅ FAQ curto e premium (sem “em breve” vazio)
  const faqs = [
    {
      question: "Ainda não existe agendamento online?",
      answer:
        "Estamos a finalizar o sistema de agendamento online. Até lá, garantimos um agendamento rápido e personalizado através dos nossos canais (telefone, WhatsApp ou pedido de contacto).",
    },
    {
      question: "Quanto tempo demora a confirmação?",
      answer:
        "Normalmente confirmamos em até 24h úteis. Em casos urgentes, recomendamos contacto por telefone ou WhatsApp para resposta mais imediata.",
    },
    {
      question: "Posso pedir ajuda para escolher o serviço?",
      answer:
        "Sim. Se não tiver a certeza, descreva a sua situação e orientamos a opção mais indicada, com base na sua necessidade e objetivos.",
    },
    {
      question: "Que informação devo enviar para agilizar?",
      answer:
        "Nome, contacto, serviço pretendido (se souber) e uma breve descrição da situação. Se tiver exames/referência médica, pode mencionar.",
    },
  ];

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
            Enquanto finalizamos o sistema automático, a nossa equipa garante um agendamento
              rápido e orientado, com base na sua necessidade e disponibilidade.
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
                <div className="sv-step-desc">
                  Telefone, WhatsApp ou pedido de contacto — como preferir.
                </div>
              </div>
            </div>

            <div className="sv-agendar-step">
              <div className="sv-step-badge">2</div>
              <div>
                <div className="sv-step-title">Orientação personalizada</div>
                <div className="sv-step-desc">
                  Ajudamos a identificar o serviço mais indicado e o melhor horário.
                </div>
              </div>
            </div>

            <div className="sv-agendar-step">
              <div className="sv-step-badge">3</div>
              <div>
                <div className="sv-step-title">Confirmação do agendamento</div>
                <div className="sv-step-desc">
                  Recebe a confirmação de forma clara — sem complicações.
                </div>
              </div>
            </div>
          </div>

          {/* Cards de contacto */}
          <div className="sv-agendar-grid">
            <div className="sv-agendar-card">
              <div className="sv-agendar-card-head">
                <div className="sv-agendar-icon">
                    <DeviceMobileIcon size={120} weight="duotone" color="var(--color-primary-dark)" ></DeviceMobileIcon>
                </div>
                <div>
                  <div className="sv-agendar-card-title">Telefone</div>
                </div>
              </div>

              <p className="sv-agendar-card-text">
                Para agendamentos rápidos ou situações urgentes, ligue diretamente.
              </p>

              <a className="btn btn-secundary sv-agendar-btn" href={`tel:${CLINIC_PHONE_DISPLAY}`}>
                Ligar agora
              </a>

              <div className="sv-agendar-meta">{CLINIC_PHONE_DISPLAY}</div>
            </div>

            <div className="sv-agendar-card">
              <div className="sv-agendar-card-head">
                <div className="sv-agendar-icon">
                    <WhatsappLogoIcon size={120} weight="duotone" color="var(--color-primary-dark)" ></WhatsappLogoIcon>
                </div>
                <div>
                  <div className="sv-agendar-card-title">WhatsApp</div>
                </div>
              </div>

              <p className="sv-agendar-card-text">
                Envie mensagem com a sua disponibilidade. Pode incluir serviço e breve descrição.
              </p>

              <a
                className="btn btn-secundary sv-agendar-btn"
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
              >
                Abrir WhatsApp
              </a>

              <div className="sv-agendar-meta">Tempo médio: até 24h úteis</div>
            </div>

            {/* Pedido de contacto */}
            <div className="sv-agendar-card sv-agendar-card-form">
              <div className="sv-agendar-card-head">
                <div className="sv-agendar-icon">
                    <EnvelopeIcon size={120} weight="duotone" color="var(--color-primary-dark)" ></EnvelopeIcon>
                </div>
                <div>
                  <div className="sv-agendar-card-title">Pedido de contacto</div>
                </div>
              </div>

              <p className="sv-agendar-card-text">
                Deixe os seus dados e uma breve mensagem. Entraremos em contacto para confirmar o
                melhor horário.
              </p>

              <form
                className="sv-agendar-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  // ✅ Sem backend: encaminha para Contactos (padrão premium) e mantém dados no WhatsApp como opção acima
                  // Se tiveres endpoint, troca por fetch POST.
                  window.location.href = "/contactos";
                }}
              >
                <div className="sv-form-row">
                  <label>
                    <span>Nome</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="O seu nome"
                    />
                  </label>

                  <label>
                    <span>Contacto</span>
                    <input
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Telefone ou email"
                    />
                  </label>
                </div>

                <label>
                  <span>Serviço (opcional)</span>
                  <input
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    placeholder="Ex: Fisioterapia / Pilates / Domicílio"
                  />
                </label>

                <label>
                  <span>Mensagem</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descreva brevemente o que procura (dor, limitação, objetivo, etc.)"
                    rows={4}
                  />
                </label>

                <button type="submit" className="btn btn-primary sv-agendar-btn">
                  Pedir contacto
                </button>

                <div className="sv-agendar-privacy">
                  Os seus dados serão usados apenas para contacto e agendamento.
                </div>
              </form>
            </div>
          </div>

        </div>

        
      </section>
      {/* CTA final elegante */}
      <div className="sv-agendar-cta">
        {/* Waves */}
    <svg className="sv-agendar-waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path
        fill="#ffffff"
        fillOpacity="1"
        d="M0,128L120,154.7C240,181,480,235,720,261.3C960,288,1200,288,1320,288L1440,288L1440,320L0,320Z"
        />
    </svg>

    <svg
        className="sv-agendar-waves"
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
        <ContactCTA
            title="Quer saber mais sobre a Sanus Vitae?"
            buttonText="Entre em contacto"
            buttonLink="/contactos"
        />
      </div>
    
      {/* FAQ (mesmo componente do recrutamento) */}
      <section className="sv-agendar-faq">
        <FAQSection title="Perguntas Frequentes" subtitle="Agendamento" faqs={faqs} />
      </section>
      <Footer />
    </PageTransition>
  );
}
