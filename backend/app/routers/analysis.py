"""
Analysis router — correlation matrix and annualized returns.
"""
from fastapi import APIRouter, HTTPException

from app.models.schemas import AnalysisRequest, CorrelationResponse, ReturnsResponse
from app.services.data_fetcher import fetch_stock_data
from app.services.correlation import compute_correlation_matrix
from app.services.returns import compute_annualized_returns

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("/correlation")
async def get_correlation(req: AnalysisRequest):
    """Compute correlation matrix for selected stocks."""
    try:
        daily_returns, _, _ = fetch_stock_data(req.stocks, req.start_date, req.end_date)
        matrix, stocks = compute_correlation_matrix(daily_returns)
        return CorrelationResponse(matrix=matrix, stocks=stocks)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Correlation analysis failed: {str(e)}")


@router.post("/returns")
async def get_returns(req: AnalysisRequest):
    """Compute annualized returns for selected stocks."""
    try:
        daily_returns, _, _ = fetch_stock_data(req.stocks, req.start_date, req.end_date)
        returns, stocks = compute_annualized_returns(daily_returns)
        return ReturnsResponse(returns=returns, stocks=stocks)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Returns analysis failed: {str(e)}")
