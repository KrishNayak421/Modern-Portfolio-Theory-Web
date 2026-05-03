"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import "@/styles/home.css";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="home-container">
        <div className="home-left">
          <div className="home-eyebrow">Modern Portfolio Theory</div>
          <h1 className="home-heading">
            <span className="heading-line-1">Build portfolios</span>
            <span className="heading-line-2">that actually</span>
            <span className="heading-line-3">outperform.</span>
          </h1>
          <p className="home-paragraph">
            Powered by Markowitz's Modern Portfolio Theory. Input your tickers, set your constraints, and get the mathematically optimal allocation in seconds.
          </p>
          <div className="home-cta">
            <Link href="/optimize" className="home-btn-primary">
              Start optimizing
            </Link>
            <Link href="/analyze" className="home-btn-secondary">
              Analyze returns
            </Link>
          </div>
        </div>

        <div className="home-right">
          <div className="data-panel">
            <div className="data-panel-top">
              <div className="data-panel-title-wrap">
                <svg className="data-panel-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 20V10M18 20V4M6 20v-4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="data-panel-title">Portfolio optimizer</span>
              </div>
              <span className="data-panel-value accent tabular">Sharpe 1.42</span>
            </div>
            <div className="data-panel-desc">Find the optimal mix of assets for max risk-adjusted returns.</div>
          </div>

          <div className="data-panel">
            <div className="data-panel-top">
              <div className="data-panel-title-wrap">
                <svg className="data-panel-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 17l6-6 4 4 8-8M17 7h4v4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="data-panel-title">Returns analysis</span>
              </div>
              <span className="data-panel-value up tabular">+18.6% ann.</span>
            </div>
            <div className="data-panel-desc">Track annualized performance metrics and volatility.</div>
          </div>

          <div className="data-panel">
            <div className="data-panel-top">
              <div className="data-panel-title-wrap">
                <svg className="data-panel-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="data-panel-title">Correlation matrix</span>
              </div>
              <span className="data-panel-value ink tabular">−0.12 → +0.94</span>
            </div>
            <div className="data-panel-desc">Uncover hidden risks with cross-asset correlation heatmaps.</div>
          </div>
        </div>
      </main>
    </>
  );
}
