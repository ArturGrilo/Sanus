import Header from "./header";
import Footer from "./footer";
import "../styles/blog_page.css";
import WhatsappButton from "./whatsapp_button";
import { useEffect, useState } from "react";
import BlogCard from "./blog_card";
import BlogCardSkeleton from "./skeleton_blog_card";

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/blogs`);
        if (!res.ok) throw new Error("Erro ao carregar blogs");

        const data = await res.json();
        setArticles(data);
      } catch (err) {
        console.error("Erro ao carregar blog:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <>
      <Header />

      {/* HERO SECTION */}
      <section className="sanus-blog-hero">
        <div className="sanus-blog-hero-overlay">
          <h1>Blog</h1>
          <p>Notícias, evidência e inspiração clínica.</p>
        </div>

        <svg
          className="sanus-blog-hero-wave"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#fff"
            fillOpacity="1"
            d="M0,160L80,186.7C160,213,320,267,480,266.7C640,267,800,213,960,197.3C1120,181,1280,203,1360,213.3L1440,224L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
        </svg>
      </section>

      <section className="sanus-blog-page">
        <div className="sanus-blog-page-container">
            <div className="sanus-blog-page-grid">
              {loading ? (
                <>

                  {/* GRID SKELETON */}
                  <div className="sanus-blog-page-container">
                    <div className="sanus-blog-page-grid">
                      <BlogCardSkeleton featured />
                      <BlogCardSkeleton featured />
                      <BlogCardSkeleton />
                      <BlogCardSkeleton />
                      <BlogCardSkeleton />
                    </div>
                  </div>
                </>
              ) : articles.length === 0 ? (
                <p style={{ color: "var(--color-primary-dark)" }}>Nenhum artigo disponível.</p>
              ) : (
                articles.map((article, index) => (
                  <div
                    key={article.id}
                    className={`sanus-post ${index < 2 ? "featured" : ""}`}
                  >
                    <BlogCard
                      image={article.imageUrl}
                      title={article.title}
                      author={article.author}
                      content={article.content?.slice(0, 180)}
                      id={article.id}
                      date={article.updatedAt || article.createdAt}
                      tags={article.tags || []}
                    />
                  </div>
                ))
              )}
            </div>
        </div>
      </section>
      <WhatsappButton/>
      <div className="sanus-about-us-footer">
        <Footer />
      </div>
    </>
  );
}