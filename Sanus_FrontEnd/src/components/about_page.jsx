import Header from "./header";
import Footer from "./footer";
import "../styles/about_page.css";
import Mission from "./mission";
import SanusCardsSection from "./sanus_little_cards";
import Team from "./team";
import Recrutamento from "./recrutamento";
import WhatsappButton from "./whatsapp_button";
import Feedback from "./feedback";
import ContactCTA from "./contact_cta_break_section";
import PageTransition from "./page_transition";
import SanusHero from "./sanus_hero";

export default function AboutPage() {
  const missionCards = [
    {
      id: 1,
      image: "/Clinica/foto1.jpeg",
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
    <PageTransition>
      <Header />
      <SanusHero
        title="Quem Somos"
        subtitle="Muito mais que uma clínica."
        imageUrl="/Clinica/foto8.jpeg"
      /> 
      <section className="sanus-about-us">
        <div className="sanus-about-us-container">
            <div className="feedback-comment-list" style={{width: "100%", justifyContent: "center"}}>
                <h3>
                    <span className="feedback-comment">
                        De um projeto familiar a uma clínica de referência,
                    </span>
                    <span className="feedback-comment other-color">
                        movida por pessoas e pelo cuidado genuíno de tratar pessoas,
                    </span>
                    <span className="feedback-comment">
                        não apenas sintomas.
                    </span>
                </h3>
            </div>
            
            <div className="sanus-about-us-values-grid">
                {[
                    { value: "★ 4.6/5", label: "avaliações Google" },
                    { value: "20+", label: "anos de experiência" },
                    { value: "7 500+", label: "pacientes acompanhados" },
                    { value: "3-5", label: "semanas melhoria média" },
                    ].map((stat) => (
                    <div key={stat.value} className="sanus-about-us-values-grid-item">
                        <dt className="sanus-about-us-values-grid-item-value">{stat.value}</dt>
                        <dd className="sanus-about-us-values-grid-item-label">{stat.label}</dd>
                    </div>
                ))}
            </div>
        </div>
      </section>
      <SanusCardsSection
        title="A nossa missão"
        subtitle="Sanus Vitae"
        cards={missionCards}
      />
      <div className="sanus-about-us-mission">
        <Mission/>
      </div>
      <div className="sanus-about-us-feedback">
        <Feedback/>
      </div>
      <ContactCTA/>
      <Team/>
      <Recrutamento/>
      <section className="sanus-about-us" style={{marginTop:"160px", marginBottom:"100px"}}>
        <div className="sanus-about-us-container">
            <div className="feedback-comment-list" style={{width: "100%", justifyContent: "center"}}>
                <h3>
                    <span className="feedback-comment">
                        Aqui, não tratamos apenas o corpo.
                    </span>
                    <span className="feedback-comment other-color">
                        Cuidamos da pessoa.
                    </span>
                </h3>
            </div>
        </div>
      </section>
      <WhatsappButton/>
      <div className="sanus-about-us-footer">
        <Footer />
      </div>
    </PageTransition>
  );
}