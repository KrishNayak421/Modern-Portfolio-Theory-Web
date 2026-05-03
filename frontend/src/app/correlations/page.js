"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import StockSelector from "@/components/StockSelector";
import CorrelationHeatmap from "@/components/CorrelationHeatmap";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import Skeleton from "@/components/Skeleton";
import { getCorrelation } from "@/lib/api";
import "@/styles/optimize.css";

export default function CorrelationsPage() {
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
      const result = await getCorrelation({ stocks, start_date: startDate, end_date: endDate });
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
              {loading ? "Analyzing…" : "Analyze correlations"}
            </button>
            {error && <div style={{ color: "var(--down)", fontSize: "12px", marginTop: "8px", fontWeight: 500, lineHeight: 1.4 }}>{error}</div>}
          </div>
        </aside>

        <main className="optimize-main">
          <PageShell
            eyebrow={`Correlations · ${stocks.length} assets selected`}
            heading="Correlation matrix"
          >
            {loading ? (
              <div className="chart-wrap">
                <Skeleton height="500px" />
              </div>
            ) : error && !data ? (
              <EmptyState isError={true} message="Something went wrong — check your connection or try different tickers." />
            ) : data ? (
              <CorrelationHeatmap matrix={data.matrix} stocks={data.stocks} />
            ) : (
              <EmptyState message="Run analysis to see correlation matrix." />
            )}
          </PageShell>
        </main>
      </div>
    </>
  );
}
