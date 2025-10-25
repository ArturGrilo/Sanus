import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const images = [
  "/Clinica/foto1.jpeg",
  "/Clinica/foto2.jpeg",
  "/Clinica/foto3.jpeg",
  "/Clinica/foto4.jpeg",
  "/Clinica/foto5.jpeg",
  "/Clinica/foto6.jpeg",
  "/Clinica/foto7.jpeg",
  "/Clinica/foto8.jpeg",
  "/Clinica/foto9.jpeg",
  "/Clinica/foto10.jpeg",
  "/Clinica/foto11.jpeg",
  "/Clinica/foto12.jpeg"
];

export default function PhotoBookCarousel() {
  return (
    <Swiper
      modules={[Autoplay]}
      slidesPerView="auto"
      spaceBetween={0}
      loop={true}
      speed={1000}
      autoplay={{
        delay: 0,
        disableOnInteraction: false,
      }}
      className="sanus-photobook-carousel"
    >
      {[...images, ...images].map((src, index) => (
        <SwiperSlide key={index} className="photobook-slide">
          <img src={src} alt={`clinica-${index}`} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}