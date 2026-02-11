import "../styles/header.css";
import SanusVitaeLogo from "../images/Logo/SanusVitaeLogo.png";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarMenu from "./sidebar_menu";

export default function Header({ forceScrolled = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ✅ Mega menu (desktop)
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesWrapRef = useRef(null);

  // ✅ Serviços vindos do backend (como no componente Services)
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ helpers (is-active)
  const isActive = (path) => location.pathname === path;
  const isServicesSection =
    location.pathname === "/servicos" || location.pathname.startsWith("/servicos/");

  // ✅ buscar serviços (frontend -> backend -> firebase)
  useEffect(() => {
    let alive = true;

    async function fetchServices() {
      try {
        setServicesLoading(true);

        const base = import.meta.env.VITE_BACKEND_URL;
        if (!base) {
          console.warn("[Header] VITE_BACKEND_URL não definido. Menu de serviços ficará vazio.");
          if (alive) setServices([]);
          return;
        }

        const res = await fetch(`${base}/services`, {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ao carregar /services`);
        }

        const data = await res.json();

        const normalized = (Array.isArray(data) ? data : [])
          .map((s, i) => {
            const slug = s.slug || s.path?.split("/servicos/")?.[1] || s.id || String(i);

            return {
              id: s.id || slug || i,
              title: s.title || "Serviço",
              desc: s.text || s.desc || s.subtitle || s.card_desc || "",
              slug,
              path: `/servicos/${slug}`,
            };
          })
          .filter((s) => Boolean(s.slug) && Boolean(s.title));

        if (alive) setServices(normalized);
      } catch (error) {
        console.error("Erro ao carregar serviços (Header):", error);
        if (alive) setServices([]);
      } finally {
        if (alive) setServicesLoading(false);
      }
    }

    fetchServices();

    return () => {
      alive = false;
    };
  }, []);

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
                <button
                  type="button"
                  className={`navlink ${isActive("/sobre-nos") ? "is-active" : ""}`}
                  onClick={() => go("/sobre-nos")}
                >
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
                  className={`navlink navlink-services ${servicesOpen ? "open" : ""} ${
                    isServicesSection ? "is-active" : ""
                  }`}
                  onClick={() => setServicesOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={servicesOpen}
                >
                  Serviços
                  <span className="navlink-caret" aria-hidden="true">
                    ▾
                  </span>
                </button>

                {servicesOpen && (
                  <div className="mega-menu" role="menu" aria-label="Serviços">
                    <div className="mega-menu-inner">
                      <div className="mega-col">
                        <div className="mega-title">Serviços</div>

                        <div className="mega-list">
                          {servicesLoading ? (
                            <div className="mega-item" role="menuitem" aria-disabled="true">
                              <div className="mega-item-title">A carregar…</div>
                              <div className="mega-item-desc">A obter serviços disponíveis.</div>
                            </div>
                          ) : services.length === 0 ? (
                            <div className="mega-item" role="menuitem" aria-disabled="true">
                              <div className="mega-item-title">Sem serviços</div>
                              <div className="mega-item-desc">
                                Tente novamente mais tarde ou consulte a página de serviços.
                              </div>
                            </div>
                          ) : (
                            services.map((s) => (
                              <button
                                key={s.id || s.slug}
                                type="button"
                                className={`mega-item ${isActive(s.path) ? "is-active" : ""}`}
                                onClick={() => go(s.path)}
                                role="menuitem"
                              >
                                <div className="mega-item-title">{s.title}</div>
                                {!!s.desc && <div className="mega-item-desc">{s.desc}</div>}
                              </button>
                            ))
                          )}
                        </div>

                        <button
                          type="button"
                          className={`mega-all ${isActive("/servicos") ? "is-active" : ""}`}
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
                          <button
                            type="button"
                            className="btn btn-secundary"
                            onClick={() => go("/contactos")}
                          >
                            Fale Connosco
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>

              <li>
                <button
                  type="button"
                  className={`navlink ${isActive("/blog") ? "is-active" : ""}`}
                  onClick={() => go("/blog")}
                >
                  Blog
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className={`navlink ${isActive("/recrutamento") ? "is-active" : ""}`}
                  onClick={() => go("/recrutamento")}
                >
                  Recrutamento
                </button>
              </li>

              <li>
                <button
                  type="button"
                  className={`navlink ${isActive("/contactos") ? "is-active" : ""}`}
                  onClick={() => go("/contactos")}
                >
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