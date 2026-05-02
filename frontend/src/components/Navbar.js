"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/optimize", label: "Optimize" },
  { href: "/analyze", label: "Returns" },
  { href: "/correlations", label: "Correlations" },
  { href: "/portfolio", label: "My Portfolios" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("mpt-theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);

    const token = localStorage.getItem("mpt-token");
    const userData = localStorage.getItem("mpt-user");
    if (token && userData) {
      try { setUser(JSON.parse(userData)); } catch (e) { /* ignore */ }
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("mpt-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const handleLogout = () => {
    localStorage.removeItem("mpt-token");
    localStorage.removeItem("mpt-user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav className="navbar" id="main-navbar">
      <Link href="/" className="navbar-brand">⟐ MPT Optimizer</Link>

      <div className="navbar-links">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "active" : ""}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="navbar-right">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" id="theme-toggle-btn">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              {user.name}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <Link href="/login" className="btn btn-primary btn-sm">Sign In</Link>
        )}
      </div>
    </nav>
  );
}
