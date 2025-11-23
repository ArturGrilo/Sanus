import "../styles/skeleton_hero.css";
import "../styles/sanus_hero.css";

export default function BlogHeroSkeleton() {
  return (
    <section className="sanus-page-hero-generic skeleton-hero">
      <div className="sanus-page-hero-overlay">

        <div className="skeleton-block skeleton-title"></div>
        <div className="skeleton-block skeleton-subtitle"></div>

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
        ></path>
      </svg>
    </section>
  );
}