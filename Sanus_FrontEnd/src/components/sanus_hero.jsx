import { useEffect, useState } from "react";
import BlogHeroSkeleton from "./skeleton_hero";
import "../styles/sanus_hero.css";

export default function SanusHero({
  title = "",
  subtitle = "",
  imageUrl = "",
  height = "",       // Altura dinâmica
  titleSize = "",      // Fonte do título dinâmica
  subtitleSize = "", // Fonte do subtítulo dinâmica
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setLoaded(true);
      return;
    }

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setLoaded(true);
  }, [imageUrl]);

  // Enquanto carrega a imagem → skeleton
  if (!loaded) return <BlogHeroSkeleton height={height} />;

  return (
    <section
      className="sanus-page-hero-generic"
      style={{
        backgroundImage: `url(${imageUrl})`,
        height, // ← aplica altura dinâmica
      }}
    >
      <div className="sanus-page-hero-overlay">
        {title && <h1 style={{ fontSize: titleSize }}>{title}</h1>}
        {subtitle && <p style={{ fontSize: subtitleSize }}>{subtitle}</p>}
      </div>

      <svg
        className="sanus-page-hero-wave"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <path
          fill="#fff"
          fillOpacity="1"
          d="M0,160L80,186.7C160,213,320,267,480,266.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
        />
      </svg>
    </section>
  );
}
