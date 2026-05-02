"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StockSelector from "@/components/StockSelector";
import LoadingSpinner from "@/components/LoadingSpinner";
import CorrelationHeatmap from "@/components/CorrelationHeatmap";
import { getCorrelation } from "@/lib/api";

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
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-container">
        <h1 className="section-title fade-in">Correlation Analysis</h1>
        <p className="section-subtitle fade-in">Discover how your assets move together to find diversification opportunities.</p>

        <div className="glass-card fade-in" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <StockSelector stocks={stocks} onStocksChange={setStocks} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "1rem", alignItems: "end", marginTop: "1.25rem" }}>
            <div className="input-group">
              <label>Start Date</label>
              <input type="date" className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="input-group">
              <label>End Date</label>
              <input type="date" className="input-field" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading || stocks.length < 2}>
              {loading ? "Analyzing..." : "🔗 Analyze"}
            </button>
          </div>
          {error && <p style={{ color: "var(--danger)", marginTop: "0.75rem", fontSize: "0.85rem" }}>{error}</p>}
        </div>

        {loading && <LoadingSpinner text="Computing correlation matrix..." />}
        {data && <CorrelationHeatmap matrix={data.matrix} stocks={data.stocks} />}
      </main>
      <Footer />
    </>
  );
}
