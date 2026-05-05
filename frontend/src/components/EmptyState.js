import React from "react";
import "@/styles/emptystate.css";

export default function EmptyState({ message, linkText, linkHref, isError }) {
  return (
    <div className={`empty-state ${isError ? 'error' : ''}`}>
      <span className="empty-message">{message}</span>
      {linkText && linkHref && (
        <a href={linkHref} className="empty-link">{linkText}</a>
      )}
    </div>
  );
}
