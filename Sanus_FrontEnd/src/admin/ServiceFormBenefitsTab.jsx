// ServiceFormBenefitsTab.jsx
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function ServiceFormBenefitsTab({ benefits, setBenefits }) {
  const safeList = useMemo(() => (Array.isArray(benefits) ? benefits : []), [benefits]);

  // ✅ Accordion: guarda o ID aberto (single open)
  const [openId, setOpenId] = useState(null);

  // ✅ Se removeres/alterares lista, garante que openId existe
  useEffect(() => {
    if (!openId) return;
    const stillExists = safeList.some((b, index) => (b?.id || `benefit-${index}`) === openId);
    if (!stillExists) setOpenId(null);
  }, [safeList, openId]);

  const updateItem = (index, patch) => {
    const copy = [...safeList];
    copy[index] = { ...copy[index], ...patch };
    setBenefits(copy);
  };

  const moveItem = (from, to) => {
    if (to < 0 || to >= safeList.length) return;
    const copy = [...safeList];
    const tmp = copy[from];
    copy[from] = copy[to];
    copy[to] = tmp;
    setBenefits(copy);
  };

  const removeItem = (index) => {
    const removing = safeList[index];
    const next = safeList.filter((_, i) => i !== index);
    setBenefits(next);

    const removingId = removing?.id || `benefit-${index}`;
    if (removingId === openId) {
      const fallback = next[Math.max(0, index - 1)]?.id || (next[Math.max(0, index - 1)] ? `benefit-${Math.max(0, index - 1)}` : null);
      setOpenId(fallback || null);
    }
  };

  const addItem = () => {
    const id = uuidv4();
    const next = [
      ...safeList,
      {
        id, // UI only
        order: safeList.length + 1,
        title: "",
        bullets: [""],
      },
    ];
    setBenefits(next);

    // ✅ abre automaticamente o novo item
    setOpenId(id);
  };

  const updateBullet = (index, bulletIndex, value) => {
    const copy = [...safeList];
    const item = copy[index] || {};
    const bullets = Array.isArray(item.bullets) ? [...item.bullets] : [];
    bullets[bulletIndex] = value;
    copy[index] = { ...item, bullets };
    setBenefits(copy);
  };

  const addBullet = (index) => {
    const copy = [...safeList];
    const item = copy[index] || {};
    const bullets = Array.isArray(item.bullets) ? [...item.bullets] : [];
    bullets.push("");
    copy[index] = { ...item, bullets };
    setBenefits(copy);
  };

  const removeBullet = (index, bulletIndex) => {
    const copy = [...safeList];
    const item = copy[index] || {};
    const bullets = Array.isArray(item.bullets) ? [...item.bullets] : [];
    if (bullets.length <= 1) return;
    bullets.splice(bulletIndex, 1);
    copy[index] = { ...item, bullets };
    setBenefits(copy);
  };

  const toggleOpen = (id) => {
    setOpenId((curr) => (curr === id ? null : id));
  };

  const summaryText = (b) => {
    const bullets = Array.isArray(b?.bullets) ? b.bullets : [];
    const first = (bullets.find((x) => String(x || "").trim().length > 0) || "").trim();
    if (!first) return `${bullets.length || 0} bullet(s)`;
    const short = first.length > 58 ? `${first.slice(0, 58).trim()}…` : first;
    return `${bullets.length || 0} bullet(s) • ${short}`;
  };

  return (
    <div className="sv-tabpanel">
      <div className="sv-section-head">
        <div>
          <h3>Benefícios</h3>
          <p className="sv-muted">
            Estrutura por blocos: <strong>título</strong> + lista de <strong>bullets</strong>.
          </p>
        </div>

        <button type="button" className="btn btn-secundary" onClick={addItem}>
          + Adicionar benefício
        </button>
      </div>

      <div className="indications-admin-list">
        {safeList.map((b, index) => {
          const id = b?.id || `benefit-${index}`;
          const isOpen = openId === id;

          return (
            <div key={id} className={`indication-admin-card ${isOpen ? "is-open" : ""}`}>
              {/* ✅ Accordion header (igual ao das Specialidades) */}
              <button
                type="button"
                className="sv-acc-head"
                onClick={() => toggleOpen(id)}
                aria-expanded={isOpen}
              >
                <div className="sv-acc-left">
                  <span className="sv-acc-order">{b?.order ?? index + 1}</span>

                  <div className="sv-acc-titles">
                    <div className="sv-acc-title">
                      {String(b?.title || "").trim().length > 0 ? b.title : `Novo benefício`}
                    </div>

                    <div className="sv-acc-sub">{summaryText(b)}</div>
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
                      value={b?.order ?? index + 1}
                      onChange={(e) => updateItem(index, { order: e.target.value })}
                    />

                    <input
                      placeholder="Título do benefício (ex: Menos dor, mais mobilidade)"
                      value={b?.title || ""}
                      onChange={(e) => updateItem(index, { title: e.target.value })}
                    />
                  </div>

                  <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                    {(Array.isArray(b?.bullets) ? b.bullets : [""]).map((bullet, bulletIndex) => (
                      <div key={bulletIndex} style={{ display: "flex", gap: 8 }}>
                        <input
                          placeholder={`Bullet ${bulletIndex + 1} (ex: Reduz tensão muscular…)`}
                          value={bullet || ""}
                          onChange={(e) => updateBullet(index, bulletIndex, e.target.value)}
                        />

                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => removeBullet(index, bulletIndex)}
                          disabled={(b?.bullets || []).length <= 1}
                          title="Remover bullet"
                        >
                          Remover
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-secundary"
                      onClick={() => addBullet(index)}
                    >
                      + Adicionar bullet
                    </button>
                  </div>

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
                      title="Remover benefício"
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
        <div className="sv-empty">Ainda não tens benefícios. Clica em “Adicionar benefício”.</div>
      )}
    </div>
  );
}
