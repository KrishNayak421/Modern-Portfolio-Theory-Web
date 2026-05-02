"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getSavedPortfolios, deleteSavedPortfolio } from "@/lib/api";

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPortfolios = async () => {
    try {
      const data = await getSavedPortfolios();
      setPortfolios(data.portfolios || []);
    } catch (e) {
      setError("Please sign in to view saved portfolios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPortfolios(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this portfolio?")) return;
    try {
      await deleteSavedPortfolio(id);
      setPortfolios((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert("Failed to delete: " + e.message);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-container">
        <h1 className="section-title fade-in">My Portfolios</h1>
        <p className="section-subtitle fade-in">Your saved optimization results.</p>

        {loading && <LoadingSpinner text="Loading portfolios..." />}
        {error && (
          <div className="glass-card fade-in" style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}>{error}</p>
          </div>
        )}

        {!loading && !error && portfolios.length === 0 && (
          <div className="glass-card fade-in" style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📂</p>
            <p style={{ color: "var(--text-secondary)" }}>No saved portfolios yet. Run an optimization and save the results!</p>
          </div>
        )}

        <div className="saved-grid">
          {portfolios.map((p) => (
            <div key={p.id} className="glass-card saved-card fade-in">
              <h4>{p.name}</h4>
              <p className="saved-card-meta">
                Created {new Date(p.created_at).toLocaleDateString()}
              </p>
              <div className="saved-card-stocks">
                {p.stocks.map((s) => (
                  <span key={s} className="chip" style={{ fontSize: "0.72rem", padding: "0.2rem 0.6rem" }}>{s}</span>
                ))}
              </div>
              {p.results?.max_sharpe && (
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.82rem", marginBottom: "0.75rem" }}>
                  <span>Return: <strong style={{ color: "var(--success)" }}>{p.results.max_sharpe.annual_return}%</strong></span>
                  <span>Sharpe: <strong style={{ color: "var(--accent-1)" }}>{p.results.max_sharpe.sharpe_ratio}</strong></span>
                </div>
              )}
              <div className="saved-card-actions">
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
