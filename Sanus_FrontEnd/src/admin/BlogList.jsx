import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import "./BlogList.css";
import Header from "./Header";

export default function BlogList() {
  const [posts, setPosts] = useState([]);

  async function loadPosts() {
    const querySnapshot = await getDocs(collection(db, "blog"));
    setPosts(querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function removePost(id) {
    if (confirm("Tens a certeza que queres apagar este artigo?")) {
      await deleteDoc(doc(db, "blog", id));
      loadPosts();
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="blog-list-container">
      <Header />
      <main className="blog-list-main">
        <header className="blog-list-header">
          <h2>Artigos do Blog</h2>
          <Link to="/admin/blog/new" className="btn btn-secundary">
            Novo Artigo
          </Link>
        </header>

        {posts.length === 0 ? (
          <p className="no-posts">Ainda não existem artigos publicados.</p>
        ) : (
          <div className="blog-grid">
            {posts.map((p) => (
              <div key={p.id} className="blog-card-alt">
                <div className="blog-card-main">
                  <h3>{p.title}</h3>
                  <p className="author">
                    {p.author ? `por ${p.author}` : "Autor desconhecido"}
                  </p>
                </div>
                <div className="blog-card-footer">
                  <Link to={`/admin/blog/edit/${p.id}`} className="edit-link">
                    Editar
                  </Link>
                  <Link
                    onClick={() => removePost(p.id)}
                    className="delete-link"
                  >
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