import React, { useEffect, useRef, useState } from "react";

function buildEndpoint() {
  const direct = import.meta.env.VITE_CONTACT_ENDPOINT;
  if (direct && String(direct).trim().length > 0) return String(direct).trim();

  const base = import.meta.env.VITE_BACKEND_URL;
  if (base && String(base).trim().length > 0) {
    return String(base).replace(/\/$/, "") + "/contact";
  }

  return "";
}

export default function ContactMessageForm({
  clinicEmail = "sanusvitae2021@gmail.com",
  whatsappNumber = "351928410954",
}) {
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
        sitekey: sitekey,
        appearance: "always",

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

  function getTurnstileToken() {
    return new Promise((resolve, reject) => {
      if (!window.turnstile || widgetIdRef.current === null) {
        reject(new Error("Verificação anti-bot indisponível. Recarrega a página e tenta novamente."));
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
  // Lógica original (mantida)
  // ============================================================
  function handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    const type = e.target.type;
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function validate() {
    if (!String(formData.name || "").trim()) return "Por favor, indique o seu nome.";
    if (!String(formData.email || "").trim()) return "Por favor, indique o seu email.";
    const emailOk = /\S+@\S+\.\S+/.test(formData.email);
    if (!emailOk) return "Por favor, indique um email válido.";
    if (!String(formData.message || "").trim()) return "Conte-nos um pouco mais sobre o que procura.";
    if (!formData.consent) return "É necessário autorizar o contacto para podermos responder.";
    return null;
  }

  function buildWhatsappLink() {
    const text =
      "Olá, gostaria de falar com a Sanus Vitae.\n\n" +
      "Nome: " +
      (formData.name || "-") +
      "\nAssunto: " +
      (formData.subject || "-") +
      "\nMensagem: " +
      (formData.message || "-");

    return "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(text);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    const error = validate();
    if (error) {
      setStatus({ type: "error", message: error });
      return;
    }

    const endpoint = buildEndpoint();
    if (!endpoint) {
      setStatus({
        type: "error",
        message: "Endpoint não configurado. Verifica VITE_CONTACT_ENDPOINT ou VITE_BACKEND_URL.",
      });
      return;
    }

    try {
      setSubmitting(true);

      const turnstileToken = await getTurnstileToken();

      // ✅ timeout (para não ficar pendurado)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            consent: true,
            turnstileToken: turnstileToken,
          }),
          signal: controller.signal,
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Erro ao enviar o formulário");
        }
      } catch (err) {
        if (err?.name === "AbortError") {
          throw new Error("O pedido demorou demasiado tempo. Por favor, tente novamente.");
        }
        throw err;
      } finally {
        clearTimeout(timeout);
      }

      setStatus({
        type: "success",
        message: "Obrigado pelo seu contacto. Iremos responder com a maior brevidade possível.",
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

      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    } catch (err) {
      console.error(err);

      setStatus({
        type: "error",
        message:
          err?.message ||
          "Ocorreu um erro ao enviar o seu pedido. Por favor, tente novamente dentro de alguns minutos ou use o contacto direto.",
      });

      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
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
            disabled={submitting}
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
            disabled={submitting}
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
            disabled={submitting}
          />
        </div>

        <div className="sanus-contact-field">
          <label htmlFor="subject">Assunto</label>
          <select id="subject" name="subject" value={formData.subject} onChange={handleChange} disabled={submitting}>
            <option value="">Selecione uma opção</option>
            <option value="marcacao">Marcação de consulta</option>
            <option value="duvida-tratamento">Dúvida sobre tratamento</option>
            <option value="relatorio-exame">Envio de relatório/exame</option>
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
              disabled={submitting}
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
              disabled={submitting}
            />
            <span>Telemóvel</span>
          </label>

          <label className="sanus-contact-radio">
            <input
              type="radio"
              name="preferredContact"
              value="whatsapp"
              checked={formData.preferredContact === "whatsapp"}
              onChange={handleChange}
              disabled={submitting}
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
          disabled={submitting}
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
            disabled={submitting}
          />
          <span>Autorizo que a Sanus Vitae utilize os meus dados para responder ao meu pedido de contacto.</span>
        </label>
        <p className="sanus-contact-consent-meta">
          Os seus dados são utilizados apenas para responder ao seu pedido de contacto e não serão partilhados com
          terceiros. Se tiver dúvidas sobre proteção de dados, poderá contactar-nos através do email {clinicEmail}.
        </p>
      </div>

      {/* Turnstile (estilo Recruitment) */}
      <div className="sanus-turnstile">
        <div ref={turnstileContainerRef} />
        <p className="sanus-turnstile-hint">Verificação de segurança necessária para enviar a mensagem.</p>
      </div>

      {status.message && (
        <div
          className={
            "sanus-contact-status " +
            (status.type === "error" ? "sanus-contact-status-error" : "sanus-contact-status-success")
          }
          aria-live="polite"
        >
          {status.message}
        </div>
      )}

      <div className="sanus-contact-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "A enviar..." : "Enviar mensagem"}
        </button>

        {/* ✅ fix: tem de ser <a>, não <button href> */}
        <a href={buildWhatsappLink()} target="_blank" rel="noreferrer" className="btn btn-secundary">
          Abrir conversa WhatsApp
        </a>
      </div>
    </form>
  );
}