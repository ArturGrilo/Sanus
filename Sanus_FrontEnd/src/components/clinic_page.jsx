import React, { useMemo, useState } from "react";
import SanusHero from "./sanus_hero";
import InBetweenWaves from "./in_between_waves";
import VideoModal from "./video_modal";
import "../styles/clinic.css";
import Header from "./header";
import Footer from "./footer";
import PageTransition from "./page_transition";

export default function ClinicPage() {
  const [openVideo, setOpenVideo] = useState(false);

  const galleryItems = useMemo(
    () => [
      { variant: "wide", caption: "Espaço clínico SANUS" },
      { variant: "tall", caption: "Espaço clínico SANUS" },
      { variant: "square", caption: "Espaço clínico SANUS" },
      { variant: "wide", caption: "Espaço clínico SANUS" },
      { variant: "tallSoft", caption: "Espaço clínico SANUS" },
      { variant: "square", caption: "Espaço clínico SANUS" },
    ],
    []
  );

  return (
    <PageTransition>
      <Header />

      <main className="sanus-clinic">
        <SanusHero
          title="A Clínica"
          subtitle="Conheça o espaço, os equipamentos e a experiência SANUS."
          imageUrl="/Clinic/clinic-exterior.webp"
        />

        <InBetweenWaves color="#F6FAFB" />

        <section className="sanus-section sanus-clinic__intro">
          <div className="sanus-container">
            <div className="sanus-clinic__introGrid">
              <div className="sanus-clinic__introText">
                <h2>Um espaço com propósito</h2>
                <p>
                  Na SANUS, o ambiente e os recursos existem para servir um objetivo simples:
                  ajudar cada pessoa a recuperar mobilidade, reduzir dor e voltar a confiar no corpo.
                </p>
                <p>
                  Apostamos numa abordagem clínica rigorosa, com acompanhamento próximo e planos
                  ajustados à realidade de cada paciente.
                </p>
              </div>

              <div className="sanus-clinic__introCard">
                <div className="sanus-clinic__pill">O que nos define</div>
                <ul className="sanus-clinic__bullets">
                  <li>Integração de fisioterapia e exercício terapêutico</li>
                  <li>Pilates clínico com equipamentos e progressões seguras</li>
                  <li>Foco em resultados reais e acompanhamento consistente</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="sanus-section sanus-clinic__gallery">
          <div className="sanus-container">
            <div className="sanus-section__head">
              <h2>Equipamentos e ambiente</h2>
              <p>
                Imagens reais da clínica — espaços e recursos que suportam um trabalho clínico sério,
                com conforto e segurança.
              </p>
            </div>

            <div className="sanus-mediaGrid">
              {galleryItems.map((item, index) => (
                <figure
                  key={index}
                  className={`sanus-mediaCard sanus-mediaCard--${item.variant}`}
                >
                  <div className="sanus-mediaFrame">
                    <img
                      src="/Clinic/clinic-exterior.webp"
                      alt="Imagem da clínica"
                      loading="lazy"
                    />
                  </div>

                  <figcaption className="sanus-mediaCaption">
                    {item.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="sanus-section sanus-clinic__cta">
          <div className="sanus-container">
            <div className="sanus-clinic__ctaBox">
              <div>
                <h3>Quer perceber qual o melhor plano para si?</h3>
                <p>
                  Marque uma avaliação. Construímos um plano claro e ajustado aos seus objetivos.
                </p>
              </div>
              <div className="sanus-clinic__ctaActions">
                <a className="btn btn-primary" href="/marcacao">
                  Marcar avaliação
                </a>
                <a className="btn btn-secundary" href="/contactos">
                  Falar connosco
                </a>
              </div>
            </div>
          </div>
        </section>

        <VideoModal
          open={openVideo}
          onClose={() => setOpenVideo(false)}
          title="SANUS — Por dentro da clínica"
          srcWebm="/Videos/SanusVitae.mp4"
          srcMp4="/Videos/SanusVitae.mp4"
        />
      </main>

      <Footer />
    </PageTransition>
  );
}