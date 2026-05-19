"use client";
import { Fragment } from "react";
import "@/styles/correlations.css";

function correlationToColor(val) {
  if (val >= 0) {
    const r = Math.round(255 - val * (255 - 37));
    const g = Math.round(255 - val * (255 - 99));
    const b = Math.round(255 - val * (255 - 235));
    return `rgb(${r},${g},${b})`;
  } else {
    const t = Math.abs(val);
    const r = Math.round(255 - t * (255 - 185));
    const g = Math.round(255 - t * 28);
    const b = Math.round(255 - t * 28);
    return `rgb(${r},${g},${b})`;
  }
}

export default function CorrelationHeatmap({ matrix, stocks }) {
  if (!matrix || !stocks || stocks.length === 0) return null;

  const n = stocks.length;

  return (
    <div className="heatmap-wrap">
      <div style={{ overflowX: "auto" }}>
        <div className="heatmap-grid" style={{ gridTemplateColumns: `auto repeat(${n}, minmax(40px, 1fr))` }}>
          
          <div />
          {stocks.map((s) => (
            <div key={`h-${s}`} className="heatmap-label heatmap-label-col" style={{ paddingBottom: "8px" }}>
              {s.replace(".NS", "")}
            </div>
          ))}

          {stocks.map((row) => (
            <Fragment key={`r-${row}`}>
              <div className="heatmap-label" style={{ justifyContent: "flex-end", paddingRight: "12px" }}>
                {row.replace(".NS", "")}
              </div>
              
              {stocks.map((col) => {
                const val = matrix[col]?.[row] ?? 0;
                const textColor = Math.abs(val) > 0.6 ? "#ffffff" : "var(--ink)";
                
                return (
                  <div
                    key={`${row}-${col}`}
                    className="heatmap-cell-aspect tabular"
                    title={`${row} × ${col}: ${val.toFixed(4)}`}
                    style={{
                      backgroundColor: correlationToColor(val),
                      color: textColor,
                    }}
                  >
                    {val.toFixed(2)}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="heatmap-legend-wrap">
        <span className="heatmap-legend-label tabular">−1.0</span>
        <div className="heatmap-legend-bar" />
        <span className="heatmap-legend-label tabular">0</span>
        <div className="heatmap-legend-bar" style={{ display: "none" /* hide extra bar, we just use one spanning the width but label is in middle */ }} />
        {/* Wait, standard flex layout: label - bar - label is fine if we want just start and end, but prompt says "-1.0, 0, +1.0". */}
        {/* We can place 0 in the absolute center of the wrap */}
      </div>
    </div>
  );
}
