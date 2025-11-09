import "../styles/about_us_cards.css";
import ServiceCard from "./service_card";

export default function AboutUsCardsMission() {
  const missionCards = [
    {
      id: 1,
      image: "/Clinica/foto1.jpeg", // coloca img ou placeholder
      subtitle: "EVIDÊNCIA PRIMEIRO",
      title: "Base científica",
      text: "Utilizamos técnicas comprovadas e atualizadas para garantir resultados reais.",
      alt: "Fisioterapeuta a aplicar técnica baseada em evidência"
    },
    {
      id: 2,
      image: "/Clinica/foto9.jpeg",
      subtitle: "PERSONALIZAÇÃO",
      title: "Plano individual",
      text: "Cada pessoa é única — o tratamento também deve ser.",
      alt: "Plano terapêutico personalizado"
    },
    {
      id: 3,
      image: "/Clinica/foto6.jpeg",
      subtitle: "PREVENÇÃO",
      title: "Resultados duradouros",
      text: "Atuamos na causa do problema, não apenas no sintoma.",
      alt: "Sessão de fisioterapia focada em prevenção"
    },
    {
      id: 4,
      image: "/Clinica/foto13.jpg",
      subtitle: "ACOMPANHAMENTO",
      title: "Sempre ao seu lado",
      text: "Seguimos o seu progresso em todas as fases da recuperação.",
      alt: "Fisioterapeuta a acompanhar evolução do paciente"
    },
  ];

  return (
    <section className="sanus-about-us-cards">
      <header className="sanus-about-us-cards-title sanus-general-title">
        <p className="sanus-about-us-cards-text little">Sanus Vitae</p>
        <h2>A nossa missão</h2>
      </header>

      <div className="sanus-services-container">
        {missionCards.map((item) => (
          <ServiceCard
            key={item.id}
            image={item.image}
            subtitle={item.subtitle}
            title={item.title}
            text={item.text}
            ctaText={item.ctaText}
            alt={item.alt}
            btnStyle={item.btnStyle}
            slug={item.slug} // pode ser null porque não vamos navegar
          />
        ))}
      </div>

      <svg className="sanus-about-us-cards-waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
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

    </section>
  );
}