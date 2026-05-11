"use client";
import { useState, useRef, useEffect } from "react";
import "@/styles/stockselector.css";


export default function StockSelector({ stocks, onStocksChange }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [stockInfo, setStockInfo] = useState({});
  const inputRef = useRef(null);

  const POPULAR = ["AAPL", "MSFT", "GOOGL", "NVDA", "SPY"];

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

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/stocks/search?q=${input}`);
        if (!res.ok) return;
        const data = await res.json();
        const filtered = data.results.filter(
          (t) => !stocks.includes(t.ticker)
        ).slice(0, 6);
        setSuggestions(filtered);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [input, stocks]);

  useEffect(() => {
    const stocksToFetch = stocks.filter(s => stockInfo[s] === undefined);
    if (stocksToFetch.length === 0) return;

    const fetchInfo = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/stocks/info?tickers=${stocksToFetch.join(",")}`);
        if (!res.ok) return;
        const data = await res.json();

        setStockInfo(prev => {
          const newInfo = { ...prev };
          stocksToFetch.forEach(s => {
            newInfo[s] = data.results[s] || null;
          });
          return newInfo;
        });
      } catch (err) {
        console.error("Error fetching stock info:", err);
      }
    };

    fetchInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocks]);

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
                key={s.ticker}
                onClick={() => addStock(s.ticker)}
                className="autosuggest-row"
              >
                <div className="autosuggest-ticker">{s.ticker}</div>
                <div className="autosuggest-name">{s.name}</div>
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
            const info = stockInfo[s];
            let data;
            if (info) {
              const sign = info.change >= 0 ? "+" : "";
              data = {
                name: info.name,
                price: `$${info.price.toFixed(2)}`,
                change: `${sign}${info.change.toFixed(2)}%`,
                isUp: info.isUp
              };
            } else if (info === null) {
              data = { name: "Company Name", price: "$100.00", change: "+0.00%", isUp: true };
            } else {
              data = { name: "Loading...", price: "...", change: "...", isUp: true };
            }

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
