import React, { useEffect, useRef, useState } from "react";
import { EnvelopeIcon } from "@phosphor-icons/react";

export default function AppointmentRequestForm({
  title = "Pedido de contacto",
  description = "Deixe os seus dados e uma breve mensagem. Entraremos em contacto para confirmar o melhor horário.",
  buttonText = "Pedir contacto",
  className = "",
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  // ============================================================
  // Turnstile — IGUAL AO RECRUITMENT
  // ============================================================
  const turnstileContainerRef = useRef(null);
  const widgetIdRef = useRef(null);
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
      if (widgetIdRef.current !== null) return;

      widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
        sitekey,
        appearance: "always",

        callback: (token) => {
          if (tokenResolveRef.current) tokenResolveRef.current(token);
          tokenResolveRef.current = null;
          tokenRejectRef.current = null;
        },

        "error-callback": () => {
          if (tokenRejectRef.current) {
            tokenRejectRef.current(new Error("Falha na verificação anti-bot."));
          }
          tokenResolveRef.current = null;
          tokenRejectRef.current = null;
        },

        "expired-callback": () => {
          if (tokenRejectRef.current) {
            tokenRejectRef.current(new Error("Verificação expirou. Tenta novamente."));
          }
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

  function getTurnstileToken() {
    return new Promise((resolve, reject) => {
      if (!window.turnstile || widgetIdRef.current === null) {
        reject(new Error("Verificação anti-bot indisponível. Recarrega a página."));
        return;
      }

      tokenResolveRef.current = resolve;
      tokenRejectRef.current = reject;

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

  // ============================================================
  // Submit (inalterado)
  // ============================================================
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      if (!name || !contact || !message) {
        throw new Error("Preencha os campos obrigatórios.");
      }

      if (!consent) {
        throw new Error("É necessário consentimento para prosseguir.");
      }

      const turnstileToken = await getTurnstileToken();

      const endpoint = import.meta.env.VITE_APPOINTMENT_ENDPOINT;
      if (!endpoint) {
        throw new Error("Endpoint não configurado.");
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          contact,
          service,
          message,
          consent: true,
          turnstileToken,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Erro ao enviar pedido.");
      }

      setStatus({
        type: "success",
        message: "Pedido enviado com sucesso. Entraremos em contacto brevemente.",
      });

      setName("");
      setContact("");
      setService("");
      setMessage("");
      setConsent(false);

      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.message || "Erro ao enviar pedido.",
      });

      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ============================================================
  // Render — layout original mantido
  // ============================================================
  return (
    <div>
        <div className="sv-agendar-card-head">
            <div className="sv-agendar-icon">
                <EnvelopeIcon size={120} weight="duotone" color="var(--color-primary-dark)" />
            </div>
            <div>
                <div className="sv-agendar-card-title">{title}</div>
            </div>
        </div>
        
        <div className={className}>
        <p className="sv-agendar-card-text">{description}</p>

        <form className="sv-agendar-form" onSubmit={handleSubmit}>
            <div className="sv-form-row">
            <label>
                <span>Nome *</span>
                <input className="sanus-agendar-input" value={name} onChange={(e) => setName(e.target.value)} disabled={submitting} />
            </label>

            <label>
                <span>Contacto *</span>
                <input className="sanus-agendar-input" value={contact} onChange={(e) => setContact(e.target.value)} disabled={submitting} />
            </label>
            </div>

            <label>
            <span>Serviço (opcional)</span>
            <input className="sanus-agendar-input" value={service} onChange={(e) => setService(e.target.value)} disabled={submitting} />
            </label>

            <label>
            <span>Mensagem *</span>
            <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={submitting}
                className="sanus-agendar-input" 
            />
            </label>

            {/* ✅ CONSENTIMENTO — IGUAL AO RECRUITMENT */}
            <div className="sanus-contact-consent">
            <label className="sanus-contact-checkbox">
                <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                disabled={submitting}
                />
                <span>
                Autorizo a Sanus Vitae a utilizar os meus dados para efeitos de contacto e agendamento.
                </span>
            </label>
            <p className="sanus-contact-consent-meta">
                Os seus dados serão usados exclusivamente para contacto e agendamento.
            </p>
            </div>

            {/* ✅ TURNSTILE — IGUAL AO RECRUITMENT */}
            <div className="sanus-turnstile">
            <div ref={turnstileContainerRef} />
            <p className="sanus-turnstile-hint">
                Verificação de segurança necessária para enviar o pedido.
            </p>
            </div>

            {status.message && (
            <div
                className={
                "sanus-contact-status " +
                (status.type === "error"
                    ? "sanus-contact-status-error"
                    : "sanus-contact-status-success")
                }
            >
                {status.message}
            </div>
            )}

            <button type="submit" className="btn btn-primary sv-agendar-btn" disabled={submitting}>
            {submitting ? "A enviar..." : buttonText}
            </button>
        </form>
        </div>
    </div>
  );
}