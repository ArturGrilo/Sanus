import React, { useEffect, useMemo, useState } from "react";
import "../styles/faq_section.css";

function buildApiBase() {
  const direct = import.meta.env.VITE_BACKEND_URL;
  if (!direct) return "";
  return direct.replace(/\/$/, "");
}

export default function FAQSection({
  title = "Perguntas frequentes",
  subtitle = "Dúvidas",
  faqs = null,
  faqKey = null,
}) {
  const apiBase = useMemo(() => buildApiBase(), []);
  const [remote, setRemote] = useState({ loading: false, error: "", items: [], set: null });

  const shouldFetch = !!faqKey && !faqs;

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!shouldFetch) return;
      if (!apiBase) {
        setRemote({ loading: false, error: "Missing VITE_BACKEND_URL", items: [], set: null });
        return;
      }

      setRemote((s) => ({ ...s, loading: true, error: "" }));

      try {
        const res = await fetch(`${apiBase}/faqs?key=${encodeURIComponent(faqKey)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load");

        if (!alive) return;

        setRemote({
          loading: false,
          error: "",
          items: Array.isArray(data.items) ? data.items : [],
          set: data.set || null,
        });
      } catch {
        if (!alive) return;
        setRemote({ loading: false, error: "Não foi possível carregar as FAQs.", items: [], set: null });
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [shouldFetch, apiBase, faqKey]);

  const finalTitle = remote.set?.title || title;
  const finalSubtitle = remote.set?.subtitle || subtitle;
  const finalFaqs = faqs || remote.items || [];

  if (shouldFetch && remote.loading) {
    return (
      <section className="sanus-contact-faq-section">
        <div className="sanus-contact-faq">
          <div className="sanus-contact-section-header">
            <header className="sanus-general-title">
              <p className="sanus-services-text little">{finalSubtitle}</p>
              <h2>{finalTitle}</h2>
            </header>
          </div>
          <div className="sanus-contact-faq-grid">
            <div className="sanus-contact-faq-item" style={{ padding: 18 }}>
              <p>A carregar perguntas frequentes…</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (shouldFetch && remote.error) {
    return (
      <section className="sanus-contact-faq-section">
        <div className="sanus-contact-faq">
          <div className="sanus-contact-section-header">
            <header className="sanus-general-title">
              <p className="sanus-services-text little">{finalSubtitle}</p>
              <h2>{finalTitle}</h2>
            </header>
          </div>
          <div className="sanus-contact-faq-grid">
            <div className="sanus-contact-faq-item" style={{ padding: 18 }}>
              <p>{remote.error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="sanus-contact-faq-section">
      <div className="sanus-contact-faq">
        <div className="sanus-contact-section-header">
          <header className="sanus-general-title">
            <p className="sanus-services-text little">{finalSubtitle}</p>
            <h2>{finalTitle}</h2>
          </header>
        </div>

        <div className="sanus-contact-faq-grid">
          {finalFaqs.map((faq, idx) => (
            <details key={faq.id || idx} className="sanus-contact-faq-item">
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}