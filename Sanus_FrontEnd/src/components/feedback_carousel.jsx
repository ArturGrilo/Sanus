import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function FeedbackCarousel() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    async function loadFeedbacks() {
      const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setFeedbacks(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
    loadFeedbacks();
  }, []);

  if (feedbacks.length === 0) return null;

  return (
    <section className="sanus-feedback-carousel">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={40}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
      >
        {feedbacks.map((f) => (
          <SwiperSlide key={f.id}>
            <div className="feedback-card">
              <div className="feedback-sub-container">
                <div className="feedback-comment-list">
                  <h3>
                    <span className="feedback-comment">"{f.comment_initial}</span>
                    <span className="feedback-comment other-color">
                      {f.comment_other_color}
                    </span>
                    <span className="feedback-comment">{f.comment_final}"</span>
                  </h3>
                </div>
                <p className="feedback-name">
                  {f.name}
                  <span className="feedback-source">{f.source}</span>
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}