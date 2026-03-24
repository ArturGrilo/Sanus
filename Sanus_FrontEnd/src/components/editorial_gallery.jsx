import React from "react";
import "../styles/clinic.css";

export default function EditorialGallery({ items = [] }) {
  return (
    <div className="sanus-editorialGallery">
      {items.map((item, idx) => (
        <figure
          key={idx}
          className={`sanus-editorialGallery__item sanus-editorialGallery__item--${item.variant || "square"}`}
        >
          <img
            src={item.src}
            srcSet={item.srcSet}
            sizes="(max-width: 680px) 92vw, (max-width: 1100px) 46vw, 520px"
            alt={item.alt || ""}
            loading="lazy"
            decoding="async"
          />
          {item.caption ? <figcaption>{item.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  );
}