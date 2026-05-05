"use client";
import { useState, useRef, useEffect } from "react";
import "@/styles/stockselector.css";

// Dummy data for visual layout matching the prompt
const DUMMY_PRICES = {
  AAPL: { name: "Apple Inc.", price: "$173.50", change: "+1.24%", isUp: true },
  MSFT: { name: "Microsoft Corp.", price: "$338.11", change: "+0.82%", isUp: true },
  GOOGL: { name: "Alphabet Inc.", price: "$136.64", change: "-0.45%", isUp: false },
  NVDA: { name: "NVIDIA Corp.", price: "$460.18", change: "+2.11%", isUp: true },
  SPY: { name: "SPDR S&P 500", price: "$444.85", change: "+0.15%", isUp: true },
  "BRK.B": { name: "Berkshire Hathaway", price: "$362.10", change: "-0.21%", isUp: false },
};

export default function StockSelector({ stocks, onStocksChange }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  const POPULAR = ["AAPL", "MSFT", "GOOGL", "NVDA", "SPY", "BRK.B"];

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
    const allTickers = ["AAPL", "MSFT", "GOOGL", "NVDA", "SPY", "BRK.B", "AMZN", "META", "TSLA", "NFLX"];
    const filtered = allTickers.filter(
      (t) => t.includes(q) && !stocks.includes(t)
    ).slice(0, 6);
    setSuggestions(filtered);
  }, [input, stocks]);

  return (
    <>
      <div className="sidebar-top" style={{ position: "relative" }}>
        <div className="sidebar-label">Assets</div>
        <input
          ref={inputRef}
          type="text"
          className="sidebar-search-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search tickers..."
        />
        <div className="quick-add-wrap">
          {POPULAR.filter(t => !stocks.includes(t)).map((t) => (
            <button key={t} className="quick-add-chip" onClick={() => addStock(t)}>
              {t}
            </button>
          ))}
        </div>

        {suggestions.length > 0 && (
          <div className="autosuggest-panel">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => addStock(s)}
                className="autosuggest-row"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-list">
        {stocks.length === 0 ? (
          <div className="sidebar-empty">Add tickers above to begin</div>
        ) : (
          stocks.map((s) => {
            const data = DUMMY_PRICES[s] || { name: "Company Name", price: "$100.00", change: "+0.00%", isUp: true };
            return (
              <div key={s} className="stock-row">
                <div className="stock-left">
                  <span className="stock-ticker">{s}</span>
                  <span className="stock-name">{data.name}</span>
                </div>
                <div className="stock-right">
                  <span className="stock-price tabular">{data.price}</span>
                  <span className={`stock-change tabular ${data.isUp ? 'up' : 'down'}`}>
                    {data.change}
                  </span>
                </div>
                <button className="stock-remove" onClick={() => removeStock(s)}>×</button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
