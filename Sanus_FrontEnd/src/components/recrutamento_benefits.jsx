import "../styles/recrutamento_benefits.css";
import SanusCardsSection from "./sanus_little_cards";

export default function SanusBenefits({
  title = "Porque trabalhar connosco?",
  benefits = [
    {
        id: 1,
        image: "/Recrutamento/ambiente_humano.jpg",
        subtitle: "CULTURA",
        title: "Ambiente Humano",
        text: "Equipa leve, empática e colaborativa. Aqui o respeito e a entreajuda são prioridade.",
        alt: "Ambiente humano e colaborativo"
    },
    {
        id: 2,
        image: "/Clinica/contactos.png",
        subtitle: "EVOLUÇÃO",
        title: "Formação Contínua",
        text: "Acesso regular a workshops, mentoria clínica e apoio real à certificação profissional.",
        alt: "Formação e evolução contínua"
    },
    {
        id: 3,
        image: "/Clinica/foto1.jpeg",
        subtitle: "EXCELÊNCIA",
        title: "Prática Baseada na Evidência",
        text: "Protocolos modernos, atualizados e alinhados com as melhores práticas internacionais.",
        alt: "Excelência clínica"
    },
    {
        id: 4,
        image: "/Recrutamento/tecnologia.jpeg",
        subtitle: "INOVAÇÃO",
        title: "Tecnologia Avançada",
        text: "Equipamentos topo de gama, ferramentas digitais e processos otimizados para te facilitar a vida.",
        alt: "Tecnologia avançada na fisioterapia"
    },
    {
        id: 5,
        image: "/Recrutamento/horario.jpg",
        subtitle: "EQUILÍBRIO",
        title: "Horários Saudáveis",
        text: "Um modelo que respeita o teu descanso, recuperação e bem-estar.",
        alt: "Equilíbrio entre vida pessoal e profissional"
    },
    {
        id: 6,
        image: "/Recrutamento/carreira.jpg",
        subtitle: "CARREIRA",
        title: "Crescimento Real",
        text: "Progressão estruturada, novas responsabilidades e desenvolvimento orientado ao teu ritmo.",
        alt: "Crescimento profissional"
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
          fill="#4BCAAD"
          fillOpacity="0.3"
          d="M0,128L120,154.7C240,181,480,235,720,261.3C960,288,1200,288,1320,288L1440,288L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
        ></path>
      </svg>

      <div className="sanus-recrutamento-page-benefits-container">
        <SanusCardsSection
            title={title}
            subtitle="Beneficios"
            cards={benefits}
        />
      </div>
    </section>
  );
}