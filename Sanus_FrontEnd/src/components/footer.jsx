import "../styles/footer.css"
import ClinicaSanusVitaeBarreiro from '../images/Footer/ClinicaSanusVitaeBarreiro.jpeg'
import ClinicaSanusVitaeBarreiro2 from '../images/Footer/ClinicaSanusVitaeBarreiro_4.jpeg'
import ClinicaSanusVitaeBarreiro3 from '../images/Footer/ClinicaSanusVitaeBarreiro_3.jpeg'
import ClinicaSanusVitaeBarreiro4 from '../images/Footer/ClinicaSanusVitaeBarreiroMap.png'
import { MapPin, Clock, Phone, Envelope, FacebookLogo, InstagramLogo } from "phosphor-react"
import SanusVitaeLogo from '../images/Logo/SanusVitaeLogo.png';
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <section className="sanus-footer" id="localizacao">
        <svg className="sanus-footer-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#2E5C6E" background="#000000" fillOpacity="0.97" d="M0,160L120,176C240,192,480,224,720,240C960,256,1200,256,1320,256L1440,256L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path></svg>
        <div className="sanus-footer-2">
            <div className="sanus-footer-container">
                <div className="sanus-footer-logo-column">
                    <img src={SanusVitaeLogo} className="sanus-header-logo" alt="Sanus Vitae logo" />
                    <p className="sanus-general-text alt">clínica fisiátrica</p>
                    <div className="sanus-footer-item">
                        <FacebookLogo size={28} color="var(--color-bg)" weight="fill" />
                        <InstagramLogo size={28} color="var(--color-bg)" weight="fill" />
                    </div>
                </div>

                <div className="sanus-footer-columns">
                    {/* Coluna 1: Telemóvel e email */}
                    <div className="sanus-footer-info">
                        <div className="sanus-footer-item" style={{ justifyContent: "end" }}>
                            <Clock size={28} color="var(--color-bg)" weight="fill" />
                            <div className="sanus-footer-horaire">
                                <p className="sanus-general-text alt">Segunda a sexta: </p>
                                <p className="sanus-general-text alt bold" style={{ marginBottom: "15px" }}>8:30 - 19:00</p>
                                <p className="sanus-general-text alt">Sábado e Domingo: </p>
                                <p className="sanus-general-text alt bold">Encerrado</p>
                            </div>
                        </div>
                    </div>
                    {/* Coluna 2: Localização e horário */}
                    <div className="sanus-footer-info">
                        <div className="sanus-footer-item">
                            <MapPin size={28} color="var(--color-bg)" weight="fill" />
                            <div className="sanus-footer-map-address">
                                <p className="sanus-general-text alt">Rua de Dili, n,º 17A</p>
                                <p className="sanus-general-text alt">2830-172 Santo André - Barreiro</p>
                            </div>
                        </div>
                        <div className="sanus-footer-item">
                            <Phone size={28} color="var(--color-bg)" weight="fill" />
                            <div className="sanus-footer-horaire">
                                <p className="sanus-general-text alt">(+351) 928 410 954</p>
                                <p className="sanus-general-text alt">(+351) 212 160 237</p>
                            </div>
                        </div>
                        <div className="sanus-footer-item">
                            <Envelope size={28} color="var(--color-bg)" weight="fill" />
                            <p className="sanus-general-text alt">sanusvitae2021@gmail.com</p>
                        </div>
                    </div>

                    {/* Coluna 2: Imagens */}
                    <div className="sanus-location-images">
                        <img src={ClinicaSanusVitaeBarreiro} className="sanus-location-image-1" alt="React logo" />
                        <img src={ClinicaSanusVitaeBarreiro3} className="sanus-location-image-2" alt="React logo" />
                        <img src={ClinicaSanusVitaeBarreiro2} className="sanus-location-image-3" alt="React logo" />
                        <img src={ClinicaSanusVitaeBarreiro4} className="sanus-location-image-4" alt="React logo" />
                    </div>
                </div>
            </div>
            <div className="sanus-footer-policies">
                <div className="sanus-footer-separator"></div>
                <div className="sanus-footer-more-info">
                    <p>Sanus Vitae © 2025</p>
                    <p> 
                        <Link to="/politica-de-privacidade">Política de Privacidade</Link>
                        {" | "} 
                        <Link to="/politica-de-cookies">Política de Cookies</Link>
                        {" | "} 
                        <Link to="/termos-de-utilizacao">Termos de Utilização</Link>
                    </p>
                </div>
            </div>
        </div>
    </section>
  );
}