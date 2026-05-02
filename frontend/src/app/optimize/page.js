"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StockSelector from "@/components/StockSelector";
import LoadingSpinner from "@/components/LoadingSpinner";
import EfficientFrontierChart from "@/components/EfficientFrontierChart";
import AllocationTable from "@/components/AllocationTable";
import PortfolioMetrics from "@/components/PortfolioMetrics";
import { optimizePortfolio, savePortfolio } from "@/lib/api";

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
    num_portfolios: 5000,
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
      setError(e.message);
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
      <main className="page-container">
        <h1 className="section-title fade-in">Portfolio Optimizer</h1>
        <p className="section-subtitle fade-in">Configure your universe, set constraints, and find optimal allocations.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }} className="fade-in">
          {/* Left: Stock Selector */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <StockSelector stocks={stocks} onStocksChange={setStocks} />
          </div>

          {/* Right: Config */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Configuration</h3>
            <div className="config-grid">
              <div className="input-group">
                <label>Start Date</label>
                <input type="date" className="input-field" value={config.start_date}
                  onChange={(e) => updateConfig("start_date", e.target.value)} />
              </div>
              <div className="input-group">
                <label>End Date</label>
                <input type="date" className="input-field" value={config.end_date}
                  onChange={(e) => updateConfig("end_date", e.target.value)} />
              </div>
              <div className="input-group">
                <label>Risk-Free Rate</label>
                <input type="number" className="input-field" step="0.01" min="0" max="0.5"
                  value={config.risk_free_rate} onChange={(e) => updateConfig("risk_free_rate", parseFloat(e.target.value) || 0)} />
              </div>
              <div className="input-group">
                <label>Benchmark</label>
                <select className="input-field" value={config.benchmark_ticker}
                  onChange={(e) => updateConfig("benchmark_ticker", e.target.value)}>
                  {BENCHMARKS.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Min Weight ({(config.weight_lower_bound * 100).toFixed(0)}%)</label>
                <input type="range" className="input-field" min="0" max="0.5" step="0.01"
                  value={config.weight_lower_bound} onChange={(e) => updateConfig("weight_lower_bound", parseFloat(e.target.value))}
                  style={{ padding: "0.4rem" }} />
              </div>
              <div className="input-group">
                <label>Max Weight ({(config.weight_upper_bound * 100).toFixed(0)}%)</label>
                <input type="range" className="input-field" min="0.1" max="1" step="0.01"
                  value={config.weight_upper_bound} onChange={(e) => updateConfig("weight_upper_bound", parseFloat(e.target.value))}
                  style={{ padding: "0.4rem" }} />
              </div>
              <div className="input-group">
                <label>Random Portfolios</label>
                <input type="number" className="input-field" min="500" max="50000" step="500"
                  value={config.num_portfolios} onChange={(e) => updateConfig("num_portfolios", parseInt(e.target.value) || 5000)} />
              </div>
            </div>
          </div>
        </div>

        {/* Action */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", alignItems: "center" }}>
          <button className="btn btn-primary" onClick={handleOptimize} disabled={loading || stocks.length < 2} id="optimize-btn">
            {loading ? "Optimizing..." : "🚀 Run Optimization"}
          </button>
          {results && (
            <button className="btn btn-secondary" onClick={handleSave}>
              💾 Save Results
            </button>
          )}
          {saveMsg && <span style={{ fontSize: "0.85rem", color: "var(--success)", fontWeight: 600 }}>{saveMsg}</span>}
          {error && <span style={{ fontSize: "0.85rem", color: "var(--danger)", fontWeight: 600 }}>{error}</span>}
        </div>

        {loading && <LoadingSpinner text="Fetching data & running optimization..." />}

        {results && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <PortfolioMetrics data={results.max_sharpe ? {
              annual_return: results.max_sharpe.annual_return,
              annual_volatility: results.max_sharpe.annual_volatility,
              sharpe_ratio: results.max_sharpe.sharpe_ratio,
              sortino_ratio: results.sortino_ratio,
            } : null} />

            <EfficientFrontierChart data={results} />

            <AllocationTable maxSharpe={results.max_sharpe} minVol={results.min_volatility} />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
