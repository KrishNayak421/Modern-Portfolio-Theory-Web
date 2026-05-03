import React from "react";
import "@/styles/pageshell.css";

export default function PageShell({ eyebrow, heading, headingItalic, sub, children }) {
  return (
    <div className="page-shell">
      <header className="page-header">
        {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
        <h1 className="page-heading">
          {heading}
          {headingItalic && <span className="page-heading-italic"> {headingItalic}</span>}
        </h1>
        {sub && <div className="page-sub">{sub}</div>}
      </header>
      <div className="page-content">
        {children}
      </div>
    </div>
  );
}
