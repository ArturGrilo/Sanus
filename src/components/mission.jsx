import "../styles/mission.css"
import { HandHeartIcon, MicroscopeIcon, CertificateIcon, CheckFatIcon, SmileyIcon } from "@phosphor-icons/react";
import { Handshake } from "phosphor-react"

export default function Mission() {
  return (
    <section className="sanus-mission">
      <div className="sanus-mission-container">
        <div className="sanus-mission-grid">
          <div className="sanus-mission-grid-item">
            <HandHeartIcon size={120} weight="duotone" color="var(--color-primary-dark)" ></HandHeartIcon>
            <header className="sanus-general-title alt2">
              <h3>Acolhimento</h3>
            </header> 
            <p className="sanus-mission-text">Empatia e proximidade</p>
          </div>
          <div className="sanus-mission-grid-item">
            <CertificateIcon size={120} weight="duotone" color="var(--color-primary-dark)" ></CertificateIcon>
            <header className="sanus-general-title alt2">
              <h3>Profissionalismo</h3>
            </header> 
            <p className="sanus-mission-text">Rigor científico e ética</p>
          </div>
          <div className="sanus-mission-grid-item">
            <MicroscopeIcon size={120} weight="duotone" color="var(--color-primary-dark)" ></MicroscopeIcon>
            <header className="sanus-general-title alt2">
              <h3>Inovação</h3>
            </header> 
            <p className="sanus-mission-text">Novas técnicas e abordagens</p>
          </div>
          <div className="sanus-mission-grid-item">
            <Handshake size={120} weight="duotone" color="var(--color-primary-dark)" ></Handshake>
            <header className="sanus-general-title alt2">
              <h3>Compromisso</h3>
            </header> 
            <p className="sanus-mission-text">Dedicação total a cada caso</p>
          </div>
          <div className="sanus-mission-grid-item">
            <CheckFatIcon size={120} weight="duotone" color="var(--color-primary-dark)" ></CheckFatIcon>
            <header className="sanus-general-title alt2">
              <h3>Verdade</h3>
            </header> 
            <p className="sanus-mission-text">Transparência e honestidade</p>
          </div>
          <div className="sanus-mission-grid-item">
            <SmileyIcon size={120} weight="duotone" color="var(--color-primary-dark)" ></SmileyIcon>
            <header className="sanus-general-title alt2">
              <h3>Alegria & Bem-estar</h3>
            </header> 
            <p className="sanus-mission-text">Leveza e motivação</p>
          </div>
        </div>
        <div className="sanus-mission-button">
          <a href="#quemsomos" className="btn btn-secundary">Saiba mais</a>
        </div>
        <svg className="sanus-mission-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fillOpacity="1" d="M0,256L120,261.3C240,267,480,277,720,277.3C960,277,1200,267,1320,261.3L1440,256L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path></svg>
      </div>
    </section>
  );
}