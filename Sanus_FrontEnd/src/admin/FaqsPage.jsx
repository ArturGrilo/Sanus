import React, { useEffect, useMemo, useState } from "react";
import Header from "./Header";
import "./FaqsPage.css";
import { authedFetch } from "../lib/authedFetch";
import { color } from "framer-motion";

function buildApiBase() {
  const direct = import.meta.env.VITE_BACKEND_URL;
  if (!direct) return "";
  return direct.replace(/\/$/, "");
}

function slugifyKey(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function FaqsPage() {
  const apiBase = useMemo(() => buildApiBase(), []);

  // data
  const [sets, setSets] = useState([]);
  const [activeSetId, setActiveSetId] = useState("");
  const [activeSet, setActiveSet] = useState(null);
  const [items, setItems] = useState([]);

  // ui
  const [loadingSets, setLoadingSets] = useState(false);
  const [loadingSet, setLoadingSet] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // left side filters
  const [query, setQuery] = useState("");

  // right side tabs
  const [tab, setTab] = useState("faqs"); // "faqs" | "settings"

  // create set modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newSet, setNewSet] = useState({
    key: "",
    title: "Perguntas Frequentes",
    subtitle: "Dúvidas",
    isEnabled: true,
  });

  // edit set
  const [editSet, setEditSet] = useState({
    key: "",
    title: "",
    subtitle: "",
    isEnabled: true,
  });

  // new item (inline)
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({ question: "", answer: "" });

  // ============================================================
  // Loaders
  // ============================================================
  async function loadSets(nextActiveId = null) {
    if (!apiBase) return;
    setLoadingSets(true);
    setStatus({ type: "", message: "" });

    try {
      const data = await authedFetch(`${apiBase}/admin/faqs/sets`, { method: "GET" });
      const list = Array.isArray(data.sets) ? data.sets : [];
      setSets(list);

      // pick active set robustly
      const desired = nextActiveId || activeSetId;
      if (desired && list.find((s) => s.id === desired)) {
        setActiveSetId(desired);
      } else if (list.length) {
        setActiveSetId(list[0].id);
      } else {
        setActiveSetId("");
        setActiveSet(null);
        setItems([]);
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Não foi possível carregar os conjuntos de FAQs." });
    } finally {
      setLoadingSets(false);
    }
  }

  async function loadActiveSet() {
    if (!apiBase || !activeSetId) return;
    setLoadingSet(true);
    setStatus({ type: "", message: "" });

    try {
      const data = await authedFetch(`${apiBase}/admin/faqs/sets/${activeSetId}`, { method: "GET" });
      const setObj = data.set || null;

      setActiveSet(setObj);
      setItems(Array.isArray(data.items) ? data.items : []);

      setEditSet({
        key: setObj?.key || "",
        title: setObj?.title || "Perguntas Frequentes",
        subtitle: setObj?.subtitle || "Dúvidas",
        isEnabled: setObj?.isEnabled !== false,
      });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Não foi possível carregar este conjunto." });
    } finally {
      setLoadingSet(false);
    }
  }

  useEffect(() => {
    loadSets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  useEffect(() => {
    loadActiveSet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSetId]);

  const filteredSets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sets;
    return sets.filter((s) => String(s.key || "").toLowerCase().includes(q));
  }, [sets, query]);

  // ============================================================
  // Sets CRUD
  // ============================================================
  async function createSet() {
    const key = slugifyKey(newSet.key);
    if (!key) {
      setStatus({ type: "error", message: "Define uma key (ex.: quem-somos, recrutamento, contactos)." });
      return;
    }

    try {
      const data = await authedFetch(`${apiBase}/admin/faqs/sets`, {
        method: "POST",
        body: JSON.stringify({
          key,
          title: String(newSet.title || "").trim() || "Perguntas Frequentes",
          subtitle: String(newSet.subtitle || "").trim() || "Dúvidas",
          isEnabled: !!newSet.isEnabled,
        }),
      });

      setCreateOpen(false);
      setNewSet({ key: "", title: "Perguntas Frequentes", subtitle: "Dúvidas", isEnabled: true });

      // refresh and auto-open new set (if id returned)
      await loadSets(data?.id || null);
      setStatus({ type: "success", message: "Conjunto criado." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err?.message || "Não foi possível criar o conjunto." });
    }
  }

  async function saveSet() {
    if (!activeSetId) return;

    const key = slugifyKey(editSet.key);
    if (!key) {
      setStatus({ type: "error", message: "A key do conjunto não pode ficar vazia." });
      return;
    }

    try {
      await authedFetch(`${apiBase}/admin/faqs/sets/${activeSetId}`, {
        method: "PUT",
        body: JSON.stringify({
          key,
          title: String(editSet.title || "").trim() || "Perguntas Frequentes",
          subtitle: String(editSet.subtitle || "").trim() || "Dúvidas",
          isEnabled: !!editSet.isEnabled,
        }),
      });

      await loadSets(activeSetId);
      await loadActiveSet();
      setStatus({ type: "success", message: "Configuração guardada." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err?.message || "Não foi possível guardar." });
    }
  }

  async function deleteSet() {
    if (!activeSetId) return;
    const ok = window.confirm("Queres mesmo apagar este conjunto e todas as FAQs?");
    if (!ok) return;

    try {
      await authedFetch(`${apiBase}/admin/faqs/sets/${activeSetId}`, { method: "DELETE" });
      setActiveSetId("");
      setActiveSet(null);
      setItems([]);
      await loadSets(null);
      setStatus({ type: "success", message: "Conjunto removido." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err?.message || "Não foi possível apagar." });
    }
  }

  // ============================================================
  // Items CRUD
  // ============================================================
  async function addItem() {
    if (!activeSetId) return;

    const q = String(newItem.question || "").trim();
    const a = String(newItem.answer || "").trim();
    if (!q || !a) {
      setStatus({ type: "error", message: "Preenche pergunta e resposta." });
      return;
    }

    try {
      const maxOrder = items.length ? Math.max(...items.map((i) => i.order || 0)) : 0;

      await authedFetch(`${apiBase}/admin/faqs/sets/${activeSetId}/items`, {
        method: "POST",
        body: JSON.stringify({
          question: q,
          answer: a,
          order: maxOrder + 1,
          isEnabled: true,
        }),
      });

      setNewItem({ question: "", answer: "" });
      setNewItemOpen(false);
      await loadActiveSet();
      setStatus({ type: "success", message: "FAQ adicionada." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err?.message || "Não foi possível adicionar." });
    }
  }

  async function updateItem(itemId, patch) {
    if (!activeSetId) return;

    try {
      await authedFetch(`${apiBase}/admin/faqs/sets/${activeSetId}/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      await loadActiveSet();
      setStatus({ type: "success", message: "Alterações guardadas." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err?.message || "Não foi possível guardar." });
    }
  }

  async function deleteItem(itemId) {
    if (!activeSetId) return;
    const ok = window.confirm("Remover esta FAQ?");
    if (!ok) return;

    try {
      await authedFetch(`${apiBase}/admin/faqs/sets/${activeSetId}/items/${itemId}`, {
        method: "DELETE",
      });
      await loadActiveSet();
      setStatus({ type: "success", message: "FAQ removida." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err?.message || "Não foi possível remover." });
    }
  }

  async function moveItem(itemId, dir) {
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx < 0) return;

    const nextIdx = dir === "up" ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= items.length) return;

    const reordered = [...items];
    const tmp = reordered[idx];
    reordered[idx] = reordered[nextIdx];
    reordered[nextIdx] = tmp;

    try {
      await authedFetch(`${apiBase}/admin/faqs/sets/${activeSetId}/reorder`, {
        method: "PUT",
        body: JSON.stringify({ orderedIds: reordered.map((i) => i.id) }),
      });
      await loadActiveSet();
      setStatus({ type: "success", message: "Ordem atualizada." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err?.message || "Não foi possível reordenar." });
    }
  }

  // ============================================================
  // Render
  // ============================================================
  const activeLabel = activeSet?.key || (activeSetId ? "Conjunto" : "Sem conjunto");

  return (
    <div className="bo-page">
      <Header />

      <main className="blog-list-main">
        <div className="bo-head">
          <div style={{"display":"flex", "alignItems":"start", "flexDirection":"column"}}>
            <h2>Gerir FAQs</h2>
            <p>Organiza FAQs por página (ex.: quem-somos, recrutamento, contactos).</p>
            <p className="sanus-warning-message">
              FAQs relacionadas com os serviços são editadas na página específica de cada serviço,
              aqui na área administrativa.
            </p>
          </div>

          <div className="bo-headActions">
            <button className="btn btn-primary" type="button" onClick={() => loadSets(activeSetId)} disabled={loadingSets}>
              Atualizar
            </button>
            <button className="btn btn-secundary" type="button" onClick={() => setCreateOpen(true)}>
              Novo conjunto
            </button>
          </div>
        </div>

        {status.message ? <div className={`bo-status ${status.type}`}>{status.message}</div> : null}

        <div className="bo-grid">
          {/* LEFT: Sets */}
          <aside className="bo-panel">
            <div className="bo-panelTop">
              <div className="bo-panelTitle">Páginas</div>
              <div className="bo-panelHint">Seleciona um conjunto</div>
            </div>

            <div className="bo-search">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar… (ex.: quem-somos)"
              />
            </div>

            {loadingSets ? <div className="bo-muted">A carregar conjuntos…</div> : null}

            <div className="bo-setList">
              {filteredSets.length === 0 ? (
                <div className="bo-empty">
                  <strong>Sem conjuntos</strong>
                  <p>Clica em “Novo conjunto” para criares a primeira página.</p>
                </div>
              ) : (
                filteredSets.map((s) => {
                  const isActive = s.id === activeSetId;
                  const enabled = s.isEnabled !== false;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`bo-setRow ${isActive ? "active" : ""}`}
                      onClick={() => {
                        setActiveSetId(s.id);
                        setTab("faqs");
                        setNewItemOpen(false);
                      }}
                    >
                      <div className="bo-setRowMain">
                        <div className="bo-setKey">{s.key}</div>
                        <div className="bo-setMeta">
                          {enabled ? <span className="bo-pill ok">Ativo</span> : <span className="bo-pill off">Desativado</span>}
                        </div>
                      </div>
                      <div className="bo-setRowSub">
                        {s.title || "Perguntas Frequentes"} · {s.subtitle || "Dúvidas"}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* RIGHT: Editor */}
          <section className="bo-editor">
            {!activeSetId ? (
              <div className="bo-editorEmpty">
                <h3>Escolhe uma página</h3>
                <p>Seleciona um conjunto à esquerda ou cria um novo.</p>
              </div>
            ) : (
              <>
                <div className="bo-editorTop">
                  <div>
                    <div className="bo-crumb">Conjunto</div>
                    <div className="bo-editorTitle">
                      {activeLabel} {activeSet?.isEnabled === false ? <span className="bo-pill off">Desativado</span> : null}
                    </div>
                  </div>

                  <div className="bo-editorTabs" role="tablist" aria-label="Tabs FAQ">
                    <button
                      type="button"
                      className={`bo-tab2 ${tab === "faqs" ? "active" : ""}`}
                      onClick={() => setTab("faqs")}
                    >
                      FAQs
                    </button>
                    <button
                      type="button"
                      className={`bo-tab2 ${tab === "settings" ? "active" : ""}`}
                      onClick={() => setTab("settings")}
                    >
                      Configuração
                    </button>
                  </div>
                </div>

                {loadingSet ? <div className="bo-muted">A carregar…</div> : null}

                {/* TAB: FAQs */}
                {tab === "faqs" ? (
                  <div className="bo-card">
                    <div className="bo-cardHead">
                      <div>
                        <h3>FAQs</h3>
                        <p>Escreve perguntas claras. Mantém respostas curtas e humanas.</p>
                      </div>

                      <div className="bo-cardActions">
                        <button className="btn btn-secundary" type="button" onClick={() => setNewItemOpen((v) => !v)}>
                          Adicionar FAQ
                        </button>
                      </div>
                    </div>

                    {newItemOpen ? (
                      <div className="bo-inlineForm">
                        <label>
                          Pergunta
                          <input className="bo-faqPerguntaInput"
                            value={newItem.question}
                            onChange={(e) => setNewItem((p) => ({ ...p, question: e.target.value }))}
                            placeholder="Ex.: Os tratamentos são personalizados?"
                          />
                        </label>

                        <label>
                          Resposta
                          <textarea className="bo-faqPerguntaInput"
                            rows={4}
                            value={newItem.answer}
                            onChange={(e) => setNewItem((p) => ({ ...p, answer: e.target.value }))}
                            placeholder="Escreve uma resposta clara e humana…"
                          />
                        </label>

                        <div className="bo-inlineActions">
                          <button className="btn btn-primary" type="button" onClick={() => setNewItemOpen(false)}>
                            Cancelar
                          </button>
                          <button className="btn btn-secundary" type="button" onClick={addItem}>
                            Guardar FAQ
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {items.length === 0 ? (
                      <div className="bo-empty">
                        <strong>Sem FAQs</strong>
                        <p>Clica em “Adicionar FAQ” para criares a primeira.</p>
                      </div>
                    ) : (
                      <div className="bo-faqList">
                        {items.map((it, idx) => {
                          const enabled = it.isEnabled !== false;
                          return (
                            <details key={it.id} className="bo-faqCard" open={idx === 0}>
                              <summary>
                                <div className="bo-faqSummary">
                                  <div className="bo-faqTitle">
                                    {it.question || "(sem pergunta)"}
                                    {enabled ? <span className="bo-pill ok">Ativo</span> : <span className="bo-pill off">Desativado</span>}
                                  </div>

                                  <div className="bo-faqBtns" onClick={(e) => e.preventDefault()}>
                                    <button className="bo-iconBtn" type="button" title="Subir" onClick={() => moveItem(it.id, "up")}>
                                      ↑
                                    </button>
                                    <button className="bo-iconBtn" type="button" title="Descer" onClick={() => moveItem(it.id, "down")}>
                                      ↓
                                    </button>
                                    <button
                                      className="bo-iconBtn"
                                      type="button"
                                      title={enabled ? "Desativar" : "Ativar"}
                                      onClick={() => updateItem(it.id, { isEnabled: !enabled })}
                                    >
                                      {enabled ? "⏸" : "▶"}
                                    </button>
                                    <button className="bo-iconBtn danger" type="button" title="Remover" onClick={() => deleteItem(it.id)}>
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              </summary>

                              <div className="bo-faqBody">
                                <label className="bo-faqPerguntaLabel">
                                  Pergunta
                                  <input className="bo-faqPerguntaInput"
                                    value={it.question || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, question: val } : x)));
                                    }}
                                    onBlur={(e) => updateItem(it.id, { question: e.target.value })}
                                  />
                                </label>

                                <label>
                                  Resposta
                                  <textarea className="bo-faqPerguntaInput"
                                    rows={5}
                                    value={it.answer || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, answer: val } : x)));
                                    }}
                                    onBlur={(e) => updateItem(it.id, { answer: e.target.value })}
                                  />
                                </label>

                                <div className="bo-faqFoot">
                                  <button
                                    className="bo-btn bo-btnGhost"
                                    type="button"
                                    onClick={() => updateItem(it.id, { isEnabled: !enabled })}
                                  >
                                    {enabled ? "Desativar" : "Ativar"}
                                  </button>
                                </div>
                              </div>
                            </details>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null}

                {/* TAB: Settings */}
                {tab === "settings" ? (
                  <div className="bo-card">
                    <div className="bo-cardHead">
                      <div>
                        <h3>Configuração</h3>
                        <p>Controla título/subtítulo e visibilidade do conjunto.</p>
                      </div>
                      <div className="bo-cardActions">
                        <button className="btn btn-secundary" type="button" onClick={saveSet}>
                          Guardar
                        </button>
                      </div>
                    </div>

                    <div className="bo-formGrid2">

                      <label>
                        Título
                        <input value={editSet.title} onChange={(e) => setEditSet((p) => ({ ...p, title: e.target.value }))} />
                      </label>

                      <label>
                        Subtítulo
                        <input value={editSet.subtitle} onChange={(e) => setEditSet((p) => ({ ...p, subtitle: e.target.value }))} />
                      </label>

                      <label className="bo-checkRow">
                        <input
                          type="checkbox"
                          checked={!!editSet.isEnabled}
                          onChange={(e) => setEditSet((p) => ({ ...p, isEnabled: e.target.checked }))}
                        />
                        <span>Conjunto ativo no site</span>
                      </label>
                    </div>

                    <div className="bo-dangerZone">
                      <div>
                        <strong>Zona de perigo</strong>
                        <p>Apaga este conjunto e todas as FAQs associadas (irreversível).</p>
                      </div>
                      <button className="btn btn-secundary" type="button" onClick={deleteSet}>
                        Apagar conjunto
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      </main>

      {/* MODAL: Create set */}
      {createOpen ? (
        <div className="bo-modalOverlay" role="dialog" aria-modal="true">
          <div className="bo-modal">
            <div className="bo-modalHead">
              <div>
                <h3>Novo conjunto</h3>
                <p>Cria uma página de FAQs (ex.: quem-somos, recrutamento, contactos).</p>
              </div>
              <button className="bo-iconBtn" type="button" onClick={() => setCreateOpen(false)} title="Fechar">
                ✕
              </button>
            </div>

            <div className="bo-formGrid2">
              <label>
                Key (slug)
                <input
                  value={newSet.key}
                  onChange={(e) => setNewSet((p) => ({ ...p, key: e.target.value }))}
                  placeholder="Ex.: quem-somos"
                />
                <small>Vamos normalizar automaticamente (minúsculas e hífens).</small>
              </label>

              <label>
                Título
                <input value={newSet.title} onChange={(e) => setNewSet((p) => ({ ...p, title: e.target.value }))} />
              </label>

              <label>
                Subtítulo
                <input value={newSet.subtitle} onChange={(e) => setNewSet((p) => ({ ...p, subtitle: e.target.value }))} />
              </label>

              <label className="bo-checkRow">
                <input
                  type="checkbox"
                  checked={!!newSet.isEnabled}
                  onChange={(e) => setNewSet((p) => ({ ...p, isEnabled: e.target.checked }))}
                />
                <span>Ativo</span>
              </label>
            </div>

            <div className="bo-modalFoot">
              <button className="btn btn-primary" type="button" onClick={() => setCreateOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-secundary" type="button" onClick={createSet}>
                Criar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}