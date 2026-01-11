// IconPicker.jsx
import { useMemo, useState } from "react";
import * as PhosphorIcons from "@phosphor-icons/react";

function toTitle(s) {
  return String(s || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim();
}

export default function IconPicker({
  value,
  onChange,
  placeholder = "Search icon…",
  size = 28,
  maxItems = 180,
}) {
  const [query, setQuery] = useState("");

  // ✅ Mais robusto: alguns ícones podem vir como "object" (forwardRef), não "function"
  const iconEntries = useMemo(() => {
    return Object.entries(PhosphorIcons).filter(([name, Comp]) => {
      const looksLikeIconName = /^[A-Z]/.test(name);
      const isRenderable = typeof Comp === "function" || typeof Comp === "object";
      return looksLikeIconName && isRenderable;
    });
  }, []);

  // ✅ Pesquisa melhor: procura no nome raw e no "nome com espaços"
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return iconEntries.slice(0, maxItems);

    return iconEntries
      .filter(([name]) => {
        const raw = name.toLowerCase();
        const spaced = toTitle(name).toLowerCase(); // ex: "Hand Palm"
        return raw.includes(q) || spaced.includes(q);
      })
      .slice(0, maxItems);
  }, [query, iconEntries, maxItems]);

  const SelectedIcon = value ? PhosphorIcons[value] : null;

  return (
    <div className="sv-iconpicker">
      <div className="sv-iconpicker-top">
        <div className="sv-iconpicker-search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
          />
        </div>

        <div className="sv-iconpicker-preview">
          <div className="sv-iconpicker-preview-box" aria-label="Selected icon preview">
            {SelectedIcon ? (
              <SelectedIcon size={32} weight="regular" />
            ) : (
              <span>—</span>
            )}
          </div>

          <div className="sv-iconpicker-preview-meta">
            <div className="sv-iconpicker-preview-name">{value || "No icon"}</div>
            <button
              type="button"
              className="btn btn-secundary"
              onClick={() => onChange("")}
              disabled={!value}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="sv-iconpicker-grid" role="listbox" aria-label="Icon list">
        {filtered.map(([name, IconComp]) => {
          const isSelected = name === value;

          return (
            <button
              key={name}
              type="button"
              className={`sv-iconpicker-item ${isSelected ? "selected" : ""}`}
              onClick={() => onChange(name)}
              title={toTitle(name)}
              aria-selected={isSelected}
            >
              <IconComp size={size} weight="regular" />
              <span className="sv-iconpicker-label">{toTitle(name)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
