import "../styles/recrutamento_benefits.css";
import SanusCardsSection from "./sanus_little_cards";

export default function SanusBenefits({
  title = "Porque trabalhar connosco?",
  benefits = [
    {
    id: 1,
    image: "/Clinica/contactos.png",
    subtitle: "CUIDADO",
    title: "Temos condições para dar atenção a cada cliente",
    text: "Organizamos o nosso trabalho de forma a garantir tempo, foco clínico e acompanhamento individualizado. Cada cliente é visto como único, não como um número.",
    alt: "Atenção individual a cada cliente"
  },
  {
    id: 2,
    image: "/Recrutamento/horario.jpg",
    subtitle: "EVOLUÇÃO",
    title: "Incentivamos e apoiamos a formação contínua",
    text: "Acreditamos no crescimento profissional constante. Promovemos formação, atualização científica e partilha interna para evolução consistente da equipa.",
    alt: "Apoio à formação contínua"
  },
  {
    id: 3,
    image: "/Clinica/foto1.jpeg",
    subtitle: "EVIDÊNCIA",
    title: "Trabalhamos de acordo com a evidência científica",
    text: "A nossa prática clínica é fundamentada em evidência atualizada, avaliação criteriosa e decisões terapêuticas sustentadas em conhecimento sólido.",
    alt: "Prática baseada em evidência científica"
  },
  {
    id: 4,
    image: "/Recrutamento/tecnologia.jpeg",
    subtitle: "INOVAÇÃO",
    title: "Investimos em tecnologia para melhores resultados",
    text: "Utilizamos equipamentos modernos e ferramentas atualizadas que potenciam a avaliação, o tratamento e a progressão terapêutica.",
    alt: "Tecnologia aplicada à fisioterapia"
  },
  {
    id: 5,
    image: "/Recrutamento/ambiente_humano.jpg",
    subtitle: "EQUIPA",
    title: "Temos ambiente familiar e de trabalho em equipa",
    text: "Valorizamos um ambiente próximo, colaborativo e respeitador, onde a comunicação clara e a entreajuda fazem parte da cultura diária.",
    alt: "Ambiente familiar e trabalho em equipa"
  }
]
}) {
  return (
    <section className="sanus-recrutamento-page-benefits">
      <svg
        className="sanus-recrutamento-page-benefits-waves"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <path
          fill="var(--color-primary)"
          fillOpacity="0.3"
          d="M0,128L120,154.7C240,181,480,235,720,261.3C960,288,1200,288,1320,288L1440,288L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
        ></path>
      </svg>

      <div className="sanus-recrutamento-page-benefits-container">
        <SanusCardsSection
            title={title}
            subtitle="Beneficios"
            cards={benefits}
            showWaves={false}
        />
      </div>
    </section>
  );
}