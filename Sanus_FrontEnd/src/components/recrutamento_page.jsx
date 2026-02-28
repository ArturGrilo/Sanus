import Header from "./header";
import Footer from "./footer";
import "../styles/recrutamento_page.css";
import SanusHero from "./sanus_hero";
import PageTransition from "./page_transition";
import ContactCTA from "./contact_cta_break_section";
import SanusBenefits from "./recrutamento_benefits";
import ProfilesSection from "./recrutamento_profiles";
import {HandsClapping, UsersThree, GraduationCap} from "phosphor-react";
import { HandHeartIcon } from "@phosphor-icons/react";
import FAQSection from "./faq_section";
import RecruitmentApplicationForm from "./recruitment_application_form";

export default function RecrutamentoPage() {
  const profiles = [
    {
      icon: <UsersThree size={36} weight="regular" color="var(--color-other)" />,
      title: "Fisioterapeuta",
      desc: "Todas as áreas clínicas."
    },

    {
      icon: <HandsClapping size={36} weight="regular" color="var(--color-other)" />,
      title: "Receção / Front-Office",
      desc: "Formação em Reabilitação e Fisioterapia."
    },

    {
      icon: <GraduationCap size={36} weight="regular" color="var(--color-other)" />,
      title: "Estágio Curricular",
      desc: "Formação prática com acompanhamento próximo."
    },

    {
      icon: <HandHeartIcon size={36} weight="regular" color="var(--color-other)" />,
      title: "Profissional Externo",
      desc: "Massagem, Pilates e terapias complementares."
    },
  ];

  const steps = [
    {
      icon: <span className="sanus-profile-icon">1</span>,
      title: "Envio da candidatura",
    },

    {
      icon: <span className="">2</span>,
      title: "Análise do perfil",
    },

    {
      icon: <span className="">3</span>,
      title: "Entrevista online / presencial",
    },

    {
      icon: <span className="">4</span>,
      title: "Sessão prática / observação",
    },

    {
      icon: <span className="">5</span>,
      title: "Proposta final",
    },

    {
      icon: <span className="">6</span>,
      title: "Integração e mentoria",
    }
  ];

  return (
    <PageTransition>
      <Header />
      <SanusHero
        title="Recrutamento"
        subtitle="Cresce connosco."
        imageUrl="/Clinica/equipa.png"
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
                Procuramos pessoas apaixonadas pela fisioterapia, que queiram fazer a diferença,
              </span>
              <span className="feedback-comment other-color">
                 com vontade de saber sempre mais para prestar o melhor serviço,
              </span>
              <span className="feedback-comment">
                que se traduza na reabilitação dos nossos clientes
              </span>
            </h3>
          </div>
        </div>
      </section>
      <SanusBenefits />
      <ProfilesSection
        title="Perfis que procuramos"
        subtitle="Profissões"
        items={profiles}
        zdeIndex={11}
      />

      <RecruitmentApplicationForm />
      <section style={{ marginBottom: "-100px" }}>
        <ProfilesSection
          title="Processo de Recrutamento"
          subtitle="Etapas"
          items={steps}
          color="var(--color-primary-dark)"
          zdeIndex={9}
        />
      </section>
      <section style={{ position: "relative", margin: "0 0 -20px 0", zIndex: "10" }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="var(--color-primary-dark)" fillOpacity="1" d="M0,160L80,186.7C160,213,320,267,480,266.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path></svg>
      </section>
      <ContactCTA
        title="Quer saber mais sobre a Sanus Vitae?"
        buttonText="Entre em contacto"
        buttonLink="/contactos"
      />
      <section style={{ marginBottom: "-80px", marginTop: "40px" }}>
        <FAQSection faqKey="recrutamento" />
      </section>
      <Footer />
    </PageTransition>
  );
}