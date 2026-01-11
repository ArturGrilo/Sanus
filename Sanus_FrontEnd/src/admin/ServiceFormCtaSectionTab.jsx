export default function ServiceFormCtaSectionTab({ ctaSection, setCtaSection }) {
  const value = ctaSection && typeof ctaSection === "object" ? ctaSection : { btn_text: "", cta_text: "" };

  const update = (patch) => {
    setCtaSection({ ...value, ...patch });
  };

  return (
    <div className="sv-tabpanel">
      <div className="sv-section-head">
        <div>
          <h3>CTA Section</h3>
          <p className="sv-muted">
            Bloco final de conversão: um texto curto e um botão (idealmente para WhatsApp / Contactos / Marcação).
          </p>
        </div>
      </div>

      <div className="indication-admin-card">
        <input
          placeholder="Texto do botão (btn_text) — ex: Marcar avaliação"
          value={value.btn_text || ""}
          onChange={(e) => update({ btn_text: e.target.value })}
        />

        <textarea
          placeholder="Texto do CTA (cta_text) — ex: Fale connosco e comece hoje o seu plano personalizado."
          rows={4}
          value={value.cta_text || ""}
          onChange={(e) => update({ cta_text: e.target.value })}
        />

        <div className="sv-muted" style={{ marginTop: 10 }}>
          Dica: mantém o CTA <strong>direto</strong>, <strong>humano</strong> e com uma promessa realista (ex: avaliação + plano).
        </div>
      </div>
    </div>
  );
}
