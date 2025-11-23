import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import WhatsappButton from "./whatsapp_button";
import "../styles/blog_detail.css";
import BlogSection from "./blog_section";
import TextSkeleton from "./skeleton_text";
import PageTransition from "./page_transition";
import SanusHero from "./sanus_hero";

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
      <PageTransition>
        <Header />
        <SanusHero
          title="Artigo não encontrado"
          subtitle=""
          imageUrl="/Clinica/foto8.jpeg"
        /> 
        <section className="sanus-blog-detail-content">
          <div className="sanus-blog-detail-container">
            <TextSkeleton />
          </div>
        </section>
        <Footer />
      </PageTransition>
    );
  }

  if (!article) {
    return (
      <PageTransition>
        <Header />
        <SanusHero
          title="Artigo não encontrado"
          subtitle=""
          imageUrl="/Clinica/foto4.jpeg"
        /> 
        <section className="sanus-blog-detail-content">
          <div className="sanus-blog-detail-container">
            <button className="btn btn-secundary sanus-blog-details-back-button" onClick={() => navigate("/blog")}>Voltar</button>
          </div>
        </section>
        <BlogSection variant="detail" limit={3} />
        <WhatsappButton />
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Header />
      <SanusHero
        title={article.title}
        subtitle={`por ${article.author} · ${
          new Date(article.updatedAt || article.createdAt).toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        }`}
        imageUrl={article.imageUrl || "/Clinica/foto4.jpeg"}
        height = "480px"
        titleSize="2rem"
        subtitleSize="1.2rem"
      /> 
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
      <button className="btn btn-secundary sanus-blog-details-back-button" onClick={() => navigate("/blog")}>Voltar</button>
      <BlogSection variant="detail" excludeId={article.id} limit={3} />
      <WhatsappButton />
      <div className="sanus-about-us-footer">
        <Footer />
      </div>
    </PageTransition>
  );
}