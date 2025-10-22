import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { useNavigate, useParams } from "react-router-dom";
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import Header from "./Header";
import "./BlogForm.css";

export default function TagForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#4BCAAD");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTag() {
      if (!id) return setLoading(false);
      const snap = await getDoc(doc(db, "tags", id));
      if (snap.exists()) {
        const d = snap.data();
        setName(d.name || "");
        setColor(d.color || "#4BCAAD");
      }
      setLoading(false);
    }
    fetchTag();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      setSaving(true);
      const payload = { name: name.trim(), color: color.trim(), updatedAt: serverTimestamp() };
      if (id) {
        await setDoc(doc(db, "tags", id), payload, { merge: true });
      } else {
        await addDoc(collection(db, "tags"), { ...payload, createdAt: serverTimestamp() });
      }
      navigate("/admin/tags", { replace: true });
    } catch {
      setError("Erro ao guardar a tag.");
    } finally { setSaving(false); }
  }

  return (
    <div className="blogform-page">
      <Header />
      <main className="blogform-container">
        <div className="blogform-header">
          <h2>{id ? "Editar Tag" : "Nova Tag"}</h2>
          <div className="blogform-actions">
            <button type="button" className="btn-secundary" onClick={() => navigate("/admin/tags")} disabled={saving}>Voltar</button>
            <button form="tagform" type="submit" className="btn btn-primary" disabled={saving}>{saving ? "A guardar…" : "Guardar"}</button>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading ? <div className="skeleton">A carregar…</div> : (
          <form id="tagform" onSubmit={handleSubmit} className="form-card">
            <label>
              <span>Nome</span>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </label>
            <label className="color-picker">
              <span>Cor</span>
              <div className="color-picker-input">
                <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 50, height: 40, border: "none", cursor:"pointer" }} />
                <input type="text" value={color} onChange={e => setColor(e.target.value)} style={{ marginLeft:10, width:110, textTransform:"uppercase" }}/>
              </div>
            </label>
          </form>
        )}
      </main>
    </div>
  );
}