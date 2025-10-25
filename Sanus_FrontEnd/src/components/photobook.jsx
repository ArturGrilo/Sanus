import "../styles/photobook.css";
import PhotoBookCarousel from "./photobook_carousel";

export default function PhotoBook() {
  return (
    <section className="sanus-photobook">
      <div className="sanus-photobook-mask">
        <PhotoBookCarousel />
      </div>
    </section>
  );
}