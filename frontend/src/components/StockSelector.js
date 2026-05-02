"use client";
import { useState, useRef, useEffect } from "react";

export default function StockSelector({ stocks, onStocksChange }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  // Popular tickers for quick-add
  const POPULAR = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA",
    "HDFCBANK.NS", "INFY.NS", "TCS.NS", "RELIANCE.NS",
  ];

  const addStock = (ticker) => {
    const t = ticker.toUpperCase().trim();
    if (t && !stocks.includes(t)) {
      onStocksChange([...stocks, t]);
    }
    setInput("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeStock = (ticker) => {
    onStocksChange(stocks.filter((s) => s !== ticker));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) addStock(input);
    }
  };

  useEffect(() => {
    if (input.length < 1) { setSuggestions([]); return; }
    const q = input.toUpperCase();
    const filtered = POPULAR.filter(
      (t) => t.includes(q) && !stocks.includes(t)
    ).slice(0, 6);
    setSuggestions(filtered);
  }, [input, stocks]);

  return (
    <div style={{ position: "relative" }}>
      <div className="input-group">
        <label>Select Stocks</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: stocks.length ? "0.5rem" : 0 }}>
          {stocks.map((s) => (
            <span key={s} className="chip">
              {s}
              <button className="chip-remove" onClick={() => removeStock(s)}>×</button>
            </span>
          ))}
        </div>
        <input
          ref={inputRef}
          type="text"
          className="input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a ticker and press Enter (e.g., AAPL, INFY.NS)"
          id="stock-search-input"
        />
      </div>

      {suggestions.length > 0 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          marginTop: "4px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-sm)",
          boxShadow: "var(--shadow-md)",
          zIndex: 50,
          overflow: "hidden",
        }}>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => addStock(s)}
              style={{
                display: "block",
                width: "100%",
                padding: "0.6rem 1rem",
                textAlign: "left",
                background: "none",
                border: "none",
                borderBottom: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-primary)",
                fontWeight: 600,
                fontSize: "0.88rem",
                cursor: "pointer",
                transition: "background var(--transition)",
              }}
              onMouseEnter={(e) => e.target.style.background = "var(--accent-glow)"}
              onMouseLeave={(e) => e.target.style.background = "none"}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {stocks.length === 0 && (
        <div style={{ marginTop: "0.75rem" }}>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Quick add:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
            {POPULAR.slice(0, 8).map((t) => (
              <button key={t} className="btn btn-ghost btn-sm" onClick={() => addStock(t)}
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}>
                + {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
