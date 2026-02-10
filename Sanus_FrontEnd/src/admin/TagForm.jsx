import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import "./BlogForm.css";
import { authedFetch } from "../lib/authedFetch";

export default function TagForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;

  const [name, setName] = useState("");
  const [color, setColor] = useState("#4BCAAD");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTag() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const data = await authedFetch(`${API}/admin/tags/${id}`, { method: "GET" });
        setName(data.name || "");
        setColor(data.color || "#4BCAAD");
      } catch (err) {
        console.error(err);
        setError(err?.message || "Erro ao carregar a tag.");
      } finally {
        setLoading(false);
      }
    }
    fetchTag();
  }, [id, API]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const payload = {
      name: String(name || "").trim(),
      color: String(color || "").trim(),
    };

    if (!payload.name) {
      setError("O nome é obrigatório.");
      return;
    }

    try {
      setSaving(true);

      const method = id ? "PUT" : "POST";
      const endpoint = id ? `${API}/admin/tags/${id}` : `${API}/admin/tags`;

      await authedFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      navigate("/admin/tags", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err?.message || "Erro ao guardar a tag.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    const ok = window.confirm("Queres mesmo apagar esta tag?");
    if (!ok) return;

    try {
      setSaving(true);
      await authedFetch(`${API}/admin/tags/${id}`, { method: "DELETE" });
      navigate("/admin/tags", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err?.message || "Erro ao apagar a tag.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="blogform-page">
      <Header />
      <main className="blogform-container">
        <div className="blogform-header">
          <h2>{id ? "Editar Tag" : "Nova Tag"}</h2>
          <div className="blogform-actions">
            <button
              type="button"
              className="btn-secundary"
              onClick={() => navigate("/admin/tags")}
              disabled={saving}
            >
              Voltar
            </button>

            {id && (
              <button type="button" className="btn btn-alt" onClick={handleDelete} disabled={saving}>
                Apagar
              </button>
            )}

            <button form="tagform" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "A guardar…" : "Guardar"}
            </button>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="skeleton">A carregar…</div>
        ) : (
          <form id="tagform" onSubmit={handleSubmit} className="form-card">
            <label>
              <span>Nome</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <label className="color-picker">
              <span>Cor</span>
              <div className="color-picker-input">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ width: 50, height: 40, border: "none", cursor: "pointer" }}
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ marginLeft: 10, width: 110, textTransform: "uppercase" }}
                />
              </div>
            </label>
          </form>
        )}
      </main>
    </div>
  );
}