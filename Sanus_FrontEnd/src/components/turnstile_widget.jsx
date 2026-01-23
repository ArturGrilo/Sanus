import { useEffect, useRef } from "react";

export default function TurnstileWidget({
  siteKey,
  onToken,
  theme = "light",
  className = "",
}) {
  const ref = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!siteKey) return;

    const tryRender = () => {
      if (!ref.current) return;
      if (!window.turnstile) return;

      // Evitar re-render duplicado
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }

      widgetIdRef.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: theme,
        callback: (token) => {
          if (onToken) onToken(token);
        },
        "expired-callback": () => {
          if (onToken) onToken("");
        },
        "error-callback": () => {
          if (onToken) onToken("");
        },
      });
    };

    // Render imediato ou tenta mais tarde se script ainda não carregou
    tryRender();
    const interval = setInterval(() => {
      if (window.turnstile && ref.current) {
        tryRender();
        clearInterval(interval);
      }
    }, 250);

    return () => {
      clearInterval(interval);
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
      }
    };
  }, [siteKey, theme, onToken]);

  return <div className={className} ref={ref} />;
}