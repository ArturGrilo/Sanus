import "../styles/recrutamento.css";
import { useNavigate } from "react-router-dom";

export default function Recrutamento() {
  const navigate = useNavigate();
  return (
    <section className="sanus-recrutamento" id="localizacao">
        <svg style={{ transform: "scaleX(-1)", transformOrigin: "center" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="var(--color-primary-dark)" d="M0,160L120,176C240,192,480,224,720,240C960,256,1200,256,1320,256L1440,256L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path></svg>
        <div className="sanus-recrutamento-2">
            <svg className="sanus-pattern" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="a" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="var(--color-primary-dark)"/><path fill="none" stroke="#49caac" strokeLinecap="square" d="M20-5V5m0 30v10m20-30v10M0 15v10"/><path fill="none" stroke="#f28c82" strokeLinecap="square" d="M-5 40H5M-5 0H5m30 0h10M35 40h10M15 20h10"/></pattern></defs><rect width="800%" height="800%" fill="url(#a)"/></svg>
            <div className="sanus-recrutamento-container">
                <div className="sanus-recrutamento-text-column">
                    <header className="sanus-general-title alt">
                        <p className="sanus-services-text little alt" style={{marginBottom: "30px"}}>Carreira</p>
                        <h2>Recrutamento</h2>
                    </header>
                    <p className="sanus-general-text alt">
                        Procuramos fisioterapeutas empenhados, curiosos e apaixonados pela profissão, com vontade constante de aprender e de se manterem atualizados de acordo com a evidência científica.<br />
                        Valorizamos profissionais com raciocínio clínico, interesse genuíno em compreender cada doente e em definir intervenções assertivas, feitas com rigor, intenção e cuidado. Acreditamos que a qualidade técnica deve caminhar lado a lado com um atendimento humano, próximo e profissional.<br />
                        Se acredita em fazer fisioterapia com conhecimento, ética e excelência - e em ajudar cada pessoa de forma individualizada - queremos conhecê-lo(a).
                    </p>
                    <div className="sanus-recrutamento-button-container">
                        <button onClick={() => navigate("/recrutamento")} className="btn btn-primary">Saiba mais</button>
                    </div>
                </div>
                <div className="sanus-recrutamento-img-column">
                </div>
            </div>
        </div>
        <svg className="sanus-mission-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fillOpacity="1" d="M0,256L120,261.3C240,267,480,277,720,277.3C960,277,1200,267,1320,261.3L1440,256L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path></svg>
    </section>
  )
}