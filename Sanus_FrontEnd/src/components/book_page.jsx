// book_page.jsx / AgendarPage.jsx
import Header from "./header";
import Footer from "./footer";
import PageTransition from "./page_transition";
import SanusHero from "./sanus_hero";
import ContactCTA from "./contact_cta_break_section";
import FAQSection from "./faq_section";
import AppointmentRequestForm from "./book_page_mail_form";

import {
  WhatsappLogoIcon,
  DeviceMobileIcon,
} from "@phosphor-icons/react";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  revealSoft,
  revealText,
  staggerSoft,
  viewportOnce,
} from "../animations/motionPresets";

import "../styles/book_page.css";

const CLINIC_PHONE_DISPLAY = "+351 928 410 954";

export default function AgendarPage() {
  const [name] = useState("");
  const [contact] = useState("");
  const [service] = useState("");
  const [message] = useState("");

  const shouldReduceMotion = useReducedMotion();

  const whatsappLink = useMemo(() => {
    const base = "https://wa.me/" + CLINIC_PHONE_DISPLAY.replace(/\s+/g, "");
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

  const motionSectionProps = shouldReduceMotion
    ? {
        initial: false,
        animate: "visible",
      }
    : {
        initial: "hidden",
        whileInView: "visible",
        viewport: viewportOnce,
      };

  return (
    <PageTransition>
      <Header />

      <SanusHero
        title="Agendar"
        subtitle="Marcação simples, rápida e personalizada."
        imageUrl="./Clinica/agendar.png"
      />

      <motion.section
        className="sanus-recrutamento-page sanus-services-page"
        variants={shouldReduceMotion ? undefined : revealSoft}
        {...motionSectionProps}
      >
        <div className="sanus-recrutamento-page-container">
          <motion.div
            className="feedback-comment-list"
            style={{ width: "100%", justifyContent: "center" }}
            variants={shouldReduceMotion ? undefined : staggerSoft}
          >
            <motion.h3 variants={shouldReduceMotion ? undefined : revealText}>
              <span className="feedback-comment">
                Estamos a preparar o agendamento online,
              </span>
              <span className="feedback-comment other-color">
                {" "}
                sem comprometer a sua experiência.
              </span>
            </motion.h3>
          </motion.div>

          <motion.p
            className="sv-lead"
            variants={shouldReduceMotion ? undefined : revealText}
          >
            Enquanto finalizamos o sistema automático, a nossa equipa garante um
            agendamento rápido e orientado, com base na sua necessidade e
            disponibilidade.
          </motion.p>
        </div>
      </motion.section>

      <section className="sv-agendar-page">
        <div className="sv-agendar-container">
          <motion.div
            className="sv-agendar-steps"
            variants={shouldReduceMotion ? undefined : staggerSoft}
            {...motionSectionProps}
          >
            <motion.div
              className="sv-agendar-step"
              variants={shouldReduceMotion ? undefined : revealSoft}
            >
              <div className="sv-step-badge">1</div>
              <div>
                <div className="sv-step-title">Escolha um canal</div>
                <div className="sv-step-desc">
                  Telefone, WhatsApp ou pedido de contacto — como preferir.
                </div>
              </div>
            </motion.div>

            <motion.div
              className="sv-agendar-step"
              variants={shouldReduceMotion ? undefined : revealSoft}
            >
              <div className="sv-step-badge">2</div>
              <div>
                <div className="sv-step-title">Orientação personalizada</div>
                <div className="sv-step-desc">
                  Ajudamos a identificar o serviço mais indicado e o melhor
                  horário.
                </div>
              </div>
            </motion.div>

            <motion.div
              className="sv-agendar-step"
              variants={shouldReduceMotion ? undefined : revealSoft}
            >
              <div className="sv-step-badge">3</div>
              <div>
                <div className="sv-step-title">Confirmação do agendamento</div>
                <div className="sv-step-desc">
                  Recebe a confirmação de forma clara — sem complicações.
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="sv-agendar-grid"
            variants={shouldReduceMotion ? undefined : staggerSoft}
            {...motionSectionProps}
          >
            <motion.div
              className="sv-agendar-card"
              variants={shouldReduceMotion ? undefined : revealSoft}
            >
              <div className="sv-agendar-card-head">
                <div className="sv-agendar-icon">
                  <DeviceMobileIcon
                    size={120}
                    weight="duotone"
                    color="var(--color-primary-dark)"
                  />
                </div>
                <div>
                  <div className="sv-agendar-card-title">Telefone</div>
                </div>
              </div>

              <p className="sv-agendar-card-text">
                Para agendamentos rápidos ou situações urgentes, ligue
                diretamente.
              </p>

              <a
                className="btn btn-secundary sv-agendar-btn"
                href={"tel:" + CLINIC_PHONE_DISPLAY.replace(/\s+/g, "")}
              >
                Ligar agora
              </a>

              <div className="sv-agendar-meta">{CLINIC_PHONE_DISPLAY}</div>
            </motion.div>

            <motion.div
              className="sv-agendar-card"
              variants={shouldReduceMotion ? undefined : revealSoft}
            >
              <div className="sv-agendar-card-head">
                <div className="sv-agendar-icon">
                  <WhatsappLogoIcon
                    size={120}
                    weight="duotone"
                    color="var(--color-primary-dark)"
                  />
                </div>
                <div>
                  <div className="sv-agendar-card-title">WhatsApp</div>
                </div>
              </div>

              <p className="sv-agendar-card-text">
                Envie mensagem com a sua disponibilidade. Pode incluir serviço e
                breve descrição.
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
            </motion.div>

            <motion.div
              className="sv-agendar-card sv-agendar-card-form"
              variants={shouldReduceMotion ? undefined : revealSoft}
            >
              <AppointmentRequestForm
                title="Pedido de contacto"
                description="Deixe os seus dados e uma breve mensagem. Entraremos em contacto para confirmar o melhor horário."
                buttonText="Pedir contacto"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <motion.div
        className="sv-agendar-cta"
        variants={shouldReduceMotion ? undefined : revealSoft}
        {...motionSectionProps}
      >
        <svg
          className="sv-agendar-waves"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
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
      </motion.div>

      <motion.section
        className="sv-agendar-faq"
        variants={shouldReduceMotion ? undefined : revealSoft}
        {...motionSectionProps}
      >
        <FAQSection faqKey="agendar" />
      </motion.section>

      <Footer />
    </PageTransition>
  );
}