"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StockSelector from "@/components/StockSelector";
import LoadingSpinner from "@/components/LoadingSpinner";
import ReturnsBarChart from "@/components/ReturnsBarChart";
import { getReturns } from "@/lib/api";

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
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-container">
        <h1 className="section-title fade-in">Returns Analysis</h1>
        <p className="section-subtitle fade-in">Compare annualized returns across your selected stocks.</p>

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
              {loading ? "Analyzing..." : "📊 Analyze"}
            </button>
          </div>
          {error && <p style={{ color: "var(--danger)", marginTop: "0.75rem", fontSize: "0.85rem" }}>{error}</p>}
        </div>

        {loading && <LoadingSpinner text="Fetching returns data..." />}

        {data && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <ReturnsBarChart returns={data.returns} stocks={data.stocks} />

            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Returns Summary</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Annualized Return</th>
                  </tr>
                </thead>
                <tbody>
                  {data.stocks.map((s) => (
                    <tr key={s}>
                      <td style={{ fontWeight: 600 }}>{s}</td>
                      <td style={{ color: data.returns[s] >= 0 ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>
                        {data.returns[s]?.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
