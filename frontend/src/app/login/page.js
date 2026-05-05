"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { loginUser } from "@/lib/api";
import "@/styles/auth.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
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
          <h2 className="auth-title">Sign in to your account</h2>
          <p className="auth-subtitle">Sign in to save and manage your portfolios</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label className="auth-label">Email</label>
              <input type="email" className="auth-input" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required id="login-email" />
            </div>
            <div>
              <label className="auth-label">Password</label>
              <input type="password" className="auth-input" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required id="login-password" />
            </div>
            
            <button type="submit" className={`auth-btn ${loading ? 'loading' : ''}`} disabled={loading} id="login-submit">
              {loading ? "Signing in…" : "Sign in"}
            </button>
            {error && <div className="auth-error">{error}</div>}
          </form>

          <p className="auth-footer">
            Don't have an account? <Link href="/register" className="auth-link">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
}
