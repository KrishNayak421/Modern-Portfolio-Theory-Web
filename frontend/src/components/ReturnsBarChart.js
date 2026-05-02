"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";

const GRADIENT_COLORS = [
  "#6366f1", "#7c3aed", "#8b5cf6", "#a78bfa",
  "#06b6d4", "#14b8a6", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#3b82f6", "#6d28d9",
];

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
      <p style={{ fontWeight: 700 }}>{d.stock}</p>
      <p>Annualized Return: <strong>{d.value.toFixed(2)}%</strong></p>
    </div>
  );
}

export default function ReturnsBarChart({ returns, stocks }) {
  if (!returns || !stocks) return null;

  const data = stocks.map((s, i) => ({
    stock: s.replace(".NS", ""),
    fullTicker: s,
    value: returns[s] ?? 0,
    color: GRADIENT_COLORS[i % GRADIENT_COLORS.length],
  }));

  return (
    <div className="chart-container fade-in">
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
        Annualized Returns
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, bottom: 60, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis
            dataKey="stock"
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            stroke="var(--border-color)"
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            stroke="var(--border-color)"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            <LabelList dataKey="value" position="top" formatter={(v) => `${v.toFixed(1)}%`}
              style={{ fill: "var(--text-secondary)", fontSize: 10, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
