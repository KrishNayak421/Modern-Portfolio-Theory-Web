"""
Pydantic schemas for request/response models.
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


# ─── Auth Schemas ────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime


# ─── Portfolio Schemas ───────────────────────────────────────
class OptimizeRequest(BaseModel):
    stocks: list[str] = Field(..., min_length=2, max_length=30)
    start_date: str = Field(..., description="ISO date YYYY-MM-DD")
    end_date: str = Field(..., description="ISO date YYYY-MM-DD")
    risk_free_rate: float = Field(default=0.0, ge=0.0, le=0.5)
    weight_lower_bound: float = Field(default=0.0, ge=0.0, le=1.0)
    weight_upper_bound: float = Field(default=1.0, ge=0.0, le=1.0)
    num_portfolios: int = Field(default=5000, ge=500, le=50000)
    benchmark_ticker: str = Field(default="^NSEI")


class PortfolioAllocation(BaseModel):
    stock: str
    weight: float


class OptimalPortfolio(BaseModel):
    allocations: list[PortfolioAllocation]
    annual_return: float
    annual_volatility: float
    sharpe_ratio: float


class OptimizeResponse(BaseModel):
    max_sharpe: OptimalPortfolio
    min_volatility: OptimalPortfolio
    sortino_ratio: float
    efficient_frontier: dict  # { "returns": [...], "volatilities": [...] }
    random_portfolios: dict   # { "returns": [...], "volatilities": [...] }


class PerformanceRequest(BaseModel):
    stocks: list[str]
    weights: list[float]
    start_date: str
    end_date: str
    risk_free_rate: float = 0.0
    benchmark_ticker: str = "^NSEI"


class PerformanceResponse(BaseModel):
    annual_return: float
    annual_volatility: float
    sharpe_ratio: float
    sortino_ratio: float


# ─── Analysis Schemas ────────────────────────────────────────
class AnalysisRequest(BaseModel):
    stocks: list[str] = Field(..., min_length=2)
    start_date: str
    end_date: str


class CorrelationResponse(BaseModel):
    matrix: dict[str, dict[str, float]]
    stocks: list[str]


class ReturnsResponse(BaseModel):
    returns: dict[str, float]
    stocks: list[str]


# ─── Stock Search ────────────────────────────────────────────
class StockInfo(BaseModel):
    ticker: str
    name: str
    exchange: str
    type: str


class StockSearchResponse(BaseModel):
    results: list[StockInfo]


class StockValidateRequest(BaseModel):
    tickers: list[str]


class StockValidateResponse(BaseModel):
    valid: list[str]
    invalid: list[str]


# ─── Saved Portfolio Schemas ─────────────────────────────────
class SavePortfolioRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    stocks: list[str]
    optimization_config: dict
    results: dict


class SavedPortfolioResponse(BaseModel):
    id: str
    name: str
    stocks: list[str]
    optimization_config: dict
    results: dict
    created_at: datetime
