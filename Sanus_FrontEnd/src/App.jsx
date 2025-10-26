import { Routes, Route, Navigate } from "react-router-dom";

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

// Páginas do back office
import Login from "./admin/Login";
{/*import Dashboard from "./admin/Dashboard";
import BlogList from "./admin/BlogList";
import BlogForm from "./admin/BlogForm";
import FeedbackForm from "./admin/FeedbackForm";
import FeedbackList from "./admin/FeedbackList";
import RequireAuth from "./admin/RequireAuth";
import ServicesList from "./admin/ServiceList";
import ServiceForm from "./admin/ServiceForm";
import TagsList from "./admin/TagsList";
import TagForm from "./admin/TagForm";*/}

export default function App() {
  return (
    <Routes>
      {/* 🌐 Site principal */}
      <Route
        path="/"
        element={
          <>
            <Header />
            <Hero />
            <Services />
            <Mission />
            <Team />
            <Recrutamento />
            <Feedback />
            <Insurance />
            <Location />
            <BlogSection />  
            <Footer />
            <WhatsappButton />
          </>
        }
      />

      {/* 🔐 Back Office */}
      <Route path="/login" element={<Login />} />
      {/*<Route element={<RequireAuth />}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/blog" element={<BlogList />} />
        <Route path="/admin/blog/new" element={<BlogForm />} />
        <Route path="/admin/blog/edit/:id" element={<BlogForm />} />
        <Route path="/admin/feedback" element={<FeedbackList />} />
        <Route path="/admin/feedback/new" element={<FeedbackForm />} />
        <Route path="/admin/feedback/edit/:id" element={<FeedbackForm />} />
        <Route path="/admin/services" element={<ServicesList />} />
        <Route path="/admin/services/new" element={<ServiceForm />} />
        <Route path="/admin/services/edit/:id" element={<ServiceForm />} />
        <Route path="/admin/tags" element={<TagsList />} />
        <Route path="/admin/tags/new" element={<TagForm />} />
        <Route path="/admin/tags/edit/:id" element={<TagForm />} />
      </Route>*/}
      <Route path="/servicos/:id" element={<ServicoDetalhe />} />
      <Route path="/admin/*" element={<Login />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}