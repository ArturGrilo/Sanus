import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  revealSoft,
  revealImage,
  revealText,
  staggerSoft,
  viewportOnce,
} from "../animations/motionPresets";

export default function BlogCard({ image, title, author, date, id, tags = [] }) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const formatDate = (dateObj) => {
    if (!dateObj) return "";

    let dateInstance = null;

    if (dateObj instanceof Date) {
      dateInstance = dateObj;
    } else if (typeof dateObj?.toDate === "function") {
      dateInstance = dateObj.toDate();
    } else if (typeof dateObj?.seconds === "number") {
      dateInstance = new Date(dateObj.seconds * 1000);
    } else if (typeof dateObj?._seconds === "number") {
      dateInstance = new Date(dateObj._seconds * 1000);
    } else if (typeof dateObj === "string" || typeof dateObj === "number") {
      dateInstance = new Date(dateObj);
    }

    if (!dateInstance || Number.isNaN(dateInstance.getTime())) {
      return "";
    }

    const agora = new Date();
    const diffMs = agora - dateInstance;
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias === 0) return "Hoje";
    if (diffDias === 1) return "Ontem";
    if (diffDias > 1 && diffDias < 7) return `Há ${diffDias} dias`;

    return dateInstance.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formattedDate = formatDate(date);

  const handleNavigate = () => {
    navigate(`/blog/${id}`);
  };

  const motionProps = shouldReduceMotion
    ? {
        initial: false,
        animate: "visible",
      }
    : {
        variants: revealSoft,
        initial: "hidden",
        whileInView: "visible",
        viewport: viewportOnce,
      };

  return (
    <motion.div
      className="sanus-blog-card"
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleNavigate();
        }
      }}
      {...motionProps}
    >
      <motion.div
        className="sanus-blog-card-content"
        variants={shouldReduceMotion ? undefined : staggerSoft}
      >
        {image && (
          <motion.div
            className="sanus-blog-image-wrapper"
            variants={shouldReduceMotion ? undefined : revealImage}
          >
            <img src={image} alt={title} className="sanus-blog-card-image" />
            <div className="sanus-blog-image-overlay" />
          </motion.div>
        )}

        <motion.header
          className="sanus-blog-card-header"
          variants={shouldReduceMotion ? undefined : staggerSoft}
        >
          <motion.h4 variants={shouldReduceMotion ? undefined : revealText}>
            {title}
          </motion.h4>

          {(author || formattedDate) && (
            <motion.div
              className="sanus-blog-meta"
              variants={shouldReduceMotion ? undefined : revealText}
            >
              {author && (
                <p className="sanus-blog-author">
                  <strong>{author}</strong>
                </p>
              )}

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
            </motion.div>
          )}

          {tags.length > 0 && (
            <motion.div
              className="sanus-blog-tags"
              variants={shouldReduceMotion ? undefined : revealText}
            >
              {tags.map((t) => (
                <span
                  key={t.id || t.name}
                  className="sanus-tag"
                  style={{ backgroundColor: t.color }}
                >
                  {t.name}
                </span>
              ))}
            </motion.div>
          )}
        </motion.header>
      </motion.div>
    </motion.div>
  );
}