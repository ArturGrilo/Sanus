import Header from "./header";
import Footer from "./footer";
import "../styles/recrutamento_page.css";
import SanusHero from "./sanus_hero";
import PageTransition from "./page_transition";
import WhatsappButton from "./whatsapp_button";
import ContactCTA from "./contact_cta_break_section";
import Feedback from "./feedback";
import SanusBenefits from "./recrutamento_benefits";

export default function RecrutamentoPage() {
  return (
    <PageTransition>
      <Header />
      <SanusHero
        title="Recrutamento"
        subtitle="Cresce connosco."
        imageUrl="/Team/Team.png"
      />
      {/* INTRO */}
      <section className="sanus-recrutamento-page">
        <div className="sanus-recrutamento-page-container">
          <div
            className="feedback-comment-list"
            style={{ width: "100%", justifyContent: "center" }}
          >
            <h3>
              <span className="feedback-comment">
                Procuramos pessoas extraordinárias,
              </span>
              <span className="feedback-comment other-color">
                movidas pelo cuidado genuíno,
              </span>
              <span className="feedback-comment">
                que querem fazer a diferença todos os dias.
              </span>
            </h3>
          </div>
        </div>
      </section>
      <SanusBenefits />
      

      {/* PERFIL
      <section className="sanus-recrutamento-page-perfis">
        <div className="sanus-recrutamento-page-container">
          <h2 className="sanus-section-title">Perfis que procuramos</h2>

          <ul className="sanus-recrutamento-page-perfis-list">
            <li>Fisioterapeutas (todas as áreas)</li>
            <li>Receção/Front-Office</li>
            <li>Estágios Curriculares</li>
            <li>Profissionais Externos (Massagem, Pilates, etc.)</li>
          </ul>
        </div>
      </section>

      <section className="sanus-recrutamento-page-vagas">
        <div className="sanus-recrutamento-page-container">
          <h2 className="sanus-section-title">Oportunidades em Aberto</h2>

          <div className="sanus-recrutamento-page-vagas-list">
            <p className="sanus-recrutamento-page-sem-vagas">
              De momento não existem vagas disponíveis.  
              <br />Mas adorávamos conhecer-te — envia candidatura espontânea.
            </p>
          </div>
        </div>
      </section>

      <section className="sanus-recrutamento-page-form">
        <div className="sanus-recrutamento-page-container">
          <h2 className="sanus-section-title">Candidatura Espontânea</h2>

          <form className="sanus-recrutamento-page-form-box">
            <input type="text" placeholder="Nome" required />
            <input type="email" placeholder="Email" required />
            <input type="tel" placeholder="Telefone" required />
            <input type="text" placeholder="Função a que se candidata" />
            <textarea placeholder="Mensagem"></textarea>
            <input type="file" />
            <button type="submit" className="sanus-btn-primary">Enviar</button>
          </form>
        </div>
      </section>

      <section className="sanus-recrutamento-page-processo">
        <div className="sanus-recrutamento-page-container">
          <h2 className="sanus-section-title">Processo de Recrutamento</h2>

          <div className="sanus-recrutamento-page-processo-grid">
            {[
              "Envio da candidatura",
              "Análise do perfil",
              "Entrevista online/presencial",
              "Sessão prática/observação",
              "Proposta final",
              "Integração e mentoria",
            ].map((step, index) => (
              <div key={index} className="sanus-recrutamento-page-processo-item">
                <span className="step-number">{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactCTA />
      <Feedback /> */}
      <WhatsappButton />
      <Footer />
    </PageTransition>
  );
}