import { useEffect, useMemo, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import IconPicker from "./IconPicker";

export default function TreatmentTypesTab({
  serviceId, // ✅ precisa do docId do serviço
  treatmentTypes,
  setTreatmentTypes,
  error,
  API: APIFromProps, // ✅ opcional (se passares do ServiceForm)
}) {
  const [openId, setOpenId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  // ✅ refs por item (porque há vários inputs na lista)
  const fileInputRefs = useRef({});

  // ✅ suporta ambos: prop API ou env
  const API = APIFromProps || import.meta.env.VITE_BACKEND_URL;

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
    const newId = uuidv4();
    setTreatmentTypes([
      ...treatmentTypes,
      { id: newId, order: treatmentTypes.length + 1, icon: "", title: "", subtitle: "", imageUrl: "" },
    ]);
    setOpenId(newId);
  };

  async function doUpload(index, file) {
    if (!serviceId) {
      alert("Guarda o serviço primeiro (precisamos do ID do serviço).");
      return;
    }
    if (!file) return;

    const mime = file.type;
    const okMime = ["image/jpeg", "image/png", "image/webp"].includes(mime);
    if (!okMime) {
      alert("Formato não suportado. Usa JPG, PNG ou WEBP.");
      return;
    }

    const maxMb = 4;
    if (file.size > maxMb * 1024 * 1024) {
      alert(`Imagem muito grande. Máx. ${maxMb}MB.`);
      return;
    }

    const current = treatmentTypes[index];
    const itemId = String(current?.id || index);
    const previousUrl = String(current?.imageUrl || "").trim();

    setUploadingId(itemId);

    try {
      // 1) pedir signed upload url ao storage.routes.js
      const res = await fetch(`${API}/storage/service-treatment-type-upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: mime,
          serviceId,
          itemId,
          previousUrl, // ajuda a apagar logo a antiga
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const uploadUrl = data?.uploadUrl;
      const publicUrl = data?.publicUrl;

      if (!uploadUrl || !publicUrl) {
        throw new Error("Resposta inválida do endpoint de upload (faltam uploadUrl/publicUrl).");
      }

      // 2) upload binário
      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": mime },
        body: file,
      });

      if (!put.ok) {
        const msg = await put.text().catch(() => "");
        throw new Error(msg || `Upload falhou (HTTP ${put.status})`);
      }

      // 3) gravar publicUrl no item
      updateType(index, { imageUrl: publicUrl });

      // 4) limpar o input para permitir re-upload do mesmo ficheiro
      const el = fileInputRefs.current[itemId];
      if (el) el.value = "";
    } catch (e) {
      console.error(e);
      alert(`Erro no upload: ${e.message || e}`);
    } finally {
      setUploadingId(null);
    }
  }

  const hint = useMemo(() => {
    return (
      <div
        className="alert-info"
        style={{
          marginTop: 12,
          textAlign: "left",
          padding: 12,
          borderRadius: 12,
          background: "rgba(12, 62, 84, 0.06)",
          border: "1px solid rgba(12, 62, 84, 0.12)",
        }}
      >
        <strong>Imagens:</strong> faz upload aqui. No site público, o card pode usar esta imagem como{" "}
        <strong>background</strong>.
      </div>
    );
  }, []);

  return (
    <section className="sv-tabpanel">
      <div className="sv-form-section">
        <div className="sv-form-section-title">
          <h3>Técnicas / Tipos de Tratamento</h3>
          <p>Manage techniques shown on the service page</p>
        </div>

        {error ? <div className="alert-error">{error}</div> : null}
        {hint}

        <div className="indications-admin-list">
          {treatmentTypes.map((t, index) => {
            const id = String(t.id || index);
            const isOpen = openId === id;

            const orderLabel = t.order ?? index + 1;
            const titleLabel = t.title?.trim() ? t.title : "Nova técnica";
            const subtitleLabel = t.subtitle?.trim() ? t.subtitle : "subtítulo por definir";
            const iconStatus = t.icon?.trim() ? "com ícone" : "sem ícone";

            const img = String(t.imageUrl || "").trim();
            const hasImg = !!img;
            const isUploading = uploadingId === id;

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
                        {hasImg ? " • com imagem" : " • sem imagem"}
                        {isUploading ? " • a enviar..." : ""}
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

                    {/* ✅ Upload (thumbnail pequeno, sem background no BO) */}
                    <div style={{ marginTop: 12, textAlign: "left" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.75, marginBottom: 6 }}>
                        Imagem do card
                      </div>

                      {hasImg ? (
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <img
                            src={img}
                            alt=""
                            style={{
                              width: 92,
                              height: 64,
                              objectFit: "cover",
                              borderRadius: 10,
                              border: "1px solid rgba(12,62,84,.15)",
                            }}
                          />

                          {/* manter label aqui é ok (é só para abrir picker) */}
                          <button
                            className="btn btn-secundary"
                            style={{ cursor: isUploading ? "not-allowed" : "pointer" }}
                          >
                            {isUploading ? "A enviar..." : "Trocar imagem"}
                            <input
                              ref={(el) => {
                                fileInputRefs.current[id] = el;
                              }}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              disabled={isUploading}
                              style={{ display: "none" }}
                              onChange={(e) => doUpload(index, e.target.files?.[0])}
                            />
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline"
                            disabled={isUploading}
                            onClick={() => updateType(index, { imageUrl: "" })}
                          >
                            Remover imagem
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn btn-secundary"
                            onClick={() => fileInputRefs.current[id]?.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? "A enviar..." : "Upload imagem"}
                          </button>

                          <input
                            ref={(el) => {
                              fileInputRefs.current[id] = el;
                            }}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={isUploading}
                            style={{ display: "none" }}
                            onChange={(e) => doUpload(index, e.target.files?.[0])}
                          />
                        </>
                      )}

                      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                        JPG/PNG/WEBP até 4MB. No site público, esta imagem pode ser usada como background no card.
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button
                        type="button"
                        className="btn btn-secundary"
                        onClick={() => move(index, index - 1)}
                        disabled={index === 0 || isUploading}
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        className="btn btn-secundary"
                        onClick={() => move(index, index + 1)}
                        disabled={index === treatmentTypes.length - 1 || isUploading}
                      >
                        ↓
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => remove(index)}
                        disabled={isUploading}
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

        <button type="button" className="btn btn-secundary" onClick={add}>
          + Adicionar técnica
        </button>
      </div>
    </section>
  );
}