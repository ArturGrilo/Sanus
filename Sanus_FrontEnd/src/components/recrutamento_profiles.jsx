import * as Phosphor from "@phosphor-icons/react";
import "../styles/recrutamento_profiles.css";

/**
 * Converte inputs tipo:
 * - "hand-palm" / "hand_palm" / "hand palm" -> "HandPalm"
 * - "HandPalm" -> "HandPalm" (mantém)
 */
function toPhosphorComponentName(raw) {
  const str = String(raw || "").trim();
  if (!str) return "";

  // Se já vier em PascalCase (ex: HandPalm), devolve como está
  if (/^[A-Z][A-Za-z0-9]*$/.test(str)) return str;

  // Caso contrário, converte para PascalCase
  return str
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function isRenderablePhosphorComponent(Comp) {
  // ✅ Phosphor icons podem vir como function ou object (forwardRef)
  return typeof Comp === "function" || typeof Comp === "object";
}

function renderIconFromItem(item, fallback = "✓") {
  // 1) Compat: se vier um ReactNode (caso antigo), usa como está
  if (item?.icon !== undefined && item?.icon !== null && item?.icon !== "") {
    return item.icon;
  }

  // 2) Canonical name do backoffice (IconPicker): "HandPalm"
  //    (mas também aceitamos outros nomes por compat)
  const raw =
    item?.iconName ||
    item?.icon_key ||
    item?.phosphor ||
    item?.phosphorName ||
    item?.icon; // ✅ importante: se usares "icon" como string

  const compName = toPhosphorComponentName(raw);
  const IconComponent = compName ? Phosphor?.[compName] : null;

  if (IconComponent && isRenderablePhosphorComponent(IconComponent)) {
    return <IconComponent size={22} weight="regular" aria-hidden="true" />;
  }

  // 3) fallback
  return <span>{fallback}</span>;
}

export default function ProfilesSection({
  title = "Perfis que procuramos",
  subtitle = "",
  items = [],
  color = "var(--color-primary-alt)",
  zdeIndex = 11,
  showTopSvg = true,
  iconFallback = "✓",
}) {
  return (
    <section
      className="sanus-profiles-section"
      style={{
        zIndex: zdeIndex,
        overflow: showTopSvg ? "hidden" : "visible",
      }}
    >
      {showTopSvg && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill={color}
            fillOpacity="1"
            d="M0,32L120,32C240,32,480,32,720,64C960,96,1200,160,1320,192L1440,224L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"
          />
        </svg>
      )}

      <header className="sanus-about-us-cards-title sanus-general-title">
        {subtitle && <p className="sanus-about-us-cards-text little">{subtitle}</p>}
        {title && <h2>{title}</h2>}
      </header>

      <div className="sanus-profiles-container">
        <div className="sanus-profiles-grid">
          {items.map((item, index) => {
            const bulletsRaw = item?.steps ?? item?.bullets;
            const bullets = Array.isArray(bulletsRaw)
              ? bulletsRaw.map((x) => String(x || "").trim()).filter(Boolean)
              : [];

            const hasBullets = bullets.length > 0;
            const hasDesc = String(item?.desc || "").trim().length > 0;

            const iconNode = renderIconFromItem(item, iconFallback);

            return (
              <div
                key={item.id || item.title || index}
                className="sanus-profile-card"
                initial={{ opacity: 0, y: 40 }}
                transition={{
                  ease: "easeOut",
                  duration: 0.45,
                  delay: index * 0.08,
                }}
                viewport={{ once: true }}
              >
                <div className="sanus-profile-icon">{iconNode}</div>

                <h3 className="sanus-profile-title">{item.title}</h3>

                {hasBullets ? (
                  <div className="sanus-profile-body">
                    {hasDesc && <p className="sanus-profile-desc">{item.desc}</p>}
                    <ul className="sanus-profile-bullets">
                      {bullets.map((b, i) => (
                        <li key={`${item.id || item.title || index}-b-${i}`}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="sanus-profile-desc">{item.desc}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <svg className="sanus-profiles-pattern" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="a"
            width="40"
            height="40"
            patternTransform="scale(2)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="100%" height="100%" fill="#fff" />
            <path
              fill="none"
              stroke="#49caac"
              strokeLinecap="square"
              d="M20-5V5m0 30v10m20-30v10M0 15v10"
            />
            <path
              fill="none"
              stroke="var(--color-primary-dark)"
              strokeLinecap="square"
              d="M-5 40H5M-5 0H5m30 0h10M35 40h10M15 20h10"
            />
          </pattern>
        </defs>
        <rect width="800%" height="800%" fill="url(#a)" />
      </svg>
    </section>
  );
}
