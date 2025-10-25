import "../styles/insurance.css"
import sadgnr from '../images/Seguros/sad-gnr.png';
import adse from '../images/Seguros/adse.jpg';
import cgd from '../images/Seguros/cgd.png';
import adm from '../images/Seguros/adm.png';
import sams from '../images/Seguros/sams.png';
import medicare from '../images/Seguros/medicare.png';
import advancecare from '../images/Seguros/advance-care.png';
import medis from '../images/Seguros/medis.png';

export default function Insurance() {
  return (
    <section className="sanus-insurance">
      <svg className="sanus-pattern alt" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pattern-fisio" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="rgba(75, 202, 173, 0.1)"/>
            <path fill="none" stroke="#2f5d6f" strokeLinecap="square" d="M20-5V5m0 30v10m20-30v10M0 15v10"/>
            <path fill="none" stroke="#4BCAAD" strokeLinecap="square" d="M-5 40H5M-5 0H5m30 0h10M35 40h10M15 20h10"/>
          </pattern>
        </defs>
        <rect width="800%" height="800%" fill="url(#pattern-fisio)"/>
      </svg>
      <div className="sanus-insurance-container">
        <div className="sanus-insurance-sub-container">
          <header className="sanus-general-title alt2">
            <p className="sanus-services-text little alt2">Cobertura de cuidados de saúde</p>
            <h2>Acordos e convenções</h2>
          </header>
          <p className="sanus-general-text">
            Na <strong>Sanus Vitae</strong>, pode beneficiar das suas convenções e seguros de saúde. 
            Se for titular de um seguro ou subsistema, poderá obter o 
            <strong> reembolso parcial dos tratamentos de fisioterapia</strong>, incluindo os realizados ao domicílio.
          </p>
          <p className="sanus-general-text">
            Recomendamos sempre a <strong>confirmação prévia junto da sua seguradora ou subsistema </strong> 
            para conhecer as condições específicas de autorização e os valores de reembolso aplicáveis.
          </p>
        </div>

        <div className="sanus-insurance-grid">
          <img src={adse} className="sanus-insurance-grid-item" alt="Sanus Vitae Barreiro Fisioterapia adse" />
          <img src={sadgnr} className="sanus-insurance-grid-item" alt="Sanus Vitae Barreiro Fisioterapia sad-gnr" />
          <img src={adm} className="sanus-insurance-grid-item" alt="Sanus Vitae Barreiro Fisioterapia adm militares" />
          <img src={cgd} className="sanus-insurance-grid-item" alt="Sanus Vitae Barreiro Fisioterapia adm cgd" />
          <img src={sams} className="sanus-insurance-grid-item" alt="Sanus Vitae Barreiro Fisioterapia adm sams" />
          <img src={medicare} className="sanus-insurance-grid-item" alt="Sanus Vitae Barreiro Fisioterapia adm medicare" />
          <img src={advancecare} className="sanus-insurance-grid-item" alt="Sanus Vitae Barreiro Fisioterapia adm advancecare" />
          <img src={medis} className="sanus-insurance-grid-item" alt="Sanus Vitae Barreiro Fisioterapia adm medis" />
        </div>
      </div>

      <svg className="sanus-insurance-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fill-opacity="1" d="M0,128L120,138.7C240,149,480,171,720,170.7C960,171,1200,149,1320,138.7L1440,128L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path></svg>
      <svg className="sanus-insurance-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#4BCAAD" fill-opacity="0.3" d="M0,128L120,138.7C240,149,480,171,720,170.7C960,171,1200,149,1320,138.7L1440,128L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path></svg>
    </section>
  );
}