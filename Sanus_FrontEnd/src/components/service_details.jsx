import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import ReactMarkdown from "react-markdown"; // 👈 IMPORTANTE
import "../styles/service_details.css";
import SplashScreen from "./splash_screen";

export default function ServicoDetalhe() {
  const { id } = useParams(); // slug ex: "fisioterapia"
  const [servico, setServico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchServico() {
      setLoading(true);
      const startTime = Date.now();

      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/servico/${id}`);
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 1800 - elapsed);

        if (!res.ok) throw new Error("Serviço não encontrado");

        const data = await res.json();
        setTimeout(() => {
          setServico(data);
          setLoading(false);
        }, remaining);
      } catch (err) {
        console.error("Erro ao carregar serviço:", err);
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 1800 - elapsed);

        setTimeout(() => {
          setError("Erro ao carregar serviço.");
          setLoading(false);
        }, remaining);
      }
    }

    fetchServico();
  }, [id]);

  if (loading)
    return  <SplashScreen />;

  if (error)
    return <p style={{ textAlign: "center", marginTop: "5rem", color: "red" }}>{error}</p>;

  if (!servico) return null;

  return (
    <>
      <Header />

      {/* HERO SECTION */}
      <section
        className="sanus-servico-hero"
        style={{
          backgroundImage: `url(${servico.image})`,
        }}
      >
        <div className="sanus-servico-overlay">
          <h1>{servico.title}</h1>
          {servico.subtitle && <p>{servico.subtitle}</p>}
        </div>

        <svg
          className="sanus-service-details-wave"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#fff"
            fillOpacity="1"
            d="M0,160L80,186.7C160,213,320,267,480,266.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </section>

      {/* MAIN CONTENT */}
      <section className="sanus-servico-content">
        {/* 🔹 Markdown renderizado */}
          <div className="sanus-markdown">
              <ReactMarkdown>{servico.bigger_description}</ReactMarkdown>
          </div>

          <div className="feedback-comment-list" style={{width: "100%", justifyContent: "center"}}>
            <h3>
              <span className="feedback-comment">{servico.catch_frase_initial}</span>
              <span className="feedback-comment other-color">
                {servico.catch_frase_other_color}
              </span>
              <span className="feedback-comment">{servico.catch_frase_final}</span>
            </h3>
        </div>
      </section>

      <Footer />
    </>
  );
}