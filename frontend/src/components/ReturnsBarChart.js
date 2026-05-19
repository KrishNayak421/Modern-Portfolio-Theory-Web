"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { gridProps, xAxisProps, yAxisProps, tooltipWrapperStyle } from "@/lib/chartDefaults";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipWrapperStyle}>
      <div style={{ fontWeight: 600, marginBottom: "4px" }}>{d.stock}</div>
      <div>Annualised Return: <strong>{d.value.toFixed(2)}%</strong></div>
    </div>
  );
}

export default function ReturnsBarChart({ returns, stocks }) {
  if (!returns || !stocks) return null;

  const data = stocks.map((s) => ({
    stock: s.replace(".NS", ""),
    fullTicker: s,
    value: returns[s] ?? 0,
    color: (returns[s] ?? 0) >= 0 ? "var(--up)" : "var(--down)",
  }));

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis
            dataKey="stock"
            {...xAxisProps}
          />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            {...yAxisProps}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--page)" }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            <LabelList dataKey="value" position="top" formatter={(v) => `${v.toFixed(1)}%`}
              style={{ fill: "var(--ink-3)", fontSize: 11, fontFamily: "var(--font-inter), sans-serif", fontWeight: 500 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
