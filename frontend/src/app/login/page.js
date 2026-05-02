"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { loginUser } from "@/lib/api";

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
      <div className="auth-container">
        <div className="glass-card auth-card fade-in">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to save and manage your portfolios</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Email</label>
              <input type="email" className="input-field" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required id="login-email" />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" className="input-field" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required id="login-password" />
            </div>
            {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading} id="login-submit">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link href="/register">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
}
