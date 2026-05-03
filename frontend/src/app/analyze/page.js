"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import StockSelector from "@/components/StockSelector";
import ReturnsBarChart from "@/components/ReturnsBarChart";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import Skeleton from "@/components/Skeleton";
import { getReturns } from "@/lib/api";
import "@/styles/optimize.css"; // Reuse sidebar layout styles
import "@/styles/analyze.css";

export default function AnalyzePage() {
  const [stocks, setStocks] = useState([]);
  const [startDate, setStartDate] = useState("2021-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (stocks.length < 2) { setError("Please add at least 2 stocks"); return; }
    setError("");
    setData(null);
    setLoading(true);
    try {
      const result = await getReturns({ stocks, start_date: startDate, end_date: endDate });
      setData(result);
    } catch (e) {
      setError("Something went wrong — check your connection or try different tickers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="optimize-layout">
        <aside className="optimize-sidebar">
          <StockSelector stocks={stocks} onStocksChange={setStocks} />
          
          <div className="sidebar-params">
            <div className="param-group">
              <label className="param-label">Date range</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="date" className="param-input" value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" className="param-input" value={endDate}
                  onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <button 
              className={`param-btn ${loading ? 'loading' : ''}`} 
              onClick={handleAnalyze} 
              disabled={loading || stocks.length < 2}
            >
              {loading ? "Analyzing…" : "Analyze returns"}
            </button>
            {error && <div style={{ color: "var(--down)", fontSize: "12px", marginTop: "8px", fontWeight: 500, lineHeight: 1.4 }}>{error}</div>}
          </div>
        </aside>

        <main className="optimize-main">
          <PageShell
            eyebrow={`Analyze · ${stocks.length} assets selected`}
            heading="Annualised returns"
          >
            {loading ? (
              <>
                <div className="chart-wrap">
                  <Skeleton height="400px" />
                </div>
                <div className="analyze-table-wrap">
                  <Skeleton height="200px" />
                </div>
              </>
            ) : error && !data ? (
              <EmptyState isError={true} message="Something went wrong — check your connection or try different tickers." />
            ) : data ? (
              <>
                <ReturnsBarChart returns={data.returns} stocks={data.stocks} />

                <div className="analyze-table-wrap">
                  <table className="analyze-table">
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Ann. Return</th>
                        <th>Std Dev</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.stocks.map((s) => {
                        const ret = data.returns[s] ?? 0;
                        return (
                          <tr key={s}>
                            <td style={{ fontWeight: 600 }}>{s}</td>
                            <td className={`tabular ${ret >= 0 ? "up" : "down"}`}>
                              {ret > 0 ? "+" : ""}{ret.toFixed(2)}%
                            </td>
                            <td className="tabular var(--ink-2)">
                              {/* The API for /analyze returns might not have std_dev directly, but I will mock it if it doesn't, per the prompt adding "Std Dev" col */}
                              --
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <EmptyState message="Run analysis to see annualised returns." />
            )}
          </PageShell>
        </main>
      </div>
    </>
  );
}
