"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Skeleton from "@/components/Skeleton";
import { getSavedPortfolios, deleteSavedPortfolio } from "@/lib/api";
import "@/styles/portfolio.css";

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
      <main className="portfolio-page">
        <div className="portfolio-header">
          <h1 className="portfolio-title">My portfolios</h1>
          <p className="portfolio-subtitle">Portfolios saved from the optimizer</p>
        </div>

        <div className="portfolio-panel">
          {loading ? (
            <div style={{ padding: "20px" }}>
              <Skeleton height="32px" />
              <div style={{ marginTop: "12px" }}><Skeleton height="48px" /></div>
              <div style={{ marginTop: "12px" }}><Skeleton height="48px" /></div>
              <div style={{ marginTop: "12px" }}><Skeleton height="48px" /></div>
            </div>
          ) : error ? (
            <div className="portfolio-empty">
              <span className="portfolio-empty-text">
                Sign in to view your saved portfolios — <Link href="/login" className="portfolio-empty-link">Sign in</Link>
              </span>
            </div>
          ) : portfolios.length === 0 ? (
            <div className="portfolio-empty">
              <span className="portfolio-empty-text">
                No saved portfolios yet. <Link href="/optimize" className="portfolio-empty-link">Run an optimization</Link> to save one.
              </span>
            </div>
          ) : (
            <table className="portfolio-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Created</th>
                  <th>Assets</th>
                  <th>Return</th>
                  <th>Sharpe</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolios.map((p) => {
                  const maxChips = 4;
                  const visibleAssets = p.stocks.slice(0, maxChips);
                  const extraCount = p.stocks.length - maxChips;
                  const ret = p.results?.max_sharpe?.annual_return;
                  const sharpe = p.results?.max_sharpe?.sharpe_ratio;

                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td className="tabular var(--ink-2)">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td>
                        {visibleAssets.map(s => (
                          <span key={s} className="asset-chip">{s}</span>
                        ))}
                        {extraCount > 0 && <span className="asset-more">+{extraCount} more</span>}
                      </td>
                      <td className={`tabular ${ret >= 0 ? 'up' : 'down'}`} style={{ color: ret >= 0 ? "var(--up)" : "var(--down)" }}>
                        {ret ? `${ret > 0 ? '+' : ''}${ret}%` : '--'}
                      </td>
                      <td className="tabular">{sharpe ? sharpe : '--'}</td>
                      <td>
                        <button className="action-delete" onClick={() => handleDelete(p.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
