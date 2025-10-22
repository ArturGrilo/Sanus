import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import BlogCard from "./blog_card";
import "../styles/blog_section.css";

export default function BlogSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 🔹 1. Carrega artigos do Firestore
        const q = query(collection(db, "blog"), orderBy("createdAt", "desc"));
        const blogSnap = await getDocs(q);
        const blogs = blogSnap.docs.map((doc) => {
          const data = doc.data();

          // ✅ Converte os campos Timestamp -> Date
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
          };
        });

        // 🔹 2. Carrega todas as tags
        const tagsSnap = await getDocs(collection(db, "tags"));
        const allTags = tagsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 🔹 3. Substitui IDs das tags pelos objetos completos
        const blogsWithTags = blogs.map((article) => {
          const fullTags = (article.tags || [])
            .map((tagId) => allTags.find((t) => t.id === tagId))
            .filter(Boolean);
          return { ...article, tags: fullTags };
        });

        // 🔹 4. Atualiza o estado
        setArticles(blogsWithTags);
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