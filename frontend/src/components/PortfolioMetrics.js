"use client";

export default function PortfolioMetrics({ data }) {
  if (!data) return null;

  const metrics = [
    { label: "Ann. Return", value: `${data.annual_return > 0 ? '+' : ''}${data.annual_return}%`, color: data.annual_return >= 0 ? "var(--up)" : "var(--down)" },
    { label: "Ann. Volatility", value: `${data.annual_volatility}%`, color: "var(--ink)" },
    { label: "Sharpe Ratio", value: data.sharpe_ratio?.toFixed(2) ?? "—", color: "var(--ink)" },
    { label: "Sortino Ratio", value: data.sortino_ratio != null ? data.sortino_ratio.toFixed(2) : "—", color: "var(--ink)" },
  ];

  return (
    <>
      {metrics.map((m) => (
        <div key={m.label} style={{
          padding: "16px 20px",
          background: "var(--surface)",
          border: "1px solid var(--rule)",
          borderRadius: "var(--radius-md)"
        }}>
          <div style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            color: "var(--ink-3)",
            marginBottom: "8px"
          }}>
            {m.label}
          </div>
          <div className="tabular" style={{
            fontSize: "20px",
            color: m.color,
            fontWeight: 400,
            fontFamily: "var(--font-instrument), serif"
          }}>
            {m.value}
          </div>
        </div>
      ))}
    </>
  );
}
