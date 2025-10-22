import { useEffect, useRef, useState } from "react";
import "../styles/splash_screen.css";
import SanusVitaeLogo from "../images/Logo/SanusVitaeLogo.png";

/**
 * Splash premium minimalista com:
 * - duração mínima (evita flicker em net rápida)
 * - fade-out cinematográfico
 * - “shine” subtil no logótipo
 * - tagline com gradiente Sanus
 * - skip (clique ou ESC) após 900ms
 * - respeita prefers-reduced-motion
 *
 * Props:
 *  - minDurationMs (default 1800)
 */
export default function SplashScreenPremium({ minDurationMs = 1800 }) {
  const [visible, setVisible] = useState(true);
  const startRef = useRef(Date.now());
  const skippableRef = useRef(false);

  // permitir “skip” suave (click/ESC) após 900ms
  useEffect(() => {
    const enableSkip = setTimeout(() => { skippableRef.current = true; }, 900);
    const onKey = (e) => {
      if ((e.key === "Escape" || e.key === "Enter") && skippableRef.current) {
        requestClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(enableSkip);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // fechar com respeito ao tempo mínimo e com fade
  const requestClose = () => {
    const elapsed = Date.now() - startRef.current;
    const remaining = Math.max(0, minDurationMs - elapsed);
    setTimeout(() => {
      const el = document.querySelector(".sanus-splash-premium");
      if (el) el.classList.add("fade-out");
      setTimeout(() => setVisible(false), 650); // tempo do fade
    }, remaining);
  };

  // auto-fechar quando o pai desmontar? – usa requestClose() a partir do parent
  // Se preferires, expõe um callback de “onReady” para o parent chamar requestClose()

  // garante o fecho automático mesmo sem ação externa (ex: só mostrar a marca)
  useEffect(() => {
    requestClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      className="sanus-splash-premium"
      role="status"
      aria-live="polite"
      onClick={() => skippableRef.current && requestClose()}
    >
      {/* halo de marca super subtil */}
      <div className="halo" aria-hidden="true" />
      <div className="inner">
        <div className="logo-wrap">
          <img src={SanusVitaeLogo} alt="Sanus Vitae" className="logo" />
          <span className="shine" aria-hidden="true" />
        </div>

        <p className="tagline">
          Saúde para <span className="gradient-word">viver o agora</span>
        </p>

        {/* linha assinatura, muito leve */}
        <span className="signature-line" aria-hidden="true" />
      </div>
    </div>
  );
}