import { Link } from "react-router-dom";
import Header from "./Header";
import "./Dashboard.css";
import SanusVitaeLogo from "../images/Logo/SanusVitaeLogo.png";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <Header />

      <main className="dashboard-main">
        <h2>Bem-vindo(a) à área administrativa</h2>
        <p>Escolha uma das opções abaixo para começar:</p>

        <div className="dashboard-cards">
          {/* ---- Card: Blog ---- */}
          <Link to="/admin/blog" className="dashboard-card">
            <h3>Gerir Blog</h3>
            <p>Adicionar, editar ou eliminar publicações.</p>
          </Link>

          {/* ---- Card: Feedback ---- */}
          <Link to="/admin/feedback" className="dashboard-card">
            <h3>Gerir Feedback</h3>
            <p>Adicionar, editar ou remover testemunhos de clientes.</p>
          </Link>

          {/* ---- Card: Serviços ---- */}
          <Link to="/admin/services" className="dashboard-card">
            <h3>Gerir Serviços</h3>
            <p>Adicionar, editar ou eliminar serviços apresentados no site.</p>
          </Link>

          <Link to="/admin/tags" className="dashboard-card">
            <h3>Gerir Tags</h3>
            <p>Criar/editar cores e nomes de tags.</p>
          </Link>

          <Link to="/admin/privacy" className="dashboard-card">
            <h3>Política de Privacidade</h3>
            <p>Editar o texto da política apresentada no site.</p>
          </Link>

          {/* ---- Card futuro ---- */}
          <div className="dashboard-card disabled">
            <h3>Gerir Equipa</h3>
            <p>Em breve disponível.</p>
          </div>
        </div>
      </main>
    </div>
  );
}