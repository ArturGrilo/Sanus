import "../styles/team.css" ;
import TeamCarousel from "./team_carousel";

export default function Team() {
  return (
    <section className="sanus-team">
      <div className="sanus-team-container">
        <header className="sanus-general-title">
            <p className="sanus-services-text little">Conheça</p>
            <h2>Os nossos especialistas</h2>
        </header>

        <TeamCarousel />
      </div>
    </section>
  );
}