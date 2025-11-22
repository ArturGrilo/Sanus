import "../styles/location.css";
import locationimage from '../images/Location/location.png';
import locationimage_mobile from '../images/Location/location_mobile.png';
import clinicaimage from '../images/Clinica/SanusVitae.jpeg';
import { Clock, MapPin } from "phosphor-react"
import { useNavigate } from "react-router-dom";

export default function Location() {
  const navigate = useNavigate();
  return (
    <section className="sanus-location">
      <div className="sanus-location-container">
        
        {/* Mapa */}
        <div className="sanus-location-map">
          <img className="sanus-location-img-map desktop" src={locationimage} alt="Sanus Vitae Barreiro fisioterapia pilates domicílio clinica" />
          <img className="sanus-location-img-map mobile" src={locationimage_mobile} alt="Sanus Vitae Barreiro fisioterapia pilates domicílio clinica" />
        </div>
        <img className="sanus-location-img-clinica" src={clinicaimage} alt="Sanus Vitae Barreiro fisioterapia pilates domicílio clinica" />
        <div className="sanus-location-sub-container">
          <header className="sanus-general-title alt">
            <p className="sanus-services-text little alt">Um lugar de confiança</p>
            <h2>A nossa clínica</h2>
          </header>

          {/* Informação */}
          <div className="sanus-location-info">
            <div className="sanus-location-details-column" style={{ justifyContent: "end" }}>
              <div className="sanus-location-details-column-item">
                <MapPin size={28} color="var(--color-bg)" weight="duotone" />
                <div className="sanus-location-details-column-item-container">
                  <h2 className="sanus-location-main-text">Localização</h2>
                  <p className="sanus-services-text alt">Rua de Dili, nº 17A</p>
                  <p className="sanus-services-text alt">2830-172 Santo André, Barreiro</p>
                </div>
              </div>
              <div className="sanus-location-details-column-item">
                <Clock size={28} color="var(--color-bg)" weight="duotone" />
                <div className="sanus-location-details-column-item-container">
                    <h2 className="sanus-location-main-text">Horário</h2>
                    <p className="sanus-services-text alt">Segunda a sexta: </p>
                    <p className="sanus-services-text alt bold">8:30 - 19:00</p>
                    <p className="sanus-services-text alt">Sábado e Domingo: </p>
                    <p className="sanus-services-text alt bold">Encerrado</p>
                </div>
              </div>
              <div className="sanus-location-button-container">
                <button onClick={() => navigate("/sobre-nos")} className="btn btn-primary">Quem somos</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <svg className="sanus-location-waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fillOpacity="1" d="M0,128L60,122.7C120,117,240,107,360,112C480,117,600,139,720,122.7C840,107,960,53,1080,48C1200,43,1320,85,1380,106.7L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path></svg>

      {/*<PhotoBook />*/}
      
    </section>
  );
}
