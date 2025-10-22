import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import profile1 from '../images/Team/profile.png';
import profile2 from '../images/Team/profile2.png';
import profile3 from "../images/Team/profile.png";

const team = [
  {
    name: "Claudia Vilares",
    role: "CEO",
    img: profile1,
  },
  {
    name: "Lauren Hanson",
    role: "Fisioterapeuta",
    img: profile2,
  },
  {
    name: "Stephanie Nielsen",
    role: "Fisioterapeuta",
    img: profile3,
  },
  {
    name: "Katherine Stam",
    role: "Fisioterapeuta",
    img: profile1,
  },
  {
    name: "Lauren Hanson",
    role: "Fisioterapeuta",
    img: profile2,
  },
  {
    name: "Stephanie Nielsen",
    role: "Fisioterapeuta",
    img: profile3,
  }
];

export default function TeamCarousel() {
  return (
    <section className="sanus-team-carousel">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={40}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          320: { slidesPerView: 1.2, spaceBetween: 20 }, // telemóvel
          768: { slidesPerView: 2.2, spaceBetween: 30 }, // tablet
          1024: { slidesPerView: 3.5, spaceBetween: 40 }, // desktop
        }}
      >
        {team.map((member, index) => (
          <SwiperSlide key={index}>
            <div className="team-card">
              <img src={member.img} alt={member.name} className="team-img" />
              <h3 className="team-name">{member.name}</h3>
              <p className="team-role">{member.role}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}