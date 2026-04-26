import Header from "./header";
import Footer from "./footer";
import "../styles/contact_page.css";
import Location from "./location";
import { Envelope, Phone, DeviceMobile, WhatsappLogo } from "phosphor-react";
import SanusHero from "./sanus_hero";
import PageTransition from "./page_transition";
import FAQSection from "./faq_section";
import ContactMessageForm from "./contact_page_form";

import { motion, useReducedMotion } from "framer-motion";
import {
  revealSoft,
  revealText,
  staggerSoft,
  viewportOnce,
} from "../animations/motionPresets";

export default function ContactPage() {
  const clinicMobilePhone = "(+351) 928 410 954";
  const clinicPhone = "(+351) 212 160 237";
  const clinicEmail = "sanusvitae2021@gmail.com";
  const whatsappNumber = "351928410954";

  const shouldReduceMotion = useReducedMotion();

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

  const cleanMobilePhone = clinicMobilePhone.replace(/[^\d+]/g, "");
  const cleanClinicPhone = clinicPhone.replace(/[^\d+]/g, "");

  return (
    <PageTransition>
      <Header />

      <SanusHero
        title="Contactos"
        subtitle="O cuidado começa com uma conversa."
        imageUrl="/Clinica/contactos.png"
      />

      <section className="sanus-contact-page">
        <div className="sanus-contact-page-container">
          <motion.div
            className="sanus-contact-grid"
            variants={shouldReduceMotion ? undefined : staggerSoft}
            {...motionSectionProps}
          >
            <motion.div
              className="sanus-contact-info"
              variants={shouldReduceMotion ? undefined : revealSoft}
            >
              <motion.div
                className="feedback-comment-list"
                style={{
                  width: "100%",
                  justifyContent: "start",
                  textAlign: "left",
                }}
                variants={shouldReduceMotion ? undefined : revealText}
              >
                <h3>
                  <span className="feedback-comment">
                    Um contacto simples,
                  </span>{" "}
                  <span className="feedback-comment other-color">
                    humano e rápido.
                  </span>
                </h3>
              </motion.div>

              <div className="sanus-contact-column-1">
                <motion.div
                  className="sanus-contact-highlights"
                  variants={shouldReduceMotion ? undefined : staggerSoft}
                >
                  <motion.a
                    href={"tel:" + cleanMobilePhone}
                    className="sanus-contact-highlight-card"
                    variants={shouldReduceMotion ? undefined : revealText}
                  >
                    <DeviceMobile
                      size={28}
                      color="var(--color-primary-dark)"
                      weight="duotone"
                    />
                    <p className="sanus-contact-link">{clinicMobilePhone}</p>
                  </motion.a>

                  <motion.a
                    href={"tel:" + cleanClinicPhone}
                    className="sanus-contact-highlight-card"
                    variants={shouldReduceMotion ? undefined : revealText}
                  >
                    <Phone
                      size={28}
                      color="var(--color-primary-dark)"
                      weight="duotone"
                    />
                    <p className="sanus-contact-link">{clinicPhone}</p>
                  </motion.a>

                  <motion.a
                    href={"https://wa.me/" + whatsappNumber}
                    target="_blank"
                    rel="noreferrer"
                    className="sanus-contact-highlight-card"
                    variants={shouldReduceMotion ? undefined : revealText}
                  >
                    <WhatsappLogo
                      size={28}
                      color="var(--color-primary-dark)"
                      weight="duotone"
                    />
                    <p className="sanus-contact-link">WhatsApp</p>
                  </motion.a>

                  <motion.a
                    href={"mailto:" + clinicEmail}
                    className="sanus-contact-highlight-card"
                    variants={shouldReduceMotion ? undefined : revealText}
                  >
                    <Envelope
                      size={28}
                      color="var(--color-primary-dark)"
                      weight="duotone"
                    />
                    <p className="sanus-contact-link">{clinicEmail}</p>
                  </motion.a>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="sanus-contact-form-card"
              variants={shouldReduceMotion ? undefined : revealSoft}
            >
              <motion.h3 variants={shouldReduceMotion ? undefined : revealText}>
                Envie-nos uma mensagem
              </motion.h3>

              <motion.p
                className="sanus-contact-form-subtitle"
                variants={shouldReduceMotion ? undefined : revealText}
              >
                Respondemos no prazo máximo de 24 horas úteis.
              </motion.p>

              <ContactMessageForm
                clinicEmail={clinicEmail}
                whatsappNumber={whatsappNumber}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <motion.div
        className="sanus-contact-location"
        variants={shouldReduceMotion ? undefined : revealSoft}
        {...motionSectionProps}
      >
        <svg
          className="sanus-contact-location-wave"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,64L120,53.3C240,43,480,21,720,37.3C960,53,1200,107,1320,133.3L1440,160L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"
          />
        </svg>

        <Location />
      </motion.div>

      <motion.section
        variants={shouldReduceMotion ? undefined : revealSoft}
        {...motionSectionProps}
      >
        <FAQSection faqKey="contactos" />
      </motion.section>

      <div className="sanus-about-us-footer">
        <Footer />
      </div>
    </PageTransition>
  );
}