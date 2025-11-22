import "../styles/skeleton_blog_card.css";

export default function BlogCardSkeleton({ featured = false }) {
  return (
    <div className={`blog-skeleton-card ${featured ? "featured" : ""}`}>
      
      <div className="skeleton-image"></div>

      <div className="skeleton-content">
        <div className="skeleton-line title"></div>
        <div className="skeleton-line author"></div>
        <div className="skeleton-line date"></div>

        <div className="skeleton-tags">
          <div className="skeleton-tag"></div>
          <div className="skeleton-tag"></div>
          <div className="skeleton-tag short"></div>
        </div>
      </div>
    </div>
  );
}