import "../styles/recrutamento_profiles.css";

export default function ProfilesSection({
  title = "Perfis que procuramos",
  subtitle = "",
  items = [],
  color = "var(--color-primary-alt)",
  zdeIndex = 11
}) {
  return (
    <section className="sanus-profiles-section" style={{zIndex: zdeIndex}}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill={color} fillOpacity="1" d="M0,32L120,32C240,32,480,32,720,64C960,96,1200,160,1320,192L1440,224L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path></svg>
      <header className="sanus-about-us-cards-title sanus-general-title">
        {subtitle && <p className="sanus-about-us-cards-text little">{subtitle}</p>}
        {title && <h2>{title}</h2>}
      </header>
      <div className="sanus-profiles-container">
        {/* GRID */}
        <div className="sanus-profiles-grid">
          {items.map((item, index) => (
            <div
              key={item.title}
              className="sanus-profile-card"
              initial={{ opacity: 0, y: 40 }}
              transition={{
                ease: "easeOut",
                duration: 0.45,
                delay: index * 0.08,
              }}
              viewport={{ once: true }}
            >
              <div className="sanus-profile-icon">{item.icon}</div>
              <h3 className="sanus-profile-title">{item.title}</h3>
              <p className="sanus-profile-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <svg className="sanus-profiles-pattern" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="a" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#fff"/><path fill="none" stroke="#49caac" strokeLinecap="square" d="M20-5V5m0 30v10m20-30v10M0 15v10"/><path fill="none" stroke="var(--color-primary-dark)" strokeLinecap="square" d="M-5 40H5M-5 0H5m30 0h10M35 40h10M15 20h10"/></pattern></defs><rect width="800%" height="800%" fill="url(#a)"/></svg>
    </section>
  );
}