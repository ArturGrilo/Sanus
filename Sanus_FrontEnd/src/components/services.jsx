import { useEffect, useState } from "react";
import "../styles/services.css";
import ServiceCard from "./service_card";

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/services`);
        const data = await res.json();
        setServices(data);
      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
      }
    }
    fetchServices();
  }, []);

  return (
    <section className="sanus-services">
      <header className="sanus-services-title sanus-general-title">
        <p className="sanus-services-text little">O tratamento que merece</p>
        <h2>Os nossos serviços</h2>
      </header>

      <div className="sanus-services-container">
        {services.length === 0 ? (
          <p style={{ color: "var(--color-primary-dark)" }}>A carregar serviços…</p>
        ) : (
          services.map((service, index) => (
            <ServiceCard
              key={service.id || index}
              image={service.image}
              subtitle={service.subtitle}
              title={service.title}
              text={service.text}
              ctaText={service.ctaText}
              alt={service.alt}
              btnStyle={service.btnStyle}
              slug={service.slug}
            />
          ))
        )}
      </div>

      <svg className="sanus-services-waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path
          fill="#ffffff"
          fillOpacity="1"
          d="M0,128L120,154.7C240,181,480,235,720,261.3C960,288,1200,288,1320,288L1440,288L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
        ></path>
      </svg>
      <svg
        className="sanus-services-waves"
        style={{ zIndex: 2 }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <path
          fill="#4BCAAD"
          fillOpacity="0.3"
          d="M0,128L120,154.7C240,181,480,235,720,261.3C960,288,1200,288,1320,288L1440,288L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
        ></path>
      </svg>
    </section>
  );
}