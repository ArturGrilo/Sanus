import Header from "./header";
import Footer from "./footer";
import "../styles/about_page.css";
import Mission from "./mission";
import SanusCardsSection from "./sanus_little_cards";
import FAQSection from "./faq_section";
import Recrutamento from "./recrutamento";
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
        imageUrl="/Clinica/foto8.png"
      /> 
      <section className="sanus-about-us">
        <div className="sanus-about-us-container">
            <div className="feedback-comment-list" style={{width: "100%", justifyContent: "center"}}>
                <h3>
                    <span className="feedback-comment">
                        Clínica de fisioterapia que alia experiência,
                    </span>
                    <span className="feedback-comment other-color">
                        evidência científica e tecnologia
                    </span>
                    <span className="feedback-comment">
                        no tratamento de cada pessoa.
                    </span>
                </h3>
            </div>
            
            <div className="sanus-about-us-values-grid">
                {[
                    { value: "★ 4.6/5", label: "avaliações Google" },
                    { value: "20+", label: "anos de experiência" },
                    { value: "7 500+", label: "pacientes acompanhados" },
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
      <div className="about-us-cta-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="var(--color-primary-dark)" fill-opacity="1" d="M0,128L120,154.7C240,181,480,235,720,261.3C960,288,1200,288,1320,288L1440,288L1440,320L0,320Z"></path></svg>
        <ContactCTA title="Como podemos ajudar?"/>
      </div> 
      <section className="sv-agendar-faq">
        <FAQSection faqKey="quem-somos" />
      </section>
      {/*<Team/>*/}
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
      <div className="sanus-about-us-footer">
        <Footer />
      </div>
    </PageTransition>
  );
}