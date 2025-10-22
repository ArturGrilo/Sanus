import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import "./Login.css";
import SanusVitaeLogo from "../images/Logo/SanusVitaeLogo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/admin";
    } catch (err) {
      alert("Erro: " + err.message);
    }
  }

  return (
    <div className="sanus-bo-auth-container">
      <form onSubmit={handleLogin} className="sanus-bo-form">
        <img
          src={SanusVitaeLogo}
          className="sanus-bo-logo"
          alt="Sanus Vitae logo"
        />
        <h2 className="sanus-bo-title">Área Administrativa</h2>
        <div className="sanus-bo-fields">
          <input
            type="email"
            placeholder="Email institucional"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Palavra-passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="sanus-bo-btn">Entrar</button>
        <p className="sanus-bo-footer-text">
          © {new Date().getFullYear()} Sanus Vitae · Acesso restrito
        </p>
      </form>
    </div>
  );
}