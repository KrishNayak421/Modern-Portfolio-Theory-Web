"use client";

export default function CorrelationHeatmap({ matrix, stocks }) {
  if (!matrix || !stocks || stocks.length === 0) return null;

  const n = stocks.length;

  const getColor = (val) => {
    // Diverging color scale: red (-1) → white (0) → blue (+1)
    const clamped = Math.max(-1, Math.min(1, val));
    if (clamped >= 0) {
      const intensity = Math.round(clamped * 200);
      return `rgb(${100 - intensity / 3}, ${102 + intensity / 3}, ${241})`;
    } else {
      const intensity = Math.round(Math.abs(clamped) * 200);
      return `rgb(${239}, ${68 + intensity / 2}, ${68 + intensity / 2})`;
    }
  };

  const getTextColor = (val) => {
    return Math.abs(val) > 0.6 ? "#fff" : "var(--text-primary)";
  };

  return (
    <div className="chart-container fade-in">
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
        Correlation Matrix
      </h3>
      <div style={{ overflowX: "auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `80px repeat(${n}, 1fr)`,
          gap: "2px",
          minWidth: `${n * 60 + 80}px`,
        }}>
          {/* Top-left empty cell */}
          <div />
          {/* Column headers */}
          {stocks.map((s) => (
            <div key={`h-${s}`} className="heatmap-label" title={s}>{s.replace(".NS", "")}</div>
          ))}

          {/* Rows */}
          {stocks.map((row) => (
            <>
              <div key={`r-${row}`} className="heatmap-label" style={{ textAlign: "right", paddingRight: "0.5rem" }} title={row}>
                {row.replace(".NS", "")}
              </div>
              {stocks.map((col) => {
                const val = matrix[col]?.[row] ?? 0;
                return (
                  <div
                    key={`${row}-${col}`}
                    className="heatmap-cell"
                    title={`${row} × ${col}: ${val.toFixed(4)}`}
                    style={{
                      background: getColor(val),
                      color: getTextColor(val),
                    }}
                  >
                    {val.toFixed(2)}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Color legend */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "1rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
        <span>-1.0 (Negative)</span>
        <div style={{
          width: "200px", height: "12px", borderRadius: "6px",
          background: "linear-gradient(90deg, rgb(239, 68, 68), var(--bg-card), rgb(100, 102, 241))",
        }} />
        <span>+1.0 (Positive)</span>
      </div>
    </div>
  );
}
