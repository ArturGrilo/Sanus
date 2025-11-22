import { useEffect, useState } from "react";
import "../styles/privacy_policy.css"
import Header from "./header";
import Footer from "./footer";
import TextSkeleton from "./skeleton_text";

export default function CookiesPage() {
  const [content, setContent] = useState("<p>A carregar…</p>");
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    async function loadPolicy() {
      try {
        const res = await fetch(`${API}/cookies`);
        const data = await res.json();

        setContent(data.content || "<p></p>");
      } catch {
        setContent("<p>Não foi possível carregar a política neste momento.</p>");
      } finally {
        setLoading(false);
      }
    }
    loadPolicy();
  }, [API]);

  return (
    <div className="sanus-privacy-policy-page">
        <Header forceScrolled />
        <main className="sanus-policy-container" style={{ padding: "2rem 1rem", maxWidth: 900, margin: "0 auto" }}>
        {loading ? (
            <TextSkeleton />
        ) : (
            <div
            className="sanus-policy-content"
            dangerouslySetInnerHTML={{ __html: content }}
            style={{ lineHeight: 1.6, fontSize: "1.05rem" }}
            />
        )}
        </main>
        <Footer />
    </div>
  );
}