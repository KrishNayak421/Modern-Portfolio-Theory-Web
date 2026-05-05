"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import StockSelector from "@/components/StockSelector";
import EfficientFrontierChart from "@/components/EfficientFrontierChart";
import AllocationTable from "@/components/AllocationTable";
import PortfolioMetrics from "@/components/PortfolioMetrics";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import Skeleton from "@/components/Skeleton";
import { optimizePortfolio, savePortfolio } from "@/lib/api";
import "@/styles/optimize.css";

const BENCHMARKS = [
  { value: "^NSEI", label: "NIFTY 50" },
  { value: "^GSPC", label: "S&P 500" },
  { value: "^FTSE", label: "FTSE 100" },
  { value: "^GDAXI", label: "DAX" },
  { value: "^N225", label: "Nikkei 225" },
  { value: "^HSI", label: "Hang Seng" },
  { value: "^IXIC", label: "NASDAQ" },
];

export default function OptimizePage() {
  const [stocks, setStocks] = useState([]);
  const [config, setConfig] = useState({
    start_date: "2024-01-01",
    end_date: new Date().toISOString().split("T")[0],
    risk_free_rate: 0,
    weight_lower_bound: 0,
    weight_upper_bound: 1,
    num_portfolios: 10000,
    benchmark_ticker: "^NSEI",
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  const handleOptimize = async () => {
    if (stocks.length < 2) { setError("Please add at least 2 stocks"); return; }
    setError("");
    setResults(null);
    setLoading(true);
    try {
      const data = await optimizePortfolio({ ...config, stocks });
      setResults(data);
    } catch (e) {
      setError("Something went wrong — check your connection or try different tickers.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!results) return;
    try {
      await savePortfolio({
        name: `${stocks.join(", ")} — ${new Date().toLocaleDateString()}`,
        stocks,
        optimization_config: config,
        results,
      });
      setSaveMsg("Portfolio saved!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e) {
      setSaveMsg("Login required to save");
    }
  };

  const updateConfig = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

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
                <input type="date" className="param-input" value={config.start_date}
                  onChange={(e) => updateConfig("start_date", e.target.value)} />
                <input type="date" className="param-input" value={config.end_date}
                  onChange={(e) => updateConfig("end_date", e.target.value)} />
              </div>
            </div>

            <div className="param-group">
              <label className="param-label">Risk-free rate</label>
              <input type="number" className="param-input tabular" step="0.01" min="0" max="0.5"
                value={config.risk_free_rate} onChange={(e) => updateConfig("risk_free_rate", parseFloat(e.target.value) || 0)} />
            </div>

            <div className="param-group">
              <label className="param-label">Benchmark</label>
              <select className="param-input" value={config.benchmark_ticker}
                onChange={(e) => updateConfig("benchmark_ticker", e.target.value)}>
                {BENCHMARKS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            <div className="param-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label className="param-label">Weight bounds</label>
                <label className="param-label" style={{ textTransform: "none", color: "var(--ink)" }}>
                  {(config.weight_lower_bound * 100).toFixed(0)}% – {(config.weight_upper_bound * 100).toFixed(0)}%
                </label>
              </div>
              <input type="range" className="param-range" min="0" max="1" step="0.01"
                value={config.weight_upper_bound} onChange={(e) => updateConfig("weight_upper_bound", parseFloat(e.target.value))} />
            </div>

            <div className="param-group">
              <label className="param-label">Simulations</label>
              <input type="number" className="param-input tabular" min="500" max="50000" step="500"
                value={config.num_portfolios} onChange={(e) => updateConfig("num_portfolios", parseInt(e.target.value) || 10000)} />
            </div>

            <button 
              className={`param-btn ${loading ? 'loading' : ''}`} 
              onClick={handleOptimize} 
              disabled={loading || stocks.length < 2}
            >
              {loading ? "Optimizing…" : "Run optimization"}
            </button>
            {error && <div style={{ color: "var(--down)", fontSize: "12px", marginTop: "8px", fontWeight: 500, lineHeight: 1.4 }}>{error}</div>}
            
            {results && !loading && (
              <>
                <button className="btn-secondary-ghost" onClick={handleSave}>
                  Save results
                </button>
                {saveMsg && <div style={{ color: "var(--up)", fontSize: "12px", marginTop: "8px", textAlign: "center", fontWeight: 500 }}>{saveMsg}</div>}
              </>
            )}
          </div>
        </aside>

        <main className="optimize-main">
          <PageShell
            eyebrow={`Optimize · ${stocks.length} assets selected`}
            heading="Efficient frontier"
            headingItalic="& allocation"
            sub="10,000 simulated portfolios · Yahoo Finance data · max-Sharpe & min-volatility"
          >
            {loading ? (
              <>
                <div className="metrics-row">
                  <Skeleton height="100px" />
                  <Skeleton height="100px" />
                  <Skeleton height="100px" />
                  <Skeleton height="100px" />
                </div>
                <div className="chart-wrap">
                  <Skeleton height="340px" />
                </div>
                <div className="allocation-section">
                  <Skeleton height="160px" />
                  <Skeleton height="160px" />
                </div>
              </>
            ) : error && !results ? (
              <EmptyState isError={true} message="Something went wrong — check your connection or try different tickers." />
            ) : results ? (
              <>
                <div className="metrics-row">
                  <PortfolioMetrics data={results.max_sharpe ? {
                    annual_return: results.max_sharpe.annual_return,
                    annual_volatility: results.max_sharpe.annual_volatility,
                    sharpe_ratio: results.max_sharpe.sharpe_ratio,
                    sortino_ratio: results.sortino_ratio,
                  } : null} />
                </div>

                <div className="chart-wrap">
                  <div className="chart-header">Efficient frontier</div>
                  <EfficientFrontierChart data={results} />
                </div>

                <div className="allocation-section">
                  <AllocationTable maxSharpe={results.max_sharpe} minVol={results.min_volatility} />
                </div>
              </>
            ) : (
              <EmptyState message="Run optimization to see the efficient frontier." />
            )}
          </PageShell>
        </main>
      </div>
    </>
  );
}
