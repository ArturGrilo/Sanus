import Header from "./header";
import Footer from "./footer";
import "../styles/recrutamento_page.css";
import SanusHero from "./sanus_hero";
import PageTransition from "./page_transition";
import WhatsappButton from "./whatsapp_button";
import ContactCTA from "./contact_cta_break_section";
import SanusBenefits from "./recrutamento_benefits";
import ProfilesSection from "./recrutamento_profiles";
import {HandsClapping, UsersThree, GraduationCap} from "phosphor-react";
import { HandHeartIcon } from "@phosphor-icons/react";
import FAQSection from "./faq_section";
import RecruitmentApplicationForm from "./recruitment_application_form";

export default function RecrutamentoPage() {
  const faqs = [
    {
      question: "Qual o perfil de profissional que procuram?",
      answer:
        "Valorizamos profissionais empáticos, responsáveis e orientados para resultados, com forte capacidade de comunicação e alinhamento com uma prática clínica moderna e baseada na evidência."
    },
    {
      question: "Aceitam fisioterapeutas recém-licenciados?",
      answer:
        "Sim. Temos um programa de integração e mentoria estruturado para apoiar quem está em início de carreira, garantindo desenvolvimento progressivo e acompanhamento próximo."
    },
    {
      question: "Preciso de experiência em alguma área específica?",
      answer:
        "A experiência é valorizada, mas não obrigatória. O mais importante é o alinhamento com a cultura da clínica, vontade de aprender e compromisso com a qualidade do atendimento."
    },
    {
      question: "Quanto tempo demora até receber resposta?",
      answer:
        "O tempo médio é entre 5 e 10 dias úteis, podendo variar consoante o número de candidaturas. Garantimos resposta a todos os candidatos."
    },
    {
      question: "O que deve incluir o meu CV?",
      answer:
        "Formação académica, certificações, experiência relevante, áreas de interesse e contactos atualizados. Portfólio ou relatório de estágio podem ser incluídos."
    },
    {
      question: "Que tipo de contrato oferecem?",
      answer:
        "Dependendo da função, oferecemos contratos a termo, sem termo ou colaboração externa. Explicamos todas as condições durante o processo."
    },
  ];

  const profiles = [
    {
      icon: <UsersThree size={36} weight="regular" color="var(--color-other)" />,
      title: "Fisioterapeuta",
      desc: "Todas as áreas clínicas."
    },

    {
      icon: <HandsClapping size={36} weight="regular" color="var(--color-other)" />,
      title: "Receção / Front-Office",
      desc: "Atendimento humano e organização."
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
        <FAQSection 
          title="Perguntas Frequentes"
          subtitle="Dúvidas"
          faqs={faqs}
        />
      </section>
      <WhatsappButton />
      <Footer />
    </PageTransition>
  );
}