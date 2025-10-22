import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import SanusVitaeLogo from "../images/Logo/SanusVitaeLogo.png";
import "./Header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  function handleLogout() {
    signOut(auth);
  }

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  return (
    <header className="bo-header">
      <div className="bo-header-left">
        <img src={SanusVitaeLogo} alt="Sanus Vitae Logo" className="bo-logo" />
      </div>

      <nav className={`bo-nav ${menuOpen ? "open" : ""}`}>
        {/* 🏠 Dashboard */}
        <Link
          to="/admin"
          className={location.pathname === "/admin" ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          Dashboard
        </Link>

        {/* 📰 Blog */}
        <Link
          to="/admin/blog"
          className={location.pathname.startsWith("/admin/blog") ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          Blog
        </Link>
        <Link
          to="/admin/tags"
          className={location.pathname.startsWith("/admin/tags") ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          Tags
        </Link>

        {/* 💬 Feedback */}
        <Link
          to="/admin/feedback"
          className={location.pathname.startsWith("/admin/feedback") ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          Feedback
        </Link>

        {/* 🩺 Serviços */}
        <Link
          to="/admin/services"
          className={location.pathname.startsWith("/admin/services") ? "active" : ""}
          onClick={() => setMenuOpen(false)}
        >
          Serviços
        </Link>

        {/* 🚪 Logout */}
        <button className="btn btn-alt" onClick={handleLogout}>
          Sair
        </button>
      </nav>

      {/* 🍔 Menu Responsivo */}
      <button
        className={`burger ${menuOpen ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label="Abrir menu"
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}