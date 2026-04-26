import Header from "./header";
import Footer from "./footer";
import "../styles/blog_page.css";
import { useEffect, useState } from "react";
import BlogCard from "./blog_card";
import BlogCardSkeleton from "./skeleton_blog_card";
import SanusHero from "./sanus_hero";
import PageTransition from "./page_transition";
import { motion, useReducedMotion } from "framer-motion";
import {staggerSoft, revealSoft, viewportOnce} from "../animations/motionPresets";

export default function BlogPage() {
  const shouldReduceMotion = useReducedMotion();
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
            <motion.div
              className="sanus-blog-page-grid"
              variants={shouldReduceMotion ? undefined : staggerSoft}
              initial={shouldReduceMotion ? false : "hidden"}
              whileInView={shouldReduceMotion ? undefined : "visible"}
              viewport={viewportOnce}
            >
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
                  <motion.div
                    key={article.id}
                    className={`sanus-post ${index < 2 ? "featured" : ""}`}
                    variants={shouldReduceMotion ? undefined : revealSoft}
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
                  </motion.div>
                ))
              )}
            </motion.div>
        </div>
      </section>
      <div className="sanus-about-us-footer">
        <Footer />
      </div>
    </PageTransition>
  );
}