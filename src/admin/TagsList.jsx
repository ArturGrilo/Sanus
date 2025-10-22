import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Header from "./Header";
import "./Dashboard.css";

export default function TagsList() {
  const [tags, setTags] = useState([]);

  async function loadTags() {
    const snap = await getDocs(collection(db, "tags"));
    setTags(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }
  async function removeTag(id) {
    if (confirm("Apagar esta tag?")) {
      await deleteDoc(doc(db, "tags", id));
      loadTags();
    }
  }

  useEffect(() => { loadTags(); }, []);

  return (
    <div className="blog-list-container">
      <Header />
      <main className="blog-list-main">
        <header className="blog-list-header">
          <h2>Tags</h2>
          <Link to="/admin/tags/new" className="btn btn-secundary">Nova Tag</Link>
        </header>

        {tags.length === 0 ? (
          <p className="no-posts">Ainda não existem tags.</p>
        ) : (
          <div className="blog-grid">
            {tags.map(t => (
              <div key={t.id} className="blog-card-alt">
                <div className="blog-card-main" style={{display:"flex",alignItems:"center", justifyContent:"center",gap:12}}>
                  <span style={{
                    width:16,height:16,borderRadius:4,
                    background:t.color,border:"1px solid var(--color-border)"
                  }} />
                  <h3 style={{margin:0}}>{t.name}</h3>
                </div>
                <div className="blog-card-footer">
                  <Link to={`/admin/tags/edit/${t.id}`} className="edit-link">Editar</Link>
                  <button onClick={() => removeTag(t.id)} className="delete-link">Apagar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}