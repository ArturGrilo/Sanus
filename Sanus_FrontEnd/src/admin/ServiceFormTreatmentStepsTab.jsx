// TreatmentStepsTab.jsx
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function TreatmentStepsTab({ treatmentSteps, setTreatmentSteps }) {
  // ✅ Accordion: guarda o id aberto
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!openId) return;
    const stillExists = treatmentSteps.some((s) => (s.id || "") === openId);
    if (!stillExists) setOpenId(null);
  }, [treatmentSteps, openId]);

  const toggleOpen = (id) => {
    setOpenId((curr) => (curr === id ? null : id));
  };

  const updateStep = (index, patch) => {
    const copy = [...treatmentSteps];
    copy[index] = { ...copy[index], ...patch };
    setTreatmentSteps(copy);
  };

  const move = (from, to) => {
    if (to < 0 || to >= treatmentSteps.length) return;
    const copy = [...treatmentSteps];
    const tmp = copy[from];
    copy[from] = copy[to];
    copy[to] = tmp;
    setTreatmentSteps(copy);
  };

  const remove = (index) => {
    setTreatmentSteps(treatmentSteps.filter((_, i) => i !== index));
  };

  const add = () => {
    const id = uuidv4();
    const nextIndex = treatmentSteps.length + 1;

    setTreatmentSteps([
      ...treatmentSteps,
      {
        id,
        order: nextIndex,
        icon: String(nextIndex),
        title: "",
        bullets: [],
      },
    ]);

    setOpenId(id); // ✅ abre o novo
  };

  return (
    <section className="sv-tabpanel">
      <div className="sv-form-section">
        <div className="sv-form-section-title">
          <h3>Tratamento (Etapas)</h3>
          <p>Steps shown in the “Tratamento” section</p>
        </div>

        <div className="indications-admin-list">
          {treatmentSteps.map((step, index) => {
            const id = step.id || String(index);
            const isOpen = openId === id;

            const orderLabel = step.order ?? index + 1;
            const iconLabel = step.icon?.trim() ? step.icon : "—";
            const titleLabel = step.title?.trim() ? step.title : "Nova etapa";
            const bulletsCount = Array.isArray(step.bullets)
              ? step.bullets.filter((b) => String(b || "").trim()).length
              : 0;

            return (
              <div key={id} className={`indication-admin-card ${isOpen ? "is-open" : ""}`}>
                {/* ✅ Accordion header */}
                <button
                  type="button"
                  className="sv-acc-head"
                  onClick={() => toggleOpen(id)}
                  aria-expanded={isOpen}
                >
                  <div className="sv-acc-left">
                    <span className="sv-acc-order">{orderLabel}</span>

                    <div className="sv-acc-titles">
                      <div className="sv-acc-title">
                        {iconLabel} • {titleLabel}
                      </div>
                      <div className="sv-acc-sub">
                        {bulletsCount > 0 ? `${bulletsCount} bullet(s)` : "sem bullets"}
                      </div>
                    </div>
                  </div>

                  <div className="sv-acc-right">
                    <span className="sv-acc-chevron" aria-hidden="true">
                      {isOpen ? "▾" : "▸"}
                    </span>
                  </div>
                </button>

                {/* ✅ Body só quando aberto */}
                {isOpen && (
                  <div className="sv-acc-body">
                    <div className="sv-form-grid-2">
                      <label style={{ padding: 0, border: "none", background: "transparent" }}>
                        <span>Ordem</span>
                        <input
                          placeholder="1"
                          value={step.order ?? index + 1}
                          onChange={(e) => updateStep(index, { order: e.target.value })}
                        />
                      </label>

                      <label style={{ padding: 0, border: "none", background: "transparent" }}>
                        <span>Ícone</span>
                        <input
                          placeholder="1, ✓, 🔥"
                          value={step.icon || ""}
                          onChange={(e) => updateStep(index, { icon: e.target.value })}
                        />
                      </label>
                    </div>

                    <label style={{ padding: 0, border: "none", background: "transparent" }}>
                      <span>Título</span>
                      <input
                        placeholder="Avaliação"
                        value={step.title || ""}
                        onChange={(e) => updateStep(index, { title: e.target.value })}
                      />
                    </label>

                    <label style={{ padding: 0, border: "none", background: "transparent" }}>
                      <span>Bullets (1 por linha)</span>
                      <textarea
                        placeholder={`Ex:\nHistória clínica\nTestes de mobilidade\nPlano personalizado`}
                        value={Array.isArray(step.bullets) ? step.bullets.join("\n") : ""}
                        onChange={(e) =>
                          updateStep(index, {
                            bullets: e.target.value
                              .split("\n")
                              .map((x) => x.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </label>

                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button
                        type="button"
                        className="btn btn-secundary"
                        onClick={() => move(index, index - 1)}
                        disabled={index === 0}
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        className="btn btn-secundary"
                        onClick={() => move(index, index + 1)}
                        disabled={index === treatmentSteps.length - 1}
                      >
                        ↓
                      </button>

                      <button type="button" className="btn btn-danger" onClick={() => remove(index)}>
                        Remover
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button type="button" className="btn btn-secundary" onClick={add}>
          + Adicionar etapa
        </button>
      </div>
    </section>
  );
}
