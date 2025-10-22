import "../styles/header.css";
import SanusVitaeLogo from "../images/Logo/SanusVitaeLogo.png";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // 👈 IMPORTANTE

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 0); // muda o estado logo aos 100px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔹 Função de clique no logo
  const handleLogoClick = () => {
    if (location.pathname !== "/") {
      // Se estiver noutra página → vai para a Home
      navigate("/");
    } else {
      // Se já estiver na Home → scroll suave para o topo
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
          onClick={handleLogoClick} // 👈 Ação do clique
          style={{ cursor: "pointer" }} // 👈 Indica que é clicável
        />

        <div className="sanus-header-links-container">
          <nav className={`sanus-header-nav ${menuOpen ? "open" : ""}`}>
            <ul>
              <li><a href="#quem-somos">Quem Somos</a></li>
              <li><a href="#servicos">Serviços</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#recrutamento">Recrutamento</a></li>
              <li><a href="#contato">Contatos</a></li>
            </ul>
          </nav>

          <a href="#agendamento" className="btn btn-primary">
            Agende Agora
          </a>
        </div>

        {/* Botão hamburguer */}
        <div
          className={`sanus-header-hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
}