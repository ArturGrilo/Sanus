// ServiceFormFaqsTab.jsx
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function ServiceFormFaqsTab({ faqs, setFaqs }) {
  const safeList = useMemo(() => (Array.isArray(faqs) ? faqs : []), [faqs]);

  // ✅ Accordion: guarda o ID aberto (single open)
  const [openId, setOpenId] = useState(null);

  // ✅ Se removeres/alterares lista, garante que openId existe
  useEffect(() => {
    if (!openId) return;
    const stillExists = safeList.some((f, index) => (f?.id || `faq-${index}`) === openId);
    if (!stillExists) setOpenId(null);
  }, [safeList, openId]);

  const updateItem = (index, patch) => {
    const copy = [...safeList];
    copy[index] = { ...copy[index], ...patch };
    setFaqs(copy);
  };

  const addItem = () => {
    const id = uuidv4();
    const next = [
      ...safeList,
      {
        id, // UI only
        order: safeList.length + 1,
        question: "",
        answer: "",
      },
    ];
    setFaqs(next);

    // ✅ abre automaticamente o novo item
    setOpenId(id);
  };

  const removeItem = (index) => {
    const removing = safeList[index];
    const next = safeList.filter((_, i) => i !== index);
    setFaqs(next);

    const removingId = removing?.id || `faq-${index}`;
    if (removingId === openId) {
      const fallbackIndex = Math.max(0, index - 1);
      const fallback =
        next[fallbackIndex]?.id || (next[fallbackIndex] ? `faq-${fallbackIndex}` : null);
      setOpenId(fallback || null);
    }
  };

  const moveItem = (from, to) => {
    if (to < 0 || to >= safeList.length) return;
    const copy = [...safeList];
    const tmp = copy[from];
    copy[from] = copy[to];
    copy[to] = tmp;
    setFaqs(copy);
  };

  const toggleOpen = (id) => {
    setOpenId((curr) => (curr === id ? null : id));
  };

  return (
    <div className="sv-tabpanel">
      <div className="sv-section-head">
        <div>
          <h3>FAQs</h3>
          <p className="sv-muted">
            Perguntas frequentes (perfeitas para SEO e para reduzir fricção antes do agendamento).
          </p>
        </div>

        <button type="button" className="btn btn-secundary" onClick={addItem}>
          + Adicionar FAQ
        </button>
      </div>

      <div className="indications-admin-list">
        {safeList.map((f, index) => {
          const id = f?.id || `faq-${index}`;
          const isOpen = openId === id;

          return (
            <div key={id} className={`indication-admin-card ${isOpen ? "is-open" : ""}`}>
              {/* ✅ Accordion header (igual ao das Specialidades/Benefits) */}
              <button
                type="button"
                className="sv-acc-head"
                onClick={() => toggleOpen(id)}
                aria-expanded={isOpen}
              >
                <div className="sv-acc-left">
                  <span className="sv-acc-order">{f?.order ?? index + 1}</span>

                  <div className="sv-acc-titles">
                    <div className="sv-acc-title">
                      {String(f?.question || "").trim().length > 0
                        ? f.question
                        : "Nova FAQ"}
                    </div>

                  </div>
                </div>

                <div className="sv-acc-right">
                  <span className="sv-acc-chevron" aria-hidden="true">
                    {isOpen ? "▾" : "▸"}
                  </span>
                </div>
              </button>

              {/* ✅ Só renderiza os detalhes quando aberto */}
              {isOpen && (
                <div className="sv-acc-body">
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      placeholder="Ordem (ex: 1)"
                      style={{ width: 120 }}
                      value={f?.order ?? index + 1}
                      onChange={(e) => updateItem(index, { order: e.target.value })}
                    />

                    <input
                      placeholder="Pergunta (ex: Quantas sessões são necessárias?)"
                      value={f?.question || ""}
                      onChange={(e) => updateItem(index, { question: e.target.value })}
                    />
                  </div>

                  <textarea
                    placeholder="Resposta (clara, completa e confiante — sem promessas absolutas)"
                    rows={6}
                    value={f?.answer || ""}
                    onChange={(e) => updateItem(index, { answer: e.target.value })}
                    style={{ marginTop: 8 }}
                  />

                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secundary"
                      onClick={() => moveItem(index, index - 1)}
                      disabled={index === 0}
                      title="Mover para cima"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      className="btn btn-secundary"
                      onClick={() => moveItem(index, index + 1)}
                      disabled={index === safeList.length - 1}
                      title="Mover para baixo"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeItem(index)}
                      title="Remover FAQ"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {safeList.length === 0 && (
        <div className="sv-empty">Ainda não tens FAQs. Clica em “Adicionar FAQ”.</div>
      )}
    </div>
  );
}
