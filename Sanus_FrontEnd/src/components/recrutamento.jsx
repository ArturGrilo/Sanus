import "../styles/recrutamento.css";
import { useNavigate } from "react-router-dom";

export default function Recrutamento() {
  const navigate = useNavigate();
  return (
    <section className="sanus-recrutamento" id="localizacao">
        <svg style={{ transform: "scaleX(-1)", transformOrigin: "center" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="var(--color-primary-alt)" d="M0,160L120,176C240,192,480,224,720,240C960,256,1200,256,1320,256L1440,256L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path></svg>
        <div className="sanus-recrutamento-2">
            <svg className="sanus-pattern" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="a" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse">
                        <rect width="100%" height="100%" fill="var(--color-primary-alt)" opacity={0.1}/>
                        <path fill="none" stroke="var(--color-primary-dark)" strokeLinecap="square" d="M20-5V5m0 30v10m20-30v10M0 15v10"/>
                        <path fill="none" stroke="#f28c82" strokeLinecap="square" d="M-5 40H5M-5 0H5m30 0h10M35 40h10M15 20h10"/>
                    </pattern>
                </defs><rect width="800%" height="800%" fill="url(#a)"/></svg>
            <div className="sanus-recrutamento-container">
                <div className="sanus-recrutamento-text-column">
                    <header className="sanus-general-title">
                        <p className="sanus-services-text little" style={{marginBottom: "30px"}}>Carreira</p>
                        <h2>Recrutamento</h2>
                    </header>
                    <p className="sanus-general-text">
                        Procuramos fisioterapeutas empenhados, curiosos e apaixonados pela profissão, com vontade constante de aprender e de se manterem atualizados de acordo com a evidência científica.<br />
                        Valorizamos profissionais com raciocínio clínico, interesse genuíno em compreender cada doente e em definir intervenções assertivas, feitas com rigor, intenção e cuidado. Acreditamos que a qualidade técnica deve caminhar lado a lado com um atendimento humano, próximo e profissional.<br />
                        Se acredita em fazer fisioterapia com conhecimento, ética e excelência - e em ajudar cada pessoa de forma individualizada - queremos conhecê-lo(a).
                    </p>
                    <div className="sanus-recrutamento-button-container">
                        <button onClick={() => navigate("/recrutamento")} className="btn btn-secundary">Saiba mais</button>
                    </div>
                </div>
                <div className="sanus-recrutamento-img-column">
                </div>
            </div>
        </div>
        <div className="recruitment-waves-container">
            <svg class="sanus-recruitment-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="var(--color-primary-alt)" fill-opacity="1" d="M0,128L120,138.7C240,149,480,171,720,170.7C960,171,1200,149,1320,138.7L1440,128L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path></svg>
            <svg class="sanus-recruitment-wave-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="white" fill-opacity="1" d="M0,128L120,138.7C240,149,480,171,720,170.7C960,171,1200,149,1320,138.7L1440,128L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path></svg>
        </div>
    </section>
  )
}