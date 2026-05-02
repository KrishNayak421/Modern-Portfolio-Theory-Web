"use client";

export default function AllocationTable({ maxSharpe, minVol }) {
  if (!maxSharpe || !minVol) return null;

  return (
    <div className="glass-card" style={{ padding: "1.5rem", overflow: "auto" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
        Optimal Allocations
      </h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Stock</th>
            <th>Max Sharpe (%)</th>
            <th>Min Volatility (%)</th>
          </tr>
        </thead>
        <tbody>
          {maxSharpe.allocations.map((alloc, i) => (
            <tr key={alloc.stock}>
              <td style={{ fontWeight: 600 }}>{alloc.stock}</td>
              <td>{alloc.weight.toFixed(2)}%</td>
              <td>{minVol.allocations[i]?.weight.toFixed(2) ?? "—"}%</td>
            </tr>
          ))}
          <tr style={{ borderTop: "2px solid var(--border-color)" }}>
            <td style={{ fontWeight: 700 }}>Annual Return</td>
            <td style={{ fontWeight: 700, color: "var(--success)" }}>{maxSharpe.annual_return}%</td>
            <td style={{ fontWeight: 700, color: "var(--success)" }}>{minVol.annual_return}%</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 700 }}>Annual Volatility</td>
            <td style={{ fontWeight: 700, color: "var(--accent-3)" }}>{maxSharpe.annual_volatility}%</td>
            <td style={{ fontWeight: 700, color: "var(--accent-3)" }}>{minVol.annual_volatility}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
