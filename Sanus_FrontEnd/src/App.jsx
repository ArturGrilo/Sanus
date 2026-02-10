import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Páginas do site
import Header from "./components/header";
import Hero from "./components/hero";
import Services from "./components/services";
import Mission from "./components/mission";
import Team from "./components/team";
import Recrutamento from "./components/recrutamento";
import Feedback from "./components/feedback";
import Insurance from "./components/insurance";
import Location from "./components/location";
import Footer from "./components/footer";
import WhatsappButton from "./components/whatsapp_button";
import BlogSection from "./components/blog_section";
import ServicoDetalhe from "./components/service_details";
import BlogPage from "./components/blog_page";
import AboutPage from "./components/about_page";
import BlogDetail from "./components/blog_detail";
import ContactPage from "./components/contact_page";
import PrivacyPage from "./components/privacy_policy";
import CookiesPage from "./components/cookies_policy";
import ServiceSpecialtyDetail from "./components/service_specialties_details";
import ServicesPage from "./components/services_page";
import AgendarPage from "./components/book_page";
import CookieBanner from "./components/cookie_banner";

// Páginas do back office
import Login from "./admin/Login";
import Dashboard from "./admin/Dashboard";
import RequireAuth from "./admin/RequireAuth";
import BlogList from "./admin/BlogList";
import BlogForm from "./admin/BlogForm";
import FeedbackForm from "./admin/FeedbackForm";
import FeedbackList from "./admin/FeedbackList";
import PrivacyForm from "./admin/PrivacyForm";
import CookiesForm from "./admin/CookiesForm";
import UsageForm from "./admin/UsageForm";
import UsagePage from "./components/usage_policy";
import PageTransition from "./components/page_transition";
import RecrutamentoPage from "./components/recrutamento_page";
import ServicesList from "./admin/ServiceList";
import ServiceForm from "./admin/ServiceForm";
import TagsList from "./admin/TagsList";
import TagForm from "./admin/TagForm";
import FaqsPage from "./admin/FaqsPage";

export default function App() {
  const location = useLocation();

  const isAdminRoute =
    location.pathname.startsWith("/admin") || location.pathname === "/login";

  return (
    <AnimatePresence mode="wait">
      {!isAdminRoute && <CookieBanner /> && <WhatsappButton />}

      <Routes location={location} key={location.pathname}>
        {/* 🌐 Site principal */}
        <Route
          path="/"
          element={
            <PageTransition>
              <Header />
              <Hero />
              <Services />
              <Mission />
              <section className="sanus-about-us" style={{marginTop:"160px", marginBottom:"100px"}}>
                <div className="sanus-about-us-container">
                    <div className="feedback-comment-list" style={{width: "100%", justifyContent: "center"}}>
                        <h3>
                            <span className="feedback-comment">
                                Aqui, não tratamos apenas o corpo.
                            </span>
                            <span className="feedback-comment other-color">
                                Cuidamos da pessoa.
                            </span>
                        </h3>
                    </div>
                </div>
              </section>
              {/*<Team />*/}
              <Recrutamento />
              <Feedback />
              <Insurance />
              <Location />
              <BlogSection variant="home" limit={3} />
              <Footer />
            </PageTransition>
          }
        />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/sobre-nos" element={<AboutPage />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/contactos" element={<ContactPage />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPage />} />
        <Route path="/politica-de-cookies" element={<CookiesPage />} />
        <Route path="/termos-de-utilizacao" element={<UsagePage />} />
        <Route path="/recrutamento" element={<RecrutamentoPage />} />
        <Route path="/servicos" element={<ServicesPage />} />
        <Route path="/servicos/:id" element={<ServicoDetalhe />} />
        <Route path="/servicos/:serviceSlug/:specialtySlug" element={<ServiceSpecialtyDetail />} />
        <Route path="/agendar" element={<AgendarPage />} />

        {/* 🔐 Back Office */}
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/blog" element={<BlogList />} />
          <Route path="/admin/blog/new" element={<BlogForm />} />
          <Route path="/admin/blog/edit/:id" element={<BlogForm />} />
          <Route path="/admin/feedback" element={<FeedbackList />} />
          <Route path="/admin/feedback/new" element={<FeedbackForm />} />
          <Route path="/admin/feedback/edit/:id" element={<FeedbackForm />} />
          <Route path="/admin/privacy" element={<PrivacyForm />} />
          <Route path="/admin/cookies" element={<CookiesForm />} />
          <Route path="/admin/usage" element={<UsageForm />} />
          <Route path="/admin/services" element={<ServicesList />} />
          <Route path="/admin/services/new" element={<ServiceForm />} />
          <Route path="/admin/services/edit/:id" element={<ServiceForm />} />
          <Route path="/admin/tags" element={<TagsList />} />
          <Route path="/admin/tags/new" element={<TagForm />} />
          <Route path="/admin/tags/edit/:id" element={<TagForm />} />
          <Route path="/admin/faqs" element={<FaqsPage />} />
        </Route>

        <Route path="/admin/*" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}