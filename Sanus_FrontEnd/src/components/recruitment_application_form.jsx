import React, { useEffect, useRef, useState } from "react";

const MAX_PDF_BYTES = 5 * 1024 * 1024;

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

  // Turnstile
  const turnstileContainerRef = useRef(null);
  const widgetIdRef = useRef(null);

  // promise resolvers (para o submit não ficar pendurado)
  const tokenResolveRef = useRef(null);
  const tokenRejectRef = useRef(null);

  useEffect(() => {
    const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

    if (!sitekey) {
      console.warn("Missing VITE_TURNSTILE_SITE_KEY");
      return;
    }

    const renderIfReady = () => {
      if (!window.turnstile || !turnstileContainerRef.current) return;
      if (widgetIdRef.current !== null) return; // evita render duplicado

      widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
        sitekey,
        appearance: "always", 

        // ✅ callback DO RENDER (este é o que o Turnstile chama de forma fiável)
        callback: (token) => {
          if (tokenResolveRef.current) tokenResolveRef.current(token);
          tokenResolveRef.current = null;
          tokenRejectRef.current = null;
        },

        "error-callback": () => {
          if (tokenRejectRef.current) tokenRejectRef.current(new Error("Falha na verificação anti-bot."));
          tokenResolveRef.current = null;
          tokenRejectRef.current = null;
        },

        "expired-callback": () => {
          if (tokenRejectRef.current) tokenRejectRef.current(new Error("Verificação expirou. Tenta novamente."));
          tokenResolveRef.current = null;
          tokenRejectRef.current = null;
        },

        retry: "auto",
        "refresh-expired": "auto",
      });
    };

    const interval = setInterval(() => {
      renderIfReady();
      if (widgetIdRef.current !== null) clearInterval(interval);
    }, 120);

    return () => clearInterval(interval);
  }, []);

  function handleChange(e) {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? (files?.[0] ?? null) : value,
    }));
  }

  function validateFile(file) {
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      (typeof file.name === "string" && file.name.toLowerCase().endsWith(".pdf"));

    if (!isPdf) throw new Error("O CV tem de ser um ficheiro PDF.");
    if (file.size > MAX_PDF_BYTES) throw new Error("O PDF não pode ultrapassar 5MB.");
  }

  function getTurnstileToken() {
    return new Promise((resolve, reject) => {
      if (!window.turnstile || widgetIdRef.current === null) {
        reject(new Error("Verificação anti-bot indisponível. Recarrega a página e tenta novamente."));
        return;
      }

      // guarda resolvers para o callback do render resolver
      tokenResolveRef.current = resolve;
      tokenRejectRef.current = reject;

      // executa desafio (se necessário)
      try {
        window.turnstile.reset(widgetIdRef.current);
        window.turnstile.execute(widgetIdRef.current);
      } catch {
        tokenResolveRef.current = null;
        tokenRejectRef.current = null;
        reject(new Error("Não foi possível iniciar a verificação anti-bot."));
      }
    });
  }

  async function defaultSubmit(payload) {
    const endpoint = import.meta.env.VITE_RECRUITMENT_ENDPOINT;
    if (!endpoint || !endpoint.startsWith("https://")) {
      throw new Error("Endpoint inválido. Verifica VITE_RECRUITMENT_ENDPOINT.");
    }

    const fd = new FormData();
    fd.append("name", payload.name);
    fd.append("email", payload.email);
    fd.append("phone", payload.phone);
    fd.append("role", payload.role);
    fd.append("message", payload.message || "");
    fd.append("consent", String(payload.consent));
    fd.append("turnstileToken", payload.turnstileToken);
    if (payload.file) fd.append("file", payload.file, payload.file.name);

    // ✅ timeout para não ficar “a enviar…” para sempre
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: fd,
        signal: controller.signal,
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg = data?.message || data?.error || "Ocorreu um erro ao enviar a candidatura. Tenta novamente."
        throw new Error(msg)
      }

      return data;
    } catch (err) {
      if (err?.name === "AbortError") {
        throw new Error("O pedido demorou demasiado tempo. Tenta novamente.");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      validateFile(formData.file);

      const turnstileToken = await getTurnstileToken();
      const payload = { ...formData, turnstileToken };

      if (onSubmit) await onSubmit(payload);
      else await defaultSubmit(payload);

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

      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "Ocorreu um erro ao enviar a candidatura. Tenta novamente.",
      });

      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="sanus-recrutamento-form-main-container">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path
          fill="var(--color-primary-dark)"
          fillOpacity="1"
          d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      <section className="sanus-recrutamento-page-form">
        <div className="sanus-recrutamento-page-form-container">
          <header className="sanus-general-title alt">
            <p className="sanus-services-text little alt">{subtitle}</p>
            <h2>{title}</h2>
          </header>

          <div className="sanus-contact-form-card">
            <form onSubmit={handleSubmit} className="sanus-contact-form">
              <div className="sanus-contact-field-group">
                <div className="sanus-contact-field">
                  <label htmlFor="name">Nome completo *</label>
                  <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="sanus-contact-field">
                  <label htmlFor="email">Email *</label>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="sanus-contact-field-group">
                <div className="sanus-contact-field">
                  <label htmlFor="phone">Telemóvel *</label>
                  <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
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

              <div className="sanus-contact-field">
                <label htmlFor="file">Anexar CV (PDF, máximo 5 MB)</label>
                <input id="file" name="file" type="file" accept="application/pdf,.pdf" onChange={handleChange} />
              </div>

              <div className="sanus-contact-consent">
                <label className="sanus-contact-checkbox">
                  <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} required />
                  <span>
                    Autorizo a Sanus Vitae a utilizar os meus dados para efeitos de recrutamento e contacto relacionado com
                    esta candidatura.
                  </span>
                </label>
                <p className="sanus-contact-consent-meta">
                  Os teus dados serão usados exclusivamente para análise da candidatura e não serão partilhados com terceiros.
                </p>
              </div>

              {/* Turnstile mount */}
              <div className="sanus-turnstile">
                <div ref={turnstileContainerRef} />
                <p className="sanus-turnstile-hint">
                  Verificação de segurança necessária para enviar a candidatura.
                </p>
              </div>


              {status.message && (
                <div
                  className={`sanus-contact-status ${
                    status.type === "error" ? "sanus-contact-status-error" : "sanus-contact-status-success"
                  }`}
                >
                  {status.message}
                </div>
              )}

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
