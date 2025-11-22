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

export default function AboutPage() {
  return (
    <PageTransition>
      <Header />

      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="about-overlay">
          <h1>Quem Somos</h1>
          <p>Cuidar do corpo. Respeitar a pessoa. Recuperar a vida.</p>
        </div>

        <svg
          className="about-wave"
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
        {/* <div className="sanus-about-us-container">
            <div className="sanus-about-us-sub-container">
                <div className="sanus-general-text">
                    <p>
                        Somos uma clínica de fisioterapia que começou familiar e que tem vindo a crescer com uma equipa multidisciplinar, composta por <strong>médico, fisioterapeutas e técnicos auxiliares.</strong> 
                    </p>
                    <p>
                        O nosso foco está na recuperação e prevenção, <strong>com base na evidência científica</strong>, utilizando as técnicas mais adequadas a cada caso, mantendo o <strong>ambiente familiar</strong> que nos caracteriza. 
                    </p>
                </div>
                <div className="feedback-comment-list" style={{width: "100%", justifyContent: "center"}}>
                    <h3>
                        <span className="feedback-comment">
                            Começámos pequenos,
                        </span>{" "}
                        <span className="feedback-comment other-color">
                            mantivemos o essencial.
                        </span>
                    </h3>
                </div>
                <p className="sanus-general-text">
                    Por sabermos da importância do <strong>bem-estar emocional</strong> na recuperação, aliamos o rigor e profissionalismo ao cuidado e atenção ao cliente, num ambiente que promove o sentimento de pertença.
                </p>
            </div> 
            <div className="about-story-image"></div>
        </div>*/}
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