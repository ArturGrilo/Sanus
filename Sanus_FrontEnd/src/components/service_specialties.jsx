import ServiceCard from "./service_card";
import ServiceCardSkeleton from "./skeleton_service_card";
import "../styles/services.css";

export default function ServiceSpecialties({
  specialties = [],
  loading = false,
  title = "Especialidades",
  subtitle = "Áreas de intervenção",
  serviceSlug = "", // ✅ ex: "fisioterapia"
}) {
  const hasData = Array.isArray(specialties) && specialties.length > 0;

  const normalized = hasData
    ? specialties
        .filter(Boolean)
        .map((s, idx) => ({
          id: s.id || String(idx),
          image: s.image || s.imageUrl || "",
          subtitle: s.subtitle || "",
          title: s.title || "",
          text: s.small_description || s.smallDescription || "",
          ctaText: s.ctaText || "Saber mais",
          alt: s.alt || s.title || "Especialidade",
          specialtySlug: String(s.slug || "").trim(),
        }))
        .filter((x) => (x.title || x.subtitle || x.image || x.text) && x.specialtySlug)
    : [];

  return (
    <section className="sanus-services">
      <header className="sanus-services-title sanus-general-title">
        {subtitle ? <p className="sanus-services-text little">{subtitle}</p> : null}
        {title ? <h2>{title}</h2> : null}
      </header>

      <div className="sanus-services-container">
        {loading ? (
          <>
            <ServiceCardSkeleton />
            <ServiceCardSkeleton />
            <ServiceCardSkeleton />
          </>
        ) : normalized.length === 0 ? null : (
          normalized.map((sp) => (
            <ServiceCard
              key={sp.id}
              image={sp.image}
              subtitle={sp.subtitle}
              title={sp.title}
              text={sp.text}
              ctaText={sp.ctaText}
              // ✅ isto gera: /servicos/<serviceSlug>/<specialtySlug>
              slug={`${serviceSlug}/${sp.specialtySlug}`}
            />
          ))
        )}
      </div>
    </section>
  );
}
