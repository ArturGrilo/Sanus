import { useState } from "react";
import Header from "./header";
import Footer from "./footer";
import WhatsappButton from "./whatsapp_button";
import "../styles/contact_page.css";
import Location from "./location";
import { Envelope, Phone, DeviceMobile, WhatsappLogo } from "phosphor-react"
import SanusHero from "./sanus_hero";
import PageTransition from "./page_transition";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    preferredContact: "whatsapp",
    message: "",
    consent: false,
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const clinicMobilePhone = "(+351) 928 410 954";
  const clinicPhone = "(+351) 212 160 237;"
  const clinicEmail = "sanusvitae2021@gmail.com";
  const whatsappNumber = "351928410954";
  const faqs = [
    {
      question: "Preciso de receita médica para marcar fisioterapia?",
      answer:
        "Não é obrigatória em todos os casos, mas é sempre recomendável trazer toda a informação clínica disponível (relatórios, exames, etc.).",
    },
    {
      question: "Quanto tempo dura, em média, uma sessão?",
      answer:
        "Uma sessão típica dura entre 45 e 60 minutos, dependendo da avaliação inicial e do plano terapêutico definido.",
    },
    {
      question: "Posso enviar exames e relatórios pelo WhatsApp ou email?",
      answer:
        "Sim. Pode enviar documentação clínica pelo WhatsApp ou email. Garantimos confidencialidade no tratamento dos seus dados.",
    },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    if (!formData.name.trim()) return "Por favor, indique o seu nome.";
    if (!formData.email.trim()) return "Por favor, indique o seu email.";
    const emailOk = /\S+@\S+\.\S+/.test(formData.email);
    if (!emailOk) return "Por favor, indique um email válido.";
    if (!formData.message.trim())
      return "Conte-nos um pouco mais sobre o que procura.";
    if (!formData.consent)
      return "É necessário autorizar o contacto para podermos responder.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    const error = validate();
    if (error) {
      setStatus({ type: "error", message: error });
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao enviar o formulário");
      }

      setStatus({
        type: "success",
        message:
          "Obrigado pelo seu contacto. Iremos responder com a maior brevidade possível.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        preferredContact: "whatsapp",
        message: "",
        consent: false,
      });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message:
          "Ocorreu um erro ao enviar o seu pedido. Por favor, tente novamente dentro de alguns minutos ou use o contacto direto.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const buildWhatsappLink = () => {
    const text = `Olá, gostaria de falar com a Sanus Vitae.

Nome: ${formData.name || "-"}
Assunto: ${formData.subject || "-"}
Mensagem: ${formData.message || "-"}`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <PageTransition>
      <Header />
      <SanusHero
        title="Contactos"
        subtitle="O cuidado começa com uma conversa."
        imageUrl="/Clinica/contactos.png"
      /> 
      {/* CONTACT CONTENT */}
      <section className="sanus-contact-page">
        <div className="sanus-contact-page-container">
          <div className="sanus-contact-grid">
            <div className="sanus-contact-info">
              <div className="feedback-comment-list" style={{width: "100%", justifyContent: "start", textAlign: "left"}}>
                <h3>
                    <span className="feedback-comment">
                        Um contacto simples,
                    </span>{" "}
                    <span className="feedback-comment other-color">
                        humano e rápido.
                    </span>
                </h3>
              </div>
              <div className="sanus-contact-column-1">

                <div className="sanus-contact-highlights">
                    <a href={`tel:${clinicMobilePhone}`} className="sanus-contact-highlight-card">
                        <DeviceMobile size={28} color="var(--color-primary-dark)" weight="duotone" />
                        <p className="sanus-contact-link">
                                {clinicMobilePhone}
                        </p>
                    </a>

                    <a href={`tel:${clinicPhone}`} className="sanus-contact-highlight-card">
                        <Phone size={28} color="var(--color-primary-dark)" weight="duotone" />
                        <p className="sanus-contact-link">
                                {clinicPhone}
                        </p>
                    </a>

                    <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer"className="sanus-contact-highlight-card">
                        <WhatsappLogo size={28} color="var(--color-primary-dark)" weight="duotone" />
                        <p className="sanus-contact-link">
                            WhatsApp
                        </p>
                    </a>

                    <a href={`mailto:${clinicEmail}`} className="sanus-contact-highlight-card">
                        <Envelope size={28} color="var(--color-primary-dark)" weight="duotone" />
                        <p className="sanus-contact-link">
                            {clinicEmail}
                        </p>
                    </a>
                </div>
              </div>
            </div>

            {/* Lado Direito: Form */}
            <div className="sanus-contact-form-card">
              <h3>Envie-nos uma mensagem</h3>
              <p className="sanus-contact-form-subtitle">
                Respondemos no prazo máximo de 24 horas úteis.
              </p>

              <form onSubmit={handleSubmit} className="sanus-contact-form">
                <div className="sanus-contact-field-group">
                  <div className="sanus-contact-field">
                    <label htmlFor="name">Nome completo *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="sanus-contact-field">
                    <label htmlFor="email">Email *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="sanus-contact-field-group">
                  <div className="sanus-contact-field">
                    <label htmlFor="phone">Telemóvel</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="sanus-contact-field">
                    <label htmlFor="subject">Assunto</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      <option value="">Selecione uma opção</option>
                      <option value="marcacao">Marcação de consulta</option>
                      <option value="duvida-tratamento">
                        Dúvida sobre tratamento
                      </option>
                      <option value="relatorio-exame">
                        Envio de relatório/exame
                      </option>
                      <option value="outro">Outro pedido</option>
                    </select>
                  </div>
                </div>

                <div className="sanus-contact-field">
                  <label>Preferência de contacto</label>
                  <div className="sanus-contact-radio-group">
                    <label className="sanus-contact-radio">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="email"
                        checked={formData.preferredContact === "email"}
                        onChange={handleChange}
                      />
                      <span>Email</span>
                    </label>
                    <label className="sanus-contact-radio">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="phone"
                        checked={formData.preferredContact === "phone"}
                        onChange={handleChange}
                      />
                      <span>Telefone</span>
                    </label>
                    <label className="sanus-contact-radio">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="whatsapp"
                        checked={formData.preferredContact === "whatsapp"}
                        onChange={handleChange}
                      />
                      <span>WhatsApp</span>
                    </label>
                  </div>
                </div>

                <div className="sanus-contact-field">
                  <label htmlFor="message">Mensagem *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Explique em poucas linhas o motivo do seu contacto, sintomas principais ou objetivo da consulta."
                  />
                </div>

                <div className="sanus-contact-consent">
                  <label className="sanus-contact-checkbox">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleChange}
                    />
                    <span>
                      Autorizo que a Sanus Vitae utilize os meus dados para
                      responder ao meu pedido de contacto.
                    </span>
                  </label>
                  <p className="sanus-contact-consent-meta">
                    Os seus dados são utilizados apenas para responder ao seu pedido
                    de contacto e não serão partilhados com terceiros. Se tiver
                    dúvidas sobre proteção de dados, poderá contactar-nos através do
                    email {clinicEmail}.
                  </p>
                </div>

                {status.message && (
                  <div
                    className={`sanus-contact-status ${
                      status.type === "error"
                        ? "sanus-contact-status-error"
                        : "sanus-contact-status-success"
                    }`}
                    aria-live="polite"
                  >
                    {status.message}
                  </div>
                )}

                <div className="sanus-contact-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "A enviar..." : "Enviar mensagem"}
                  </button>

                  <button
                    href={buildWhatsappLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secundary"
                  >
                    Abrir conversa WhatsApp
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      <div className="sanus-contact-location">
        <svg className="sanus-contact-location-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fillOpacity="1" d="M0,64L120,53.3C240,43,480,21,720,37.3C960,53,1200,107,1320,133.3L1440,160L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path></svg>
        <Location />
      </div>
      <section className="sanus-contact-faq-section">
        <div className="sanus-contact-faq">
          <div className="sanus-contact-section-header">
              <header className="sanus-general-title">
                  <p className="sanus-services-text little">Dúvidas</p>
                  <h2>Perguntas frequentes</h2>
              </header>
          </div>
          <div className="sanus-contact-faq-grid">
              {faqs.map((faq, idx) => (
              <details key={idx} className="sanus-contact-faq-item">
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
              </details>
              ))}
          </div>
        </div>
      </section>
      <WhatsappButton />
      <div className="sanus-about-us-footer">
        <Footer />
      </div>
    </PageTransition>
  );
}