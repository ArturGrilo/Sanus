import "../styles/skeleton_hero.css";

export default function BlogHeroSkeleton() {
  return (
    <div className="blog-hero-skeleton">
      <div className="hero-shimmer"></div>
      <div className="hero-lines">
        <div className="line big"></div>
        <div className="line small"></div>
      </div>
    </div>
  );
}