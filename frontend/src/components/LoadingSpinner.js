"use client";

export default function LoadingSpinner({ text = "Crunching numbers..." }) {
  return (
    <div className="spinner-container">
      <div className="spinner" />
      <p className="spinner-text">{text}</p>
    </div>
  );
}
