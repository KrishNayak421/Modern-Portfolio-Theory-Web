"""
Returns analysis service.
Refactored from legacy/returns.py
"""
import pandas as pd


def compute_annualized_returns(daily_returns: pd.DataFrame) -> dict:
    """
    Calculate annualized returns from daily returns.
    Returns a dict mapping stock ticker to annualized return (as percentage).
    """
    daily_mean = daily_returns.mean()
    annualized = daily_mean * 252

    result = {}
    for stock in annualized.index:
        result[str(stock)] = round(float(annualized[stock]) * 100, 2)

    stocks = [str(s) for s in annualized.index.tolist()]
    return result, stocks
