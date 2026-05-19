"use client";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ComposedChart,
} from "recharts";
import { gridProps, xAxisProps, yAxisProps, tooltipWrapperStyle } from "@/lib/chartDefaults";

const COLORS = {
  random: "rgba(0, 0, 0, 0.08)", // subtle ink
  frontier: "var(--ink)", // black line
  maxSharpe: "var(--accent)", // blue
  minVol: "var(--up)", // green
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={tooltipWrapperStyle}>
      <div style={{ fontWeight: 600, marginBottom: "4px" }}>{d.label || "Portfolio"}</div>
      <div>Return: <strong>{d.ret?.toFixed(2)}%</strong></div>
      <div>Volatility: <strong>{d.vol?.toFixed(2)}%</strong></div>
    </div>
  );
}

export default function EfficientFrontierChart({ data }) {
  if (!data) return null;

  const { efficient_frontier, random_portfolios, max_sharpe, min_volatility } = data;

  const randomPts = (random_portfolios?.returns || []).map((r, i) => ({
    vol: random_portfolios.volatilities[i],
    ret: r,
  }));

  const efPts = (efficient_frontier?.returns || []).map((r, i) => ({
    vol: efficient_frontier.volatilities[i],
    ret: r,
  })).sort((a, b) => a.vol - b.vol);

  const msPoint = max_sharpe ? [{ vol: max_sharpe.annual_volatility, ret: max_sharpe.annual_return, label: "Max Sharpe" }] : [];
  const mvPoint = min_volatility ? [{ vol: min_volatility.annual_volatility, ret: min_volatility.annual_return, label: "Min Volatility" }] : [];

  return (
    <ResponsiveContainer width="100%" height={340}>
      <ComposedChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
        <CartesianGrid {...gridProps} />
        <XAxis
          dataKey="vol" type="number" name="Volatility"
          label={{ value: "Annualised Volatility (%)", position: "bottom", offset: -5, style: { fill: "var(--ink-3)", fontSize: 11, fontFamily: "var(--font-inter), sans-serif", fontWeight: 500 } }}
          {...xAxisProps}
        />
        <YAxis
          dataKey="ret" type="number" name="Return"
          label={{ value: "Annualised Return (%)", angle: -90, position: "insideLeft", offset: 10, style: { fill: "var(--ink-3)", fontSize: 11, fontFamily: "var(--font-inter), sans-serif", fontWeight: 500 } }}
          {...yAxisProps}
        />
        <Tooltip content={<CustomTooltip />} />
        
        <Scatter name="Random" data={randomPts} fill={COLORS.random} shape="circle" r={2.5} legendType="none" />
        <Scatter name="Frontier" data={efPts} fill="none" stroke={COLORS.frontier} strokeWidth={2} line={{ strokeDasharray: "4 4" }} shape="circle" r={0} legendType="plainline" />
        <Scatter name="Max Sharpe" data={msPoint} fill={COLORS.maxSharpe} shape="circle" r={6} legendType="circle" />
        <Scatter name="Min Volatility" data={mvPoint} fill={COLORS.minVol} shape="circle" r={6} legendType="circle" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
