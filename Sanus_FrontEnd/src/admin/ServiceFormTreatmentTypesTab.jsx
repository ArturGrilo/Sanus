// TreatmentTypesTab.jsx
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import IconPicker from "./IconPicker";

export default function TreatmentTypesTab({ treatmentTypes, setTreatmentTypes, error }) {
  // ✅ Accordion: guarda o id aberto
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!openId) return;
    const stillExists = treatmentTypes.some((t) => (t.id || "") === openId);
    if (!stillExists) setOpenId(null);
  }, [treatmentTypes, openId]);

  const toggleOpen = (id) => setOpenId((curr) => (curr === id ? null : id));

  const updateType = (index, patch) => {
    const copy = [...treatmentTypes];
    copy[index] = { ...copy[index], ...patch };
    setTreatmentTypes(copy);
  };

  const move = (from, to) => {
    if (to < 0 || to >= treatmentTypes.length) return;
    const copy = [...treatmentTypes];
    const tmp = copy[from];
    copy[from] = copy[to];
    copy[to] = tmp;
    setTreatmentTypes(copy);
  };

  const remove = (index) => {
    setTreatmentTypes(treatmentTypes.filter((_, i) => i !== index));
  };

  const add = () => {
    const id = uuidv4();
    setTreatmentTypes([
      ...treatmentTypes,
      { id, order: treatmentTypes.length + 1, icon: "", title: "", subtitle: "" },
    ]);
    setOpenId(id); // ✅ abre o novo
  };

  return (
    <section className="sv-tabpanel">
      <div className="sv-form-section">
        <div className="sv-form-section-title">
          <h3>Técnicas / Tipos de Tratamento</h3>
          <p>Manage techniques shown on the service page</p>
        </div>

        {error ? <div className="alert-error">{error}</div> : null}

        <div className="indications-admin-list">
          {treatmentTypes.map((t, index) => {
            const id = t.id || String(index);
            const isOpen = openId === id;

            const orderLabel = t.order ?? index + 1;
            const titleLabel = t.title?.trim() ? t.title : "Nova técnica";
            const subtitleLabel = t.subtitle?.trim() ? t.subtitle : "subtítulo por definir";
            const iconStatus = t.icon?.trim() ? "com ícone" : "sem ícone";

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
                      <div className="sv-acc-title">{titleLabel}</div>
                      <div className="sv-acc-sub">
                        {subtitleLabel} • {iconStatus}
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
                    <div className="sv-inline-controls">
                      <label style={{ padding: 0, border: "none", background: "transparent" }}>
                        <span>Ordem</span>
                        <input
                          placeholder="1"
                          value={t.order ?? index + 1}
                          onChange={(e) => updateType(index, { order: e.target.value })}
                        />
                      </label>

                      <div>
                        <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700, opacity: 0.7 }}>
                          Ícone
                        </div>
                        <IconPicker
                          value={t.icon || ""}
                          onChange={(iconName) => updateType(index, { icon: iconName })}
                          placeholder="Search icons (e.g. hand, heart, pulse)…"
                        />
                      </div>
                    </div>

                    <div className="sv-form-grid-2">
                      <label style={{ padding: 0, border: "none", background: "transparent" }}>
                        <span>Título</span>
                        <input
                          placeholder="Terapias manuais"
                          value={t.title || ""}
                          onChange={(e) => updateType(index, { title: e.target.value })}
                        />
                      </label>

                      <label style={{ padding: 0, border: "none", background: "transparent" }}>
                        <span>Subtítulo</span>
                        <input
                          placeholder="Massagem terapêutica, manipulação"
                          value={t.subtitle || ""}
                          onChange={(e) => updateType(index, { subtitle: e.target.value })}
                        />
                      </label>
                    </div>

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
                        disabled={index === treatmentTypes.length - 1}
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
          + Adicionar técnica
        </button>
      </div>
    </section>
  );
}
