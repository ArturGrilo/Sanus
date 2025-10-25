// src/admin/ServicesList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Header from "./Header";
import "./Dashboard.css";

export default function ServicesList() {
  const [services, setServices] = useState([]);

  async function loadServices() {
    const querySnapshot = await getDocs(collection(db, "services"));
    setServices(querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function removeService(id) {
    if (confirm("Tens a certeza que queres apagar este serviço?")) {
      await deleteDoc(doc(db, "services", id));
      loadServices();
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  return (
    <div className="blog-list-container">
      <Header />
      <main className="blog-list-main">
        <header className="blog-list-header">
          <h2>Serviços</h2>
          <Link to="/admin/services/new" className="btn btn-secundary">
            Novo Serviço
          </Link>
        </header>

        {services.length === 0 ? (
          <p className="no-posts">Ainda não existem serviços registados.</p>
        ) : (
          <div className="blog-grid">
            {services.map((s) => (
                <div key={s.id} className="blog-card-alt">
                    <div className="blog-card-main">
                        <h3>{s.title}</h3>
                        <p className="author">{s.subtitle}</p>
                    </div>
                    <div className="blog-card-footer">
                        <Link to={`/admin/services/edit/${s.id}`} className="edit-link">
                        Editar
                        </Link>
                        <Link onClick={() => removeService(s.id)} className="delete-link">
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