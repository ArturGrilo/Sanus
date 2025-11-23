import "../styles/recrutamento_benefits.css";

export default function SanusBenefits({
  title = "Porque trabalhar connosco?",
  benefits = [
    { title: "Ambiente Humano", desc: "Equipa leve, empática e colaborativa." },
    { title: "Formação Contínua", desc: "Workshops internos e apoio a certificações." },
    { title: "Excelência Clínica", desc: "Protocolos modernos e orientados pela evidência." },
    { title: "Tecnologia & Inovação", desc: "Recursos digitais e equipamentos topo de gama." },
    { title: "Horários Equilibrados", desc: "Respeito pelo descanso e bem-estar." },
    { title: "Crescimento Real", desc: "Plano de progressão e responsabilidade gradual." },
  ],
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
        <div className="sanus-recrutamento-page-benefits-sub-container">
            <header className="sanus-general-title">
                <p className="sanus-services-text little">Beneficios</p>
                <h2>{title}</h2>
            </header>

            <div className="sanus-recrutamento-page-benefits-grid">
                {benefits.map((benefit) => (
                    <div
                    className="sanus-recrutamento-page-benefit-card"
                    key={benefit.title}
                    >
                    <h3>{benefit.title}</h3>
                    <p>{benefit.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
}