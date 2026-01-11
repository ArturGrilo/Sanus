// IndicationsTab.jsx
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function IndicationsTab({
  indications,
  setIndications,
  API,
  serviceId,
  setError,
}) {
  // ✅ Accordion: guarda o ID aberto
  const [openId, setOpenId] = useState(null);

  // ✅ Se removeres um item aberto, fecha
  useEffect(() => {
    if (!openId) return;
    const stillExists = indications.some((i) => (i.id || "") === openId);
    if (!stillExists) setOpenId(null);
  }, [indications, openId]);

  const toggleOpen = (id) => {
    setOpenId((curr) => (curr === id ? null : id));
  };

  const updateItem = (index, patch) => {
    const copy = [...indications];
    copy[index] = { ...copy[index], ...patch };
    setIndications(copy);
  };

  const removeItem = (index) => {
    setIndications(indications.filter((_, i) => i !== index));
  };

  const addItem = () => {
    const id = uuidv4();
    setIndications([...indications, { id, title: "", subtitle: "", text: "", imageUrl: "" }]);
    setOpenId(id); // ✅ abre o novo
  };

  return (
    <section className="sv-tabpanel">
      <div className="sv-form-section">
        <div className="sv-form-section-title">
          <h3>Indicações</h3>
          <p>Cards “Para quem é indicada?”</p>
        </div>

        <div className="indications-admin-list">
          {indications.map((item, index) => {
            const id = item.id || String(index);
            const isOpen = openId === id;

            const titleLabel = item.title?.trim() ? item.title : "Nova indicação";
            const subtitleLabel = item.subtitle?.trim() ? item.subtitle : "subtítulo por definir";

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
                    <span className="sv-acc-order">{index + 1}</span>

                    <div className="sv-acc-titles">
                      <div className="sv-acc-title">{titleLabel}</div>
                      <div className="sv-acc-sub">
                        {subtitleLabel}
                        {item.imageUrl ? " • com imagem" : " • sem imagem"}
                      </div>
                    </div>
                  </div>

                  <div className="sv-acc-right">
                    <span className="sv-acc-chevron" aria-hidden="true">
                      {isOpen ? "▾" : "▸"}
                    </span>
                  </div>
                </button>

                {/* ✅ Detalhes só quando aberto */}
                {isOpen && (
                  <div className="sv-acc-body">
                    <div className="sv-form-grid-2">
                      <label style={{ padding: 0, border: "none", background: "transparent" }}>
                        <span>Título</span>
                        <input
                          placeholder="Título"
                          value={item.title || ""}
                          onChange={(e) => updateItem(index, { title: e.target.value })}
                        />
                      </label>

                      <label style={{ padding: 0, border: "none", background: "transparent" }}>
                        <span>Subtítulo</span>
                        <input
                          placeholder="Subtítulo"
                          value={item.subtitle || ""}
                          onChange={(e) => updateItem(index, { subtitle: e.target.value })}
                        />
                      </label>
                    </div>

                    <label style={{ padding: 0, border: "none", background: "transparent" }}>
                      <span>Texto</span>
                      <textarea
                        placeholder="Texto adicional (opcional)"
                        value={item.text || ""}
                        onChange={(e) => updateItem(index, { text: e.target.value })}
                      />
                    </label>

                    <label style={{ padding: 0, border: "none", background: "transparent" }}>
                      <span>Imagem</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const sigRes = await fetch(
                            `${API}/storage/service-indication-upload-url`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                fileName: file.name,
                                contentType: file.type,
                                serviceId,
                                itemId: item.id,
                              }),
                            }
                          );

                          if (!sigRes.ok) {
                            setError("Falha ao obter URL assinado (indicação).");
                            return;
                          }

                          const { uploadUrl, publicUrl } = await sigRes.json();

                          const putRes = await fetch(uploadUrl, {
                            method: "PUT",
                            headers: { "Content-Type": file.type },
                            body: file,
                          });

                          if (!putRes.ok) {
                            setError("Falha no upload da imagem (indicação).");
                            return;
                          }

                          updateItem(index, { imageUrl: publicUrl });
                        }}
                      />

                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          style={{ maxWidth: 220, marginTop: 10, borderRadius: 12 }}
                        />
                      ) : null}
                    </label>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeItem(index)}
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button type="button" className="btn btn-secundary" onClick={addItem}>
          + Adicionar indicação
        </button>
      </div>
    </section>
  );
}
