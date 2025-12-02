// components/FAQSection.jsx
import React from "react";
import "../styles/faq_section.css"; // opcional — se quiseres separar estilos

export default function FAQSection({ title = "Perguntas frequentes", subtitle = "Dúvidas", faqs = [] }) {
  return (
    <section className="sanus-contact-faq-section">
      <div className="sanus-contact-faq">
        <div className="sanus-contact-section-header">
          <header className="sanus-general-title">
            <p className="sanus-services-text little">{subtitle}</p>
            <h2>{title}</h2>
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
  );
}