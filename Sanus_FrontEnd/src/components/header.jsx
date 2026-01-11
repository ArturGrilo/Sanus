import "../styles/header.css";
import SanusVitaeLogo from "../images/Logo/SanusVitaeLogo.png";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarMenu from "./sidebar_menu";

const SERVICES = [
  {
    title: "Fisioterapia",
    desc: "Planos personalizados para recuperar mobilidade, aliviar dor e melhorar função.",
    path: "/servicos/fisioterapia",
  },
  {
    title: "Pilates com Equipamentos",
    desc: "Sessões individuais ou em grupos pequenos com aparelhos e progressão segura.",
    path: "/servicos/pilates",
  },
  {
    title: "Serviços ao Domicílio",
    desc: "Fisioterapia ou Pilates em casa, com acompanhamento exclusivo e personalizado.",
    path: "/servicos/servicos-ao-domicilio",
  },
];

export default function Header({ forceScrolled = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ✅ Mega menu (desktop)
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesWrapRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ scroll behavior
  useEffect(() => {
    if (forceScrolled) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceScrolled]);

  // ✅ body lock for sidebar
  useEffect(() => {
    document.body.classList.toggle("sidebar-open", menuOpen);
  }, [menuOpen]);

  // ✅ close mega menu when route changes
  useEffect(() => {
    setServicesOpen(false);
  }, [location.pathname]);

  // ✅ click outside + ESC closes mega menu
  useEffect(() => {
    if (!servicesOpen) return;

    const onDocMouseDown = (e) => {
      if (!servicesWrapRef.current) return;
      if (!servicesWrapRef.current.contains(e.target)) setServicesOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setServicesOpen(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [servicesOpen]);

  const handleLogoClick = () => {
    if (location.pathname !== "/") navigate("/");
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const go = (path) => {
    navigate(path);
    setServicesOpen(false);
    setMenuOpen(false);
  };

  const goToAgendamento = () => {
    setMenuOpen(false);
    navigate("/agendar");
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

        {/* DESKTOP */}
        <div className="sanus-header-links-container desktop-only">
          <nav className="sanus-header-nav" aria-label="Navegação principal">
            <ul>
              <li>
                <button type="button" className="navlink" onClick={() => go("/sobre-nos")}>
                  Quem Somos
                </button>
              </li>

              {/* ✅ Serviços + Mega menu */}
              <li
                className="services-wrap"
                ref={servicesWrapRef}
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <button
                  type="button"
                  className={`navlink navlink-services ${servicesOpen ? "open" : ""}`}
                  onClick={() => setServicesOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={servicesOpen}
                >
                  Serviços
                  <span className="navlink-caret" aria-hidden="true">
                    ▾
                  </span>
                </button>

                {/*{servicesOpen && (*/}
                {servicesOpen && (
                  <div className="mega-menu" role="menu" aria-label="Serviços">
                    <div className="mega-menu-inner">
                      <div className="mega-col">
                        <div className="mega-title">Serviços</div>

                        <div className="mega-list">
                          {SERVICES.map((s) => (
                            <button
                              key={s.title}
                              type="button"
                              className="mega-item"
                              onClick={() => go(s.path)}
                              role="menuitem"
                            >
                              <div className="mega-item-title">{s.title}</div>
                              <div className="mega-item-desc">{s.desc}</div>
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="mega-all"
                          onClick={() => go("/servicos")}
                          role="menuitem"
                        >
                          Ver todos os serviços →
                        </button>
                      </div>

                      <div className="mega-col mega-highlight">
                        <div className="mega-badge">CUIDADOS PERSONALIZADOS</div>
                        <div className="mega-headline">Movimento com ciência.</div>
                        <div className="mega-copy">
                          Planos ajustados a cada pessoa, com abordagem baseada em evidência e foco
                          em resultados.
                        </div>

                        <div className="mega-cta-row">
                          <button type="button" className="btn btn-primary" onClick={goToAgendamento}>
                            Agende Agora
                          </button>
                          <button type="button" className="btn btn-secundary" onClick={() => go("/contactos")}>
                            Fale Connosco
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>

              <li>
                <button type="button" className="navlink" onClick={() => go("/blog")}>
                  Blog
                </button>
              </li>
              <li>
                <button type="button" className="navlink" onClick={() => go("/recrutamento")}>
                  Recrutamento
                </button>
              </li>
              <li>
                <button type="button" className="navlink" onClick={() => go("/contactos")}>
                  Contatos
                </button>
              </li>
            </ul>
          </nav>

          <button type="button" className="btn btn-primary" onClick={goToAgendamento}>
            Agende Agora
          </button>
        </div>

        {/* HAMBURGER (MOBILE/TABLET) */}
        <button
          className={`sanus-header-hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
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
