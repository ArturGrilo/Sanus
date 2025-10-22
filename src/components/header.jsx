import "../styles/header.css";
import SanusVitaeLogo from "../images/Logo/SanusVitaeLogo.png";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarMenu from "./sidebar_menu";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", menuOpen);
  }, [menuOpen]);

  const handleLogoClick = () => {
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className={`sanus-header ${isScrolled ? "scrolled" : "top"}`}>
      <div className="sanus-header-container">
        <img
          src={SanusVitaeLogo}
          className="sanus-header-logo"
          alt="Sanus Vitae logo"
          onClick={handleLogoClick}
        />

        <div className="sanus-header-links-container desktop-only">
          <nav className="sanus-header-nav">
            <ul>
              <li><a href="#quem-somos">Quem Somos</a></li>
              <li><a href="#servicos">Serviços</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#recrutamento">Recrutamento</a></li>
              <li><a href="#contato">Contatos</a></li>
            </ul>
          </nav>
          <a href="#agendamento" className="btn btn-primary">Agende Agora</a>
        </div>

        <button
          className={`sanus-header-hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <SidebarMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}