import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Header from "./Header";
import "./FeedbackList.css";

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);

  async function loadFeedbacks() {
    const querySnapshot = await getDocs(collection(db, "feedback"));
    setFeedbacks(querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function removeFeedback(id) {
    if (confirm("Tens a certeza que queres apagar este feedback?")) {
      await deleteDoc(doc(db, "feedback", id));
      loadFeedbacks();
    }
  }

  useEffect(() => {
    loadFeedbacks();
  }, []);

  return (
    <div className="blog-list-container">
      <Header />
      <main className="blog-list-main">
        <header className="blog-list-header">
          <h2>Feedback de Clientes</h2>
          <Link to="/admin/feedback/new" className="btn btn-secundary">
            Novo Feedback
          </Link>
        </header>

        {feedbacks.length === 0 ? (
          <p className="no-items">Ainda não existem feedbacks.</p>
        ) : (
          <div className="blog-grid">
            {feedbacks.map((f) => (
              <div key={f.id} className="blog-card-alt">
                <div className="blog-card-main">
                  <h3>
                    "{f.comment_initial}
                    <strong>{f.comment_other_color}</strong>
                    {f.comment_final}"
                  </h3>
                  <p>{f.name}</p>
                  <p className="feedback-source-admin">{f.source}</p>
                </div>
                <div className="blog-card-footer">
                  <Link to={`/admin/feedback/edit/${f.id}`} className="edit-link">
                    Editar
                  </Link>
                  <Link onClick={() => removeFeedback(f.id)} className="delete-link">
                    Apagar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}