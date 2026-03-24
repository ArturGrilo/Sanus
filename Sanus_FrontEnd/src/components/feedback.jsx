import "../styles/feedback.css" ;
import FeedbackCarousel from "./feedback_carousel";

export default function Feedback() {
  return (
    <section className="sanus-feedback">
      <div className="sanus-feedback-container">
        <FeedbackCarousel />
      </div>
    </section>
  );
}