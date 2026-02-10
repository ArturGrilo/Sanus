import Header from "./header";
import Footer from "./footer";
import "../styles/contact_page.css";
import Location from "./location";
import { Envelope, Phone, DeviceMobile, WhatsappLogo } from "phosphor-react";
import SanusHero from "./sanus_hero";
import PageTransition from "./page_transition";
import FAQSection from "./faq_section";
import ContactMessageForm from "./contact_page_form";

export default function ContactPage() {
  const clinicMobilePhone = "(+351) 928 410 954";
  const clinicPhone = "(+351) 212 160 237;";
  const clinicEmail = "sanusvitae2021@gmail.com";
  const whatsappNumber = "351928410954";

  return (
    <PageTransition>
      <Header />
      <SanusHero title="Contactos" subtitle="O cuidado começa com uma conversa." imageUrl="/Clinica/contactos.png" />

      <section className="sanus-contact-page">
        <div className="sanus-contact-page-container">
          <div className="sanus-contact-grid">
            <div className="sanus-contact-info">
              <div className="feedback-comment-list" style={{ width: "100%", justifyContent: "start", textAlign: "left" }}>
                <h3>
                  <span className="feedback-comment">Um contacto simples,</span>{" "}
                  <span className="feedback-comment other-color">humano e rápido.</span>
                </h3>
              </div>

              <div className="sanus-contact-column-1">
                <div className="sanus-contact-highlights">
                  <a href={"tel:" + clinicMobilePhone} className="sanus-contact-highlight-card">
                    <DeviceMobile size={28} color="var(--color-primary-dark)" weight="duotone" />
                    <p className="sanus-contact-link">{clinicMobilePhone}</p>
                  </a>

                  <a href={"tel:" + clinicPhone} className="sanus-contact-highlight-card">
                    <Phone size={28} color="var(--color-primary-dark)" weight="duotone" />
                    <p className="sanus-contact-link">{clinicPhone}</p>
                  </a>

                  <a
                    href={"https://wa.me/" + whatsappNumber}
                    target="_blank"
                    rel="noreferrer"
                    className="sanus-contact-highlight-card"
                  >
                    <WhatsappLogo size={28} color="var(--color-primary-dark)" weight="duotone" />
                    <p className="sanus-contact-link">WhatsApp</p>
                  </a>

                  <a href={"mailto:" + clinicEmail} className="sanus-contact-highlight-card">
                    <Envelope size={28} color="var(--color-primary-dark)" weight="duotone" />
                    <p className="sanus-contact-link">{clinicEmail}</p>
                  </a>
                </div>
              </div>
            </div>

            {/* Lado Direito: Form */}
            <div className="sanus-contact-form-card">
              <h3>Envie-nos uma mensagem</h3>
              <p className="sanus-contact-form-subtitle">Respondemos no prazo máximo de 24 horas úteis.</p>

              <ContactMessageForm clinicEmail={clinicEmail} whatsappNumber={whatsappNumber} />
            </div>
          </div>
        </div>
      </section>

      <div className="sanus-contact-location">
        <svg className="sanus-contact-location-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,64L120,53.3C240,43,480,21,720,37.3C960,53,1200,107,1320,133.3L1440,160L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"
          />
        </svg>
        <Location />
      </div>

      <FAQSection faqKey="contactos" />

      <div className="sanus-about-us-footer">
        <Footer />
      </div>
    </PageTransition>
  );
}