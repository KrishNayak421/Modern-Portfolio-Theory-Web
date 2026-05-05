"use client";

export default function AllocationTable({ maxSharpe, minVol }) {
  if (!maxSharpe || !minVol) return null;

  return (
    <>
      <div className="analyze-table-wrap">
        <table className="analyze-table">
          <thead>
            <tr>
              <th>Stock</th>
              <th>Max Sharpe</th>
              <th>Min Volatility</th>
            </tr>
          </thead>
          <tbody>
            {maxSharpe.allocations.map((alloc, i) => (
              <tr key={alloc.stock}>
                <td style={{ fontWeight: 600 }}>{alloc.stock}</td>
                <td className="tabular">{alloc.weight.toFixed(2)}%</td>
                <td className="tabular">{minVol.allocations[i]?.weight.toFixed(2) ?? "—"}%</td>
              </tr>
            ))}
            <tr style={{ borderTop: "1px solid var(--ink)" }}>
              <td style={{ fontWeight: 600, color: "var(--ink-2)" }}>Ann. Return</td>
              <td className="tabular" style={{ color: "var(--up)" }}>{maxSharpe.annual_return}%</td>
              <td className="tabular" style={{ color: "var(--up)" }}>{minVol.annual_return}%</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600, color: "var(--ink-2)" }}>Ann. Volatility</td>
              <td className="tabular var(--ink)">{maxSharpe.annual_volatility}%</td>
              <td className="tabular var(--ink)">{minVol.annual_volatility}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
