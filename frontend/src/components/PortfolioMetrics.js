"use client";

export default function PortfolioMetrics({ data }) {
  if (!data) return null;

  const metrics = [
    { label: "Annual Return", value: `${data.annual_return}%`, color: data.annual_return >= 0 ? "var(--success)" : "var(--danger)" },
    { label: "Annual Volatility", value: `${data.annual_volatility}%`, color: "var(--accent-3)" },
    { label: "Sharpe Ratio", value: data.sharpe_ratio?.toFixed(2) ?? "—", color: "var(--accent-1)" },
    { label: "Sortino Ratio", value: data.sortino_ratio != null ? data.sortino_ratio.toFixed(2) : "—", color: "var(--accent-2)" },
  ];

  return (
    <div className="metrics-row fade-in">
      {metrics.map((m) => (
        <div key={m.label} className="metric-card">
          <div className="metric-label">{m.label}</div>
          <div className="metric-value" style={{
            background: m.color,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            {m.value}
          </div>
        </div>
      ))}
    </div>
  );
}
