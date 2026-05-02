"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FEATURES = [
  {
    icon: "📈",
    title: "Portfolio Optimizer",
    desc: "Find the optimal asset allocation using the efficient frontier. Maximize your Sharpe ratio or minimize volatility with configurable constraints.",
    href: "/optimize",
    color: "#6366f1",
  },
  {
    icon: "📊",
    title: "Returns Analysis",
    desc: "Compare annualized returns across your selected stocks with interactive bar charts and performance breakdowns.",
    href: "/analyze",
    color: "#8b5cf6",
  },
  {
    icon: "🔗",
    title: "Correlation Matrix",
    desc: "Visualize how your assets move together with an interactive heatmap. Find diversification opportunities at a glance.",
    href: "/correlations",
    color: "#06b6d4",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="hero">
        <h1 className="fade-in">
          Optimize Your Portfolio
          <br />
          with <span className="gradient-text">Modern Portfolio Theory</span>
        </h1>
        <p className="fade-in" style={{ animationDelay: "0.1s" }}>
          Build smarter portfolios backed by Nobel Prize-winning mathematics.
          Analyze risk, returns, and correlations — all in one place.
        </p>
        <div className="hero-actions fade-in" style={{ animationDelay: "0.2s" }}>
          <Link href="/optimize" className="btn btn-primary" id="cta-optimize">
            Start Optimizing →
          </Link>
          <Link href="/analyze" className="btn btn-secondary" id="cta-analyze">
            Analyze Returns
          </Link>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <Link key={f.title} href={f.href} style={{ textDecoration: "none" }}>
              <div className="glass-card feature-card fade-in" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
