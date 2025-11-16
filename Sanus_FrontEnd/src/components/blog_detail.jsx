import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import WhatsappButton from "./whatsapp_button";
import "../styles/blog_detail.css";
import BlogSection from "./blog_section";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`);
        if (!res.ok) throw new Error("Erro ao carregar artigo");
        const data = await res.json();
        setArticle(data);
      } catch (err) {
        console.error("Erro ao carregar artigo:", err);
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <section className="sanus-blog-detail-loading">
          <p>A carregar artigo...</p>
        </section>
        <Footer />
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Header />
        <section className="sanus-blog-detail-loading">
          <p>Artigo não encontrado.</p>
          <button onClick={() => navigate("/blog")}>← Voltar</button>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* HERO */}
      <section
        className="sanus-blog-detail-hero"
        style={{
          backgroundImage: `url(${article.imageUrl || "/Clinica/foto4.jpeg"})`,
        }}
      >
        <div className="sanus-blog-detail-hero-overlay">
          <h1>{article.title}</h1>
          <p>
            por {article.author} ·{" "}
            {new Date(article.updatedAt || article.createdAt).toLocaleDateString("pt-PT", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <svg
          className="sanus-blog-detail-wave"
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

      {/* CONTEÚDO */}
      <section className="sanus-blog-detail-content">
        <div className="sanus-blog-detail-container">
          <div className="sanus-blog-detail-tags">
            {article.tags?.map((tag) => (
              <span key={tag.id} style={{ backgroundColor: tag.color }}>
                {tag.name}
              </span>
            ))}
          </div>

          <article
            className="sanus-blog-detail-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </section>

      <BlogSection variant="detail" excludeId={article.id} limit={3} />
      <WhatsappButton />
      <div className="sanus-about-us-footer">
        <Footer />
      </div>
    </>
  );
}