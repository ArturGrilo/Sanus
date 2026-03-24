import React, { useEffect } from "react";
import "../styles/clinic.css";

export default function VideoModal({ open, onClose, title, srcWebm, srcMp4 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sanus-videoModal" role="dialog" aria-modal="true">
      <button className="sanus-videoModal__backdrop" onClick={onClose} aria-label="Fechar" />
      <div className="sanus-videoModal__panel">
        <div className="sanus-videoModal__top">
          <div className="sanus-videoModal__title">{title}</div>
          <button className="sanus-videoModal__close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="sanus-videoModal__frame">
          <video autoPlay muted controls playsInline preload="metadata">
            {srcWebm ? <source src={srcWebm} type="video/webm" /> : null}
            {srcMp4 ? <source src={srcMp4} type="video/mp4" /> : null}
          </video>
        </div>
      </div>
    </div>
  );
}