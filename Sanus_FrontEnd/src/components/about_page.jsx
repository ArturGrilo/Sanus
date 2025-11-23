import Header from "./header";
import Footer from "./footer";
import "../styles/about_page.css";
import Mission from "./mission";
import AboutUsCards from "./about_us_cards";
import Team from "./team";
import Recrutamento from "./recrutamento";
import WhatsappButton from "./whatsapp_button";
import Feedback from "./feedback";
import ContactCTA from "./contact_cta_break_section";
import PageTransition from "./page_transition";
import SanusHero from "./sanus_hero";

export default function AboutPage() {
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
      <AboutUsCards/>
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