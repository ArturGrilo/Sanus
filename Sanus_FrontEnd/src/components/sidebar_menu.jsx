import "../styles/sidebar_menu.css";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SidebarMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [servicesOpen, setServicesOpen] = useState(false);

  // ✅ Serviços vindos do backend (frontend -> backend -> firebase)
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // ✅ Fecha accordion quando o sidebar fecha
  useEffect(() => {
    if (!isOpen) setServicesOpen(false);
  }, [isOpen]);

  // ✅ Carregar serviços (mesmo padrão do componente Services)
  useEffect(() => {
    let alive = true;

    async function fetchServices() {
      try {
        setServicesLoading(true);

        const base = import.meta.env.VITE_BACKEND_URL;
        if (!base) {
          console.warn("[SidebarMenu] VITE_BACKEND_URL não definido. Serviços ficarão vazios.");
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
              slug,
              path: `/servicos/${slug}`,
            };
          })
          .filter((s) => Boolean(s.slug) && Boolean(s.title));

        if (alive) setServices(normalized);
      } catch (error) {
        console.error("Erro ao carregar serviços (SidebarMenu):", error);
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

  // ✅ Fecha o sidebar quando muda de rota (caso navegação seja disparada por outro sítio)
  useEffect(() => {
    if (isOpen) onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // ✅ ESC fecha sidebar
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const go = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <>
      {isOpen && <div className="sanus-sidebar-overlay" onClick={onClose} />}

      <aside className={`sanus-sidebar ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
        <svg className="sanus-sidebar-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="var(--color-primary-dark)"
            fillOpacity="1"
            d="M0,192L48,192C96,192,192,192,288,208C384,224,480,256,576,234.7C672,213,768,139,864,138.7C960,139,1056,213,1152,224C1248,235,1344,181,1392,154.7L1440,128L1440,0L0,0Z"
          />
        </svg>

        <nav className="sanus-sidebar-nav" aria-label="Menu">
          <ul>
            <li>
              <button type="button" className="sidebar-link" onClick={() => go("/sobre-nos")}>
                Quem Somos
              </button>
            </li>

            {/* ✅ Serviços accordion */}
            <li className={`sidebar-acc ${servicesOpen ? "open" : ""}`}>
              <button
                type="button"
                className="sidebar-link sidebar-acc-head"
                onClick={() => setServicesOpen((v) => !v)}
                aria-expanded={servicesOpen}
              >
                Serviços
                <span className="sidebar-caret" aria-hidden="true">
                  {servicesOpen ? "▾" : "▸"}
                </span>
              </button>

              {servicesOpen && (
                <div className="sidebar-acc-body">
                  {servicesLoading ? (
                    <button type="button" className="sidebar-sublink" disabled aria-disabled="true">
                      A carregar…
                    </button>
                  ) : services.length === 0 ? (
                    <button type="button" className="sidebar-sublink" disabled aria-disabled="true">
                      Sem serviços disponíveis
                    </button>
                  ) : (
                    services.map((s) => (
                      <button
                        key={s.id || s.slug}
                        type="button"
                        className="sidebar-sublink"
                        onClick={() => go(s.path)}
                      >
                        {s.title}
                      </button>
                    ))
                  )}

                  <button type="button" className="sidebar-sublink all" onClick={() => go("/servicos")}>
                    Ver todos os serviços →
                  </button>
                </div>
              )}
            </li>

            <li>
              <button type="button" className="sidebar-link" onClick={() => go("/blog")}>
                Blog
              </button>
            </li>

            <li>
              <button type="button" className="sidebar-link" onClick={() => go("/recrutamento")}>
                Recrutamento
              </button>
            </li>

            <li>
              <button type="button" className="sidebar-link" onClick={() => go("/contactos")}>
                Contatos
              </button>
            </li>
          </ul>

          <button type="button" className="btn btn-secundary sidebar-cta" onClick={() => go("/agendar")}>
            Agende Agora
          </button>
        </nav>
      </aside>
    </>
  );
}