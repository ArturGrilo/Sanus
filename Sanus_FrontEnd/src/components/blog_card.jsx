import { useNavigate } from "react-router-dom";

export default function BlogCard({ image, title, author, date, id, tags = [] }) {
  const navigate = useNavigate();
  // 🗓️ Função para formatar a data
  const formatDate = (dateObj) => {
    if (!dateObj) return "";

    const dateInstance =
      dateObj instanceof Date
        ? dateObj
        : new Date(dateObj.seconds ? dateObj.seconds * 1000 : dateObj);

    const agora = new Date();
    const diffMs = agora - dateInstance;
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // ⏱️ Fallback relativo: há X dias
    if (diffDias === 0) return "Hoje";
    if (diffDias === 1) return "Ontem";
    if (diffDias < 7) return `Há ${diffDias} dias`;

    // 🗓️ Formato curto e elegante em PT
    return dateInstance.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formattedDate = formatDate(date);

  return (
    <div className="sanus-blog-card" onClick={() => navigate(`/blog/${id}`)}>
      <div className="sanus-blog-card-content">
        {image && (
          <div className="sanus-blog-image-wrapper">
            <img src={image} alt={title} className="sanus-blog-card-image" />
            <div className="sanus-blog-image-overlay" />
          </div>
        )}

        <header className="sanus-blog-card-header">
          <h4>{title}</h4>

          {author && (
            <div className="sanus-blog-meta">
              <p className="sanus-blog-author">
                <strong>{author}</strong>
              </p>

              {formattedDate && (
                <p className="sanus-blog-date">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="sanus-blog-date-icon"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {formattedDate}
                </p>
              )}
            </div>
          )}

          {tags.length > 0 && (
            <div className="sanus-blog-tags">
              {tags.map((t) => (
                <span
                  key={t.id || t.name}
                  className="sanus-tag"
                  style={{ backgroundColor: t.color }}
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </header>
      </div>
    </div>
  );
}