"""
Portfolio optimization and saved portfolios router.
"""
from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
import numpy as np

from app.models.schemas import (
    OptimizeRequest, OptimizeResponse, PerformanceRequest, PerformanceResponse,
    SavePortfolioRequest, SavedPortfolioResponse
)
from app.services.data_fetcher import fetch_stock_data, fetch_benchmark
from app.services.optimizer import (
    portfolio_performance, calculate_full_optimization, sortino_ratio
)
from app.routers.auth import get_current_user
from app.models.database import get_db

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


@router.post("/optimize")
async def optimize_portfolio(req: OptimizeRequest):
    """Run full MPT optimization and return results."""
    try:
        # Fetch stock data
        daily_returns, mean_returns, cov_matrix = fetch_stock_data(
            req.stocks, req.start_date, req.end_date
        )

        # Fetch benchmark for MAR (Sortino calculation)
        try:
            benchmark_daily = fetch_benchmark(req.benchmark_ticker, req.start_date, req.end_date)
        except Exception:
            benchmark_daily = 0

        # Run optimization
        constraint_set = (req.weight_lower_bound, req.weight_upper_bound)
        results = calculate_full_optimization(
            mean_returns=mean_returns,
            cov_matrix=cov_matrix,
            daily_returns=daily_returns,
            risk_free_rate=req.risk_free_rate,
            constraint_set=constraint_set,
            num_portfolios=req.num_portfolios,
            benchmark_daily_return=benchmark_daily,
        )

        return results

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Optimization failed: {str(e)}")


@router.post("/performance")
async def evaluate_performance(req: PerformanceRequest):
    """Evaluate a user-defined portfolio."""
    try:
        daily_returns, mean_returns, cov_matrix = fetch_stock_data(
            req.stocks, req.start_date, req.end_date
        )

        weights = np.array(req.weights)
        if not np.isclose(weights.sum(), 1.0):
            raise HTTPException(status_code=400, detail="Weights must sum to 1.0")

        ret, vol = portfolio_performance(weights, mean_returns, cov_matrix)
        sharpe = ret / vol if vol != 0 else 0

        try:
            benchmark_daily = fetch_benchmark(req.benchmark_ticker, req.start_date, req.end_date)
        except Exception:
            benchmark_daily = 0

        sort_ratio = sortino_ratio(weights, daily_returns, benchmark_daily)

        return PerformanceResponse(
            annual_return=round(ret * 100, 2),
            annual_volatility=round(vol * 100, 2),
            sharpe_ratio=round(sharpe, 2),
            sortino_ratio=round(sort_ratio, 2) if not np.isnan(sort_ratio) else 0,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Performance calculation failed: {str(e)}")


@router.post("/save")
async def save_portfolio(req: SavePortfolioRequest, current_user: dict = Depends(get_current_user)):
    """Save optimization results to user's portfolio collection."""
    db = get_db()

    doc = {
        "user_id": ObjectId(current_user["id"]),
        "name": req.name,
        "stocks": req.stocks,
        "optimization_config": req.optimization_config,
        "results": req.results,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.saved_portfolios.insert_one(doc)

    return {"id": str(result.inserted_id), "message": "Portfolio saved successfully"}


@router.get("/saved")
async def list_saved_portfolios(current_user: dict = Depends(get_current_user)):
    """List all saved portfolios for the current user."""
    db = get_db()

    cursor = db.saved_portfolios.find(
        {"user_id": ObjectId(current_user["id"])}
    ).sort("created_at", -1)

    portfolios = []
    async for doc in cursor:
        portfolios.append({
            "id": str(doc["_id"]),
            "name": doc["name"],
            "stocks": doc["stocks"],
            "optimization_config": doc.get("optimization_config", {}),
            "results": doc.get("results", {}),
            "created_at": doc["created_at"].isoformat(),
        })

    return {"portfolios": portfolios}


@router.delete("/saved/{portfolio_id}")
async def delete_saved_portfolio(portfolio_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a saved portfolio."""
    db = get_db()

    result = await db.saved_portfolios.delete_one({
        "_id": ObjectId(portfolio_id),
        "user_id": ObjectId(current_user["id"]),
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    return {"message": "Portfolio deleted successfully"}
