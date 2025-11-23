import Header from "./header";
import Footer from "./footer";
import "../styles/blog_page.css";
import WhatsappButton from "./whatsapp_button";
import { useEffect, useState } from "react";
import BlogCard from "./blog_card";
import BlogCardSkeleton from "./skeleton_blog_card";
import SanusHero from "./sanus_hero";
import PageTransition from "./page_transition";

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
    <PageTransition>
      <Header />
      <SanusHero
        title="Blog"
        subtitle="Notícias, evidência e inspiração clínica."
        imageUrl="/Services/fisioterapia.webp"
        loading={loading}
      />          
      <section className="sanus-blog-page">
        <div className="sanus-blog-page-container">
            <div className="sanus-blog-page-grid">
              {loading ? (
                <>
                  {/* GRID SKELETON */}
                  <BlogCardSkeleton featured />
                  <BlogCardSkeleton featured />
                  <BlogCardSkeleton />
                  <BlogCardSkeleton />
                  <BlogCardSkeleton />
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
    </PageTransition>
  );
}