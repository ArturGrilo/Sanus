import "../styles/hero.css";
import { CaretDown } from "phosphor-react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useEffect, useRef, useState } from "react";

export default function Hero() {
  gsap.registerPlugin(ScrollToPlugin);

  const words = [
    "viver a vida",
    "ser feliz",
    "sentir-se bem",
    "ir mais longe"
  ];

  const [currentWord, setCurrentWord] = useState(words[0]);
  const textRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (words.indexOf(currentWord) + 1) % words.length;
      const nextWord = words[nextIndex];

      // 🔹 animação de saída
      gsap.to(textRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setCurrentWord(nextWord);

          // 🔹 animação de entrada
          gsap.fromTo(
            textRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
          );
        },
      });
    }, 2500);

    return () => clearInterval(interval);
  });

  const scrollDown = () => {
    const hero = document.querySelector(".sanus-hero");
    const nextSection = hero?.nextElementSibling;
    if (nextSection) {
      gsap.to(window, { duration: 0.3, scrollTo: { y: nextSection }, ease: "power2.inOut" });
    }
  };

  return (
    <section className="sanus-hero">
      <div className="sanus-hero-overlay"></div>

      <div className="sanus-hero-content">
        <h1 className="sanus-hero-title">
          Saúde para{" "}
          <span ref={textRef} className="sanus-hero-dynamic">
            {currentWord}
          </span>
        </h1>
        <p className="sanus-hero-subtitle">
          Cuidar das pessoas com ciência, empatia e movimento.
        </p>
      </div>

      <div className="sanus-hero-search-more" onClick={scrollDown}>
        <CaretDown className="arrow first-arrow" size={40} color="var(--color-bg)" weight="bold" />
        <CaretDown className="arrow second-arrow" size={40} color="var(--color-bg)" weight="bold" />
        <CaretDown className="arrow third-arrow" size={40} color="var(--color-bg)" weight="bold" />
      </div>

      <svg
        className="sanus-hero-waves"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <path
          fill="#FFFFFF"
          fillOpacity="1"
          d="M0,64L120,69.3C240,75,480,85,720,80C960,75,1200,53,1320,42.7L1440,32L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
        ></path>
      </svg>
    </section>
  );
}