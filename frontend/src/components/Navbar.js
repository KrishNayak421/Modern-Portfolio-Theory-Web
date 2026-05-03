"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/styles/navbar.css";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/optimize", label: "Optimize" },
  { href: "/analyze", label: "Returns" },
  { href: "/correlations", label: "Correlations" },
  { href: "/portfolio", label: "My portfolios" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("mpt-token");
    const userData = localStorage.getItem("mpt-user");
    if (token && userData) {
      try { setUser(JSON.parse(userData)); } catch (e) { /* ignore */ }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("mpt-token");
    localStorage.removeItem("mpt-user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-left">
        <Link href="/" className="brand-link">
          <span className="brand-wordmark">Portfolio</span>
          <sup className="brand-sup">MPT</sup>
        </Link>
      </div>

      <div className="navbar-center">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <span className="user-name">{user.name}</span>
            <button className="btn-ghost" onClick={handleLogout}>Sign out</button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-ghost">Sign in</Link>
            <Link href="/register" className="btn-solid">Get started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
