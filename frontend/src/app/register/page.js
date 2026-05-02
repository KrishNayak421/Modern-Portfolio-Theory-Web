"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { registerUser } from "@/lib/api";

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
      <div className="auth-container">
        <div className="glass-card auth-card fade-in">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Start optimizing your portfolio today</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Name</label>
              <input type="text" className="input-field" value={name}
                onChange={(e) => setName(e.target.value)} placeholder="John Doe" required id="register-name" />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" className="input-field" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required id="register-email" />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" className="input-field" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required id="register-password" />
            </div>
            {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading} id="register-submit">
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
