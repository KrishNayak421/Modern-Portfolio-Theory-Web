"use client";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Line, ComposedChart,
} from "recharts";

const COLORS = {
  random: "rgba(99, 102, 241, 0.25)",
  frontier: "#8b5cf6",
  maxSharpe: "#ef4444",
  minVol: "#10b981",
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-color)",
      borderRadius: "var(--radius-sm)",
      padding: "0.6rem 0.9rem",
      fontSize: "0.82rem",
      boxShadow: "var(--shadow-md)",
    }}>
      <p style={{ fontWeight: 700 }}>{d.label || "Portfolio"}</p>
      <p>Return: <strong>{d.ret?.toFixed(2)}%</strong></p>
      <p>Volatility: <strong>{d.vol?.toFixed(2)}%</strong></p>
    </div>
  );
}

export default function EfficientFrontierChart({ data }) {
  if (!data) return null;

  const { efficient_frontier, random_portfolios, max_sharpe, min_volatility } = data;

  // Random portfolio points
  const randomPts = (random_portfolios?.returns || []).map((r, i) => ({
    vol: random_portfolios.volatilities[i],
    ret: r,
  }));

  // Efficient frontier line points
  const efPts = (efficient_frontier?.returns || []).map((r, i) => ({
    vol: efficient_frontier.volatilities[i],
    ret: r,
  })).sort((a, b) => a.vol - b.vol);

  // Optimal points
  const msPoint = max_sharpe ? [{ vol: max_sharpe.annual_volatility, ret: max_sharpe.annual_return, label: "Max Sharpe" }] : [];
  const mvPoint = min_volatility ? [{ vol: min_volatility.annual_volatility, ret: min_volatility.annual_return, label: "Min Volatility" }] : [];

  return (
    <div className="chart-container fade-in">
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
        Efficient Frontier
      </h3>
      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis
            dataKey="vol" type="number" name="Volatility"
            label={{ value: "Annualized Volatility (%)", position: "bottom", offset: 0, style: { fill: "var(--text-muted)", fontSize: 12 } }}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            stroke="var(--border-color)"
          />
          <YAxis
            dataKey="ret" type="number" name="Return"
            label={{ value: "Annualized Return (%)", angle: -90, position: "insideLeft", offset: 10, style: { fill: "var(--text-muted)", fontSize: 12 } }}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            stroke="var(--border-color)"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />

          {/* Random portfolios cloud */}
          <Scatter name="Random Portfolios" data={randomPts} fill={COLORS.random} shape="circle" r={2} legendType="circle" />

          {/* Efficient frontier line */}
          <Scatter name="Efficient Frontier" data={efPts} fill="none" stroke={COLORS.frontier} strokeWidth={2.5} line={{ strokeDasharray: "6 3" }} shape="circle" r={0} legendType="plainline" />

          {/* Max Sharpe */}
          <Scatter name="Max Sharpe" data={msPoint} fill={COLORS.maxSharpe} shape="star" r={8} legendType="star" />

          {/* Min Volatility */}
          <Scatter name="Min Volatility" data={mvPoint} fill={COLORS.minVol} shape="diamond" r={7} legendType="diamond" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
