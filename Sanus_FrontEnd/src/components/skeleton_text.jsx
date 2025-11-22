import "../styles/sanus_text_skeleton.css";

export default function TextSkeleton() {
  return (
    <div className="sanus-text-skeleton">
      <div className="skeleton-line title"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line half"></div>

      <div className="skeleton-space"></div>

      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line long"></div>
      <div className="skeleton-line half"></div>

      <div className="skeleton-space"></div>

      <div className="skeleton-line"></div>
      <div className="skeleton-line long"></div>
      <div className="skeleton-line"></div>
    </div>
  );
}
