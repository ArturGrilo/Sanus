import { Link } from "react-router-dom";

export default function ServiceCard({ image, subtitle, title, text, ctaText, slug }) {
  // 🔹 Garante que o link usa o slug real da base de dados
  const link = slug ? `/servicos/${slug}` : "#";

  return (
    <div className="sanus-services-card">
      <div className="sanus-services-card-sub-container">
        <header className="sanus-general-title">
          {subtitle && <p className="sanus-services-text little">{subtitle}</p>}
          <h4>{title}</h4>
        </header>

        <p className="sanus-services-text">{text}</p>
      </div>

      {ctaText && (
        <Link to={link} className="btn btn-secundary">
          {ctaText}
        </Link>
      )}

      {image && (
        <img
          src={image}
          alt={`Imagem de ${title}`}
          className="sanus-services-image"
        />
      )}
    </div>
  );
}