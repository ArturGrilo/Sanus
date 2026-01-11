import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/cookie_banner.css";

/**
 * Consent model:
 * - necessary: always true
 * - analytics: boolean
 * - marketing: boolean
 */
const STORAGE_KEY = "sv_cookie_consent_v1";

const defaultConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function updateGtagConsent(consent) {
  // Optional: GA4 Consent Mode support (won't fail if gtag doesn't exist)
  // https://developers.google.com/tag-platform/security/guides/consent
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  window.gtag("consent", "update", {
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
  });
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [openPrefs, setOpenPrefs] = useState(false);
  const [consent, setConsent] = useState(defaultConsent);

  const dialogRef = useRef(null);
  const previouslyFocusedEl = useRef(null);

  useEffect(() => {
    // SSR/Prerender safe
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeJsonParse(raw) : null;

    if (!parsed) {
      setVisible(true);
      setConsent(defaultConsent);
      return;
    }

    // Ensure "necessary" is always true
    const nextConsent = {
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
    };

    setConsent(nextConsent);
    setVisible(false);

    // Keep GTAG aligned with stored choice (optional but nice)
    updateGtagConsent(nextConsent);
  }, []);

  // Lock background scroll when modal open
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (!openPrefs) return undefined;
    document.body.classList.add("sv-modal-open");
    return () => document.body.classList.remove("sv-modal-open");
  }, [openPrefs]);

  // ESC closes modal
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!openPrefs) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpenPrefs(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openPrefs]);

  // Focus management (basic, premium)
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (!openPrefs) return undefined;

    previouslyFocusedEl.current = document.activeElement;

    const t = window.setTimeout(() => {
      const el = dialogRef.current?.querySelector(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      el?.focus?.();
    }, 0);

    return () => {
      window.clearTimeout(t);
      previouslyFocusedEl.current?.focus?.();
    };
  }, [openPrefs]);

  const persist = (next) => {
    if (typeof window === "undefined") return;

    const payload = {
      necessary: true,
      analytics: !!next.analytics,
      marketing: !!next.marketing,
      timestamp: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    updateGtagConsent(payload);

    setConsent(payload);
    setVisible(false);
    setOpenPrefs(false);
  };

  const acceptAll = () => persist({ necessary: true, analytics: true, marketing: true });
  const rejectAll = () => persist({ necessary: true, analytics: false, marketing: false });
  const savePrefs = () => persist(consent);

  if (!visible && !openPrefs) return null;

  return (
    <>
      {/* Banner */}
      {visible && (
        <div className="sv-cookie-wrap" role="region" aria-label="Preferências de cookies">
          <div className="sv-cookie-card">
            <div className="sv-cookie-copy">
              <div className="sv-cookie-kicker">Preferências</div>
              <div className="sv-cookie-title">Cookies e privacidade</div>

              <p className="sv-cookie-text">
                Usamos cookies estritamente necessários para o funcionamento do site e, com a sua autorização, cookies
                adicionais para melhorar a experiência e analisar utilização. Pode aceitar, rejeitar ou personalizar.
              </p>

              <div className="sv-cookie-links">
                <Link className="sv-cookie-link" to="/politica-de-privacidade">
                  Política de Privacidade
                </Link>
                <span className="sv-cookie-dot">•</span>
                <Link className="sv-cookie-link" to="/termos-de-utilizacao">
                  Termos de Utilização
                </Link>
              </div>
            </div>

            <div className="sv-cookie-actions">
              <button type="button" className="btn btn-primary" onClick={rejectAll}>
                Rejeitar
              </button>

              <button type="button" className="btn btn-outline" onClick={() => setOpenPrefs(true)}>
                Personalizar
              </button>

              <button type="button" className="btn btn-secundary" onClick={acceptAll}>
                Aceitar tudo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences modal */}
      {openPrefs && (
        <>
          <div className="sv-cookie-overlay" onClick={() => setOpenPrefs(false)} aria-hidden="true" />

          <div className="sv-cookie-dialog" role="dialog" aria-modal="true" aria-label="Preferências de cookies">
            <div
              className="sv-cookie-dialog-card"
              ref={dialogRef}
              onClick={(e) => e.stopPropagation()}
              role="document"
            >
              <div className="sv-dialog-head">
                <div>
                  <div className="sv-cookie-kicker">Preferências</div>
                  <div className="sv-dialog-title">Gerir cookies</div>
                </div>

                <button
                  type="button"
                  className="sv-dialog-close"
                  onClick={() => setOpenPrefs(false)}
                  aria-label="Fechar"
                >
                  ✕
                </button>
              </div>

              <p className="sv-dialog-text">
                Pode escolher que categorias pretende permitir. Os cookies necessários estão sempre ativos para garantir o
                funcionamento do site.
              </p>

              <div className="sv-consent-list">
                <div className="sv-consent-row">
                  <div className="sv-consent-left">
                    <div className="sv-consent-title">Necessários</div>
                    <div className="sv-consent-desc">Essenciais para navegação e funcionalidades.</div>
                  </div>
                  <div className="sv-consent-right">
                    <span className="sv-pill">Sempre ativo</span>
                  </div>
                </div>

                <div className="sv-consent-row">
                  <div className="sv-consent-left">
                    <div className="sv-consent-title">Analytics</div>
                    <div className="sv-consent-desc">Ajuda-nos a melhorar o site com métricas anónimas.</div>
                  </div>
                  <div className="sv-consent-right">
                    <label className="sv-switch">
                      <input
                        type="checkbox"
                        checked={!!consent.analytics}
                        onChange={(e) => setConsent((c) => ({ ...c, analytics: e.target.checked }))}
                      />
                      <span className="sv-switch-ui" aria-hidden="true" />
                    </label>
                  </div>
                </div>

                <div className="sv-consent-row">
                  <div className="sv-consent-left">
                    <div className="sv-consent-title">Marketing</div>
                    <div className="sv-consent-desc">Personalização e conteúdos relevantes (quando aplicável).</div>
                  </div>
                  <div className="sv-consent-right">
                    <label className="sv-switch">
                      <input
                        type="checkbox"
                        checked={!!consent.marketing}
                        onChange={(e) => setConsent((c) => ({ ...c, marketing: e.target.checked }))}
                      />
                      <span className="sv-switch-ui" aria-hidden="true" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="sv-dialog-actions">
                <button type="button" className="btn btn-primary" onClick={rejectAll}>
                  Rejeitar
                </button>
                <button type="button" className="btn btn-outline" onClick={savePrefs}>
                  Guardar preferências
                </button>
                <button type="button" className="btn btn-secundary" onClick={acceptAll}>
                  Aceitar tudo
                </button>
              </div>

              <div className="sv-dialog-footer">
                <Link className="sv-cookie-link" to="/politica-de-privacidade">
                  Política de Privacidade
                </Link>
                <span className="sv-cookie-dot">•</span>
                <Link className="sv-cookie-link" to="/termos-de-utilizacao">
                  Termos de Utilização
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
