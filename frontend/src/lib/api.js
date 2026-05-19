export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === "production" 
    ? "https://incredible-warmth-production-151d.up.railway.app" 
    : "http://localhost:8000");

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { "Content-Type": "application/json", ...options.headers };

  // Attach JWT token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mpt-token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function optimizePortfolio(params) {
  return request("/api/portfolio/optimize", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function evaluatePerformance(params) {
  return request("/api/portfolio/performance", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getCorrelation(params) {
  return request("/api/analysis/correlation", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getReturns(params) {
  return request("/api/analysis/returns", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function searchStocks(query) {
  return request(`/api/stocks/search?q=${encodeURIComponent(query)}`);
}

export async function registerUser(data) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCurrentUser() {
  return request("/api/auth/me");
}

export async function savePortfolio(data) {
  return request("/api/portfolio/save", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getSavedPortfolios() {
  return request("/api/portfolio/saved");
}

export async function deleteSavedPortfolio(id) {
  return request(`/api/portfolio/saved/${id}`, { method: "DELETE" });
}
