import { useEffect, useState } from "react";
import BlogCard from "./blog_card";
import "../styles/blog_section.css";

export default function BlogSection({ variant = "home", excludeId = null, limit = null }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/blogs`);
        if (!res.ok) throw new Error("Erro ao carregar blogs");

        const data = await res.json();

        // Ordenar por data (mais recentes primeiro)
        const sorted = [...data].sort(
          (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );

        // Excluir o artigo atual (caso seja fornecido excludeId)
        const filtered = excludeId ? sorted.filter((a) => a.id !== excludeId) : sorted;

        // Aplicar limite de artigos
        const limited = limit ? filtered.slice(0, limit) : filtered;

        setArticles(limited);
      } catch (err) {
        console.error("Erro ao carregar blog:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [excludeId, limit]);

  // --- Define wording conforme variante ---
  const titles = {
    home: {
      subtitle: "O nosso blog",
      title: "Últimos artigos",
    },
    detail: {
      subtitle: "Conteúdos escolhidos para si",
      title: "Outros artigos",
    },
  };

  const { subtitle, title } = titles[variant] || titles.home;
  const rootClass = `sanus-blog sanus-blog--${variant}`;

  return (
    <section className={rootClass}>
      <header className="sanus-blog-title sanus-general-title">
        <p className="sanus-general-text sanus-services-text little">{subtitle}</p>
        <h2>{title}</h2>
      </header>

      <div className="sanus-blog-container">
        {loading ? (
          <p style={{ color: "var(--color-primary-dark)" }}>A carregar artigos...</p>
        ) : articles.length === 0 ? (
          <p style={{ color: "var(--color-primary-dark)" }}>Nenhum artigo disponível.</p>
        ) : (
          articles.map((article) => (
            <BlogCard
              key={article.id}
              image={article.imageUrl}
              title={article.title}
              author={article.author}
              content={article.content?.slice(0, 180)}
              id={article.id}
              date={article.updatedAt || article.createdAt}
              tags={article.tags || []}
            />
          ))
        )}
      </div>
    </section>
  );
}