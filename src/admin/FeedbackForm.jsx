import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import Header from "./Header";
import "./FeedbackForm.css";

export default function FeedbackForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [commentInitial, setCommentInitial] = useState("");
  const [commentOtherColor, setCommentOtherColor] = useState("");
  const [commentFinal, setCommentFinal] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (id) {
      getDoc(doc(db, "feedback", id)).then((snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setName(d.name);
          setCommentInitial(d.comment_initial);
          setCommentOtherColor(d.comment_other_color);
          setCommentFinal(d.comment_final);
          setSource(d.source);
          setLoading(false);
        }
      });
    }
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    const data = {
      name,
      comment_initial: commentInitial,
      comment_other_color: commentOtherColor,
      comment_final: commentFinal,
      source,
      createdAt: serverTimestamp(),
    };

    if (id) await setDoc(doc(db, "feedback", id), data, { merge: true });
    else await addDoc(collection(db, "feedback"), data);

    alert("Feedback guardado!");
    navigate("/admin/feedback");
  }

  if (loading) return <p>A carregar...</p>;

  return (
    <div className="feedback-form-page">
      <Header />
      <main className="feedback-form-container">
        <h2>{id ? "Editar Feedback" : "Novo Feedback"}</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
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
          <button type="submit" className="btn-primary">Guardar</button>
        </form>
      </main>
    </div>
  );
}