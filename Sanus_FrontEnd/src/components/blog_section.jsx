import { useEffect, useState } from "react";
import BlogCard from "./blog_card";
import "../styles/blog_section.css";

export default function BlogSection() {
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
    <section className="sanus-blog">
      <header className="sanus-blog-title sanus-general-title">
        <p className="sanus-general-text sanus-services-text little">
          O nosso blog
        </p>
        <h2>Últimos artigos</h2>
      </header>

      <div className="sanus-blog-container">
        {loading ? (
          <p style={{ color: "var(--color-primary-dark)" }}>
            A carregar artigos...
          </p>
        ) : articles.length === 0 ? (
          <p style={{ color: "var(--color-primary-dark)" }}>
            Nenhum artigo disponível.
          </p>
        ) : (
          articles.map((article) => (
            <BlogCard
              key={article.id}
              image={article.imageUrl}
              title={article.title}
              author={article.author}
              content={article.content?.slice(0, 180)}
              id={article.id}
              // ✅ Agora a data vem como objeto Date
              date={article.updatedAt || article.createdAt}
              tags={article.tags || []}
            />
          ))
        )}
      </div>
    </section>
  );
}