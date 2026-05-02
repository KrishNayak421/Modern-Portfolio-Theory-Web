"""
Stock search and validation router.
"""
from fastapi import APIRouter, HTTPException

from app.models.schemas import StockSearchResponse, StockValidateRequest, StockValidateResponse
from app.services.data_fetcher import search_tickers, validate_tickers

router = APIRouter(prefix="/api/stocks", tags=["stocks"])


@router.get("/search")
async def search_stocks(q: str = ""):
    """Search for stock tickers."""
    if not q or len(q) < 1:
        return {"results": []}

    try:
        results = search_tickers(q)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/validate")
async def validate_stocks(req: StockValidateRequest):
    """Validate a list of tickers."""
    try:
        valid, invalid = validate_tickers(req.tickers)
        return StockValidateResponse(valid=valid, invalid=invalid)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
