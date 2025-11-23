import "../styles/sanus_little_cards.css";
import ServiceCard from "./service_card";

export default function SanusCardsSection({
  title = "A nossa missão",
  subtitle = "Sanus Vitae",
  cards = [],
  showWaves = true,
}) {
  return (
    <section className="sanus-about-us-cards">
      {/* HEADER */}
      <header className="sanus-about-us-cards-title sanus-general-title">
        {subtitle && <p className="sanus-about-us-cards-text little">{subtitle}</p>}
        {title && <h2>{title}</h2>}
      </header>

      {/* GRID */}
      <div className="sanus-services-container">
        {cards.map((item) => (
          <ServiceCard
            key={item.id}
            image={item.image}
            subtitle={item.subtitle}
            title={item.title}
            text={item.text}
            ctaText={item.ctaText}
            alt={item.alt}
            btnStyle={item.btnStyle}
            slug={item.slug}
          />
        ))}
      </div>

      {/* WAVES */}
      {showWaves && (
        <>
          <svg
            className="sanus-about-us-cards-waves"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,128L120,154.7C240,181,480,235,720,261.3C960,288,1200,288,1320,288L1440,288V320H0Z"
            ></path>
          </svg>

          <svg
            className="sanus-about-us-cards-waves"
            style={{ zIndex: 2 }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
          >
            <path
              fill="#4BCAAD"
              fillOpacity="0.3"
              d="M0,128L120,154.7C240,181,480,235,720,261.3C960,288,1200,288,1320,288L1440,288V320H0Z"
            ></path>
          </svg>
        </>
      )}
    </section>
  );
}