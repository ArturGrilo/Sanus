import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import "./FeedbackForm.css";
import { authedFetch } from "../lib/authedFetch";

export default function FeedbackForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;

  const [name, setName] = useState("");
  const [commentInitial, setCommentInitial] = useState("");
  const [commentOtherColor, setCommentOtherColor] = useState("");
  const [commentFinal, setCommentFinal] = useState("");
  const [source, setSource] = useState("");

  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Carregar feedback para edição (ADMIN)
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await authedFetch(`${API}/admin/feedbacks/${id}`, { method: "GET" });

        setName(data.name || "");
        setCommentInitial(data.comment_initial || "");
        setCommentOtherColor(data.comment_other_color || "");
        setCommentFinal(data.comment_final || "");
        setSource(data.source || "");
      } catch (err) {
        console.error(err);
        setError(err?.message || "Não foi possível carregar o feedback.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, API]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const payload = {
      name: String(name || "").trim(),
      comment_initial: String(commentInitial || "").trim(),
      comment_other_color: String(commentOtherColor || "").trim(),
      comment_final: String(commentFinal || "").trim(),
      source: String(source || "").trim(),
    };

    if (!payload.name) {
      setError("O nome é obrigatório.");
      return;
    }

    try {
      setSaving(true);

      const method = id ? "PUT" : "POST";
      const endpoint = id ? `${API}/admin/feedbacks/${id}` : `${API}/admin/feedbacks`;

      await authedFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      navigate("/admin/feedback", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err?.message || "Erro ao guardar feedback.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    const ok = window.confirm("Queres mesmo apagar este feedback?");
    if (!ok) return;

    try {
      setSaving(true);
      await authedFetch(`${API}/admin/feedbacks/${id}`, { method: "DELETE" });
      navigate("/admin/feedback", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err?.message || "Erro ao apagar feedback.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>A carregar...</p>;

  return (
    <div className="feedback-form-page">
      <Header />
      <main className="feedback-form-container">
        <h2>{id ? "Editar Feedback" : "Novo Feedback"}</h2>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <textarea
            placeholder="Parte inicial do comentário"
            value={commentInitial}
            onChange={(e) => setCommentInitial(e.target.value)}
          />

          <textarea
            placeholder="Parte colorida"
            value={commentOtherColor}
            onChange={(e) => setCommentOtherColor(e.target.value)}
          />

          <textarea
            placeholder="Parte final do comentário"
            value={commentFinal}
            onChange={(e) => setCommentFinal(e.target.value)}
          />

          <input
            placeholder="Fonte (ex.: Avaliação no Google)"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "A guardar..." : "Guardar"}
            </button>

            {id && (
              <button type="button" className="btn btn-alt" onClick={handleDelete} disabled={saving}>
                Apagar
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}