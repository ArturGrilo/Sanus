function normalizeFaqs(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(Boolean)
    .map((x) => ({
      question: String(x && x.question ? x.question : "").trim(),
      answer: String(x && x.answer ? x.answer : "").trim(),
    }))
    .filter((x) => x.question.length > 0 || x.answer.length > 0);
}

function normalizeBenefits(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(Boolean)
    .map((b) => {
      const bulletsRaw = b && b.bullets ? b.bullets : null;
      const bullets = Array.isArray(bulletsRaw)
        ? bulletsRaw.map((t) => String(t || "").trim()).filter(Boolean)
        : [];
      return {
        title: String(b && b.title ? b.title : "").trim(),
        bullets,
      };
    })
    .filter((b) => b.title.length > 0 || b.bullets.length > 0);
}

function normalizeCtaSection(raw) {
  const obj = raw && typeof raw === "object" ? raw : {};
  const btnText = String(obj.btn_text || obj.btnText || "").trim();
  const ctaText = String(obj.cta_text || obj.ctaText || "").trim();
  return {
    btn_text: btnText,
    cta_text: ctaText,
  };
}

// ✅ NOVO: treatment_types com imagem
function normalizeTreatmentTypes(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(Boolean)
    .map((t, idx) => {
      const id = String(t?.id || "").trim() || String(idx);

      const orderNum = Number(t?.order);
      const order = Number.isFinite(orderNum) ? orderNum : idx + 1;

      const icon = String(t?.icon || "").trim();
      const title = String(t?.title || "").trim();
      const subtitle = String(t?.subtitle || "").trim();

      const imageUrl = String(t?.imageUrl || t?.image || "").trim();

      return {
        id,
        order,
        icon,
        title,
        subtitle,
        imageUrl,
      };
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .filter((x) => x.title.length > 0 || x.subtitle.length > 0 || x.icon.length > 0 || x.imageUrl.length > 0);
}

module.exports = { normalizeFaqs, normalizeBenefits, normalizeCtaSection, normalizeTreatmentTypes };