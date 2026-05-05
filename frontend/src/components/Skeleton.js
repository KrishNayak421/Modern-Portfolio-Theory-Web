import React from "react";
import "@/styles/skeleton.css";

export default function Skeleton({ width = "100%", height = "100%", borderRadius = "var(--radius-md)" }) {
  return (
    <div 
      className="skeleton-shimmer" 
      style={{ width, height, borderRadius }} 
    />
  );
}
