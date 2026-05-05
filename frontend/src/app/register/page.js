"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { registerUser } from "@/lib/api";
import "@/styles/auth.css";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerUser({ name, email, password });
      localStorage.setItem("mpt-token", data.access_token);
      localStorage.setItem("mpt-user", JSON.stringify(data.user));
      window.location.href = "/optimize";
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-panel">
          <div className="auth-mark">M</div>
          <h2 className="auth-title">Create an account</h2>
          <p className="auth-subtitle">Start optimizing your portfolio today</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label className="auth-label">Name</label>
              <input type="text" className="auth-input" value={name}
                onChange={(e) => setName(e.target.value)} placeholder="John Doe" required id="register-name" />
            </div>
            <div>
              <label className="auth-label">Email</label>
              <input type="email" className="auth-input" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required id="register-email" />
            </div>
            <div>
              <label className="auth-label">Password</label>
              <input type="password" className="auth-input" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required id="register-password" />
            </div>
            
            <button type="submit" className={`auth-btn ${loading ? 'loading' : ''}`} disabled={loading} id="register-submit">
              {loading ? "Creating account…" : "Create account"}
            </button>
            {error && <div className="auth-error">{error}</div>}
          </form>

          <p className="auth-footer">
            Already have an account? <Link href="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
