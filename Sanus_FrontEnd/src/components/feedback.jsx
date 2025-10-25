import "../styles/feedback.css" ;
import FeedbackCarousel from "./feedback_carousel";

export default function Feedback() {
  return (
    <section className="sanus-feedback">
      <div className="sanus-feedback-container">
        <FeedbackCarousel />
      </div>
      <svg className="sanus-mission-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#4BCAAD" fill-opacity="0.3" d="M0,160L80,186.7C160,213,320,267,480,266.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path></svg>
    </section>
  );
}