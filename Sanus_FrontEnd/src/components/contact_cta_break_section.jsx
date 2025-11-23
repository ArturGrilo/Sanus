import "../styles/contact_cta_break_section.css";
import { useNavigate } from "react-router-dom";

export default function ContactCTA() {
  const navigate = useNavigate();
  return (
    <section className="sanus-contact-cta">
      <h3 className="sanus-general-title">
        Está interessado nos nossos cuidados ou tem alguma dúvida?
      </h3>
      <div className="sanus-cta-btn-container">
        <a onClick={() => navigate("/contactos")} className="btn btn-primary">
          Fale connosco
        </a>
      </div>
      <svg className="sanus-mission-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fillOpacity="1" d="M0,256L120,261.3C240,267,480,277,720,277.3C960,277,1200,267,1320,261.3L1440,256L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path></svg>
      <svg className="sanus-pattern" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="a" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2f5d6f"/><path fill="none" stroke="#49caac" strokeLinecap="square" d="M20-5V5m0 30v10m20-30v10M0 15v10"/><path fill="none" stroke="#f28c82" strokeLinecap="square" d="M-5 40H5M-5 0H5m30 0h10M35 40h10M15 20h10"/></pattern></defs><rect width="800%" height="800%" fill="url(#a)"/></svg>
    </section>
  );
}