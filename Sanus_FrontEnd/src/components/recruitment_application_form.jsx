// components/RecruitmentApplicationForm.jsx
import React, { useState } from "react";

export default function RecruitmentApplicationForm({
  title = "Candidatura Espontânea",
  subtitle = "Adorávamos conhecê-lo",
  onSubmit = null,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    message: "",
    file: null,
    consent: false,
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      setStatus({
        type: "success",
        message: "Candidatura enviada com sucesso! Obrigado pelo teu interesse.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        message: "",
        file: null,
        consent: false,
      });
    } catch {
      setStatus({
        type: "error",
        message: "Ocorreu um erro ao enviar a candidatura. Tenta novamente.",
      });
    }

    setSubmitting(false);
  }

  return (
    <div className="sanus-recrutamento-form-main-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="var(--color-primary-dark)" fill-opacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
        <section className="sanus-recrutamento-page-form">
        <div className="sanus-recrutamento-page-form-container">
            <header className="sanus-general-title alt">
                <p className="sanus-services-text little alt">{subtitle}</p>
                <h2>{title}</h2>
            </header>

            <div className="sanus-contact-form-card">
            <form onSubmit={handleSubmit} className="sanus-contact-form">
                
                {/* LINE 1 */}
                <div className="sanus-contact-field-group">
                <div className="sanus-contact-field">
                    <label htmlFor="name">Nome completo *</label>
                    <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    />
                </div>

                <div className="sanus-contact-field">
                    <label htmlFor="email">Email *</label>
                    <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    />
                </div>
                </div>

                {/* LINE 2 */}
                <div className="sanus-contact-field-group">
                <div className="sanus-contact-field">
                    <label htmlFor="phone">Telemóvel *</label>
                    <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    />
                </div>

                <div className="sanus-contact-field">
                    <label htmlFor="role">Função a que se candidata *</label>
                    <input
                    id="role"
                    name="role"
                    type="text"
                    placeholder="Ex: Fisioterapeuta, Receção, Estágio..."
                    value={formData.role}
                    onChange={handleChange}
                    required
                    />
                </div>
                </div>

                {/* MESSAGE */}
                <div className="sanus-contact-field">
                <label htmlFor="message">Mensagem</label>
                <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Fala-nos um pouco sobre ti, experiência, motivações..."
                />
                </div>

                {/* FILE */}
                <div className="sanus-contact-field">
                <label htmlFor="file">Anexar CV (PDF, máximo 5 MB)</label>
                <input
                    id="file"
                    name="file"
                    type="file"
                    accept=".pdf"
                    onChange={handleChange}
                />
                </div>

                {/* CONSENT */}
                <div className="sanus-contact-consent">
                <label className="sanus-contact-checkbox">
                    <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    required
                    />
                    <span>
                    Autorizo a Sanus Vitae a utilizar os meus dados para efeitos de
                    recrutamento e contacto relacionado com esta candidatura.
                    </span>
                </label>
                <p className="sanus-contact-consent-meta">
                    Os teus dados serão usados exclusivamente para análise da candidatura
                    e não serão partilhados com terceiros.
                </p>
                </div>

                {/* STATUS FEEDBACK */}
                {status.message && (
                <div
                    className={`sanus-contact-status ${
                    status.type === "error"
                        ? "sanus-contact-status-error"
                        : "sanus-contact-status-success"
                    }`}
                >
                    {status.message}
                </div>
                )}

                {/* ACTIONS */}
                <div className="sanus-contact-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "A enviar..." : "Enviar candidatura"}
                </button>
                </div>
            </form>
            </div>
        </div>
        </section>
    </div>
  );
}