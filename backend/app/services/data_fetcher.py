"""
Yahoo Finance data fetching service.
"""
import yfinance as yf
import pandas as pd
import datetime as dt


def fetch_stock_data(tickers: list[str], start: str, end: str):
    """
    Download historical closing prices and compute daily returns,
    mean returns, and covariance matrix.
    
    Returns:
        tuple: (daily_returns, mean_returns, cov_matrix)
    """
    start_date = dt.datetime.strptime(start, "%Y-%m-%d")
    end_date = dt.datetime.strptime(end, "%Y-%m-%d")

    stock_data = yf.download(tickers, start=start_date, end=end_date, auto_adjust=True)['Close']

    # Handle single-stock edge case (yf returns Series not DataFrame)
    if isinstance(stock_data, pd.Series):
        stock_data = stock_data.to_frame(name=tickers[0])

    daily_returns = stock_data.pct_change(fill_method=None).dropna()
    
    if daily_returns.empty:
        raise ValueError("Could not fetch sufficient data. Some tickers may be invalid (e.g., use 'BRK-B' instead of 'BRK.B') or the date range is too narrow.")
        
    mean_returns = daily_returns.mean()
    cov_matrix = daily_returns.cov()

    return daily_returns, mean_returns, cov_matrix


def fetch_benchmark(ticker: str, start: str, end: str):
    """
    Fetch benchmark data and return the average daily return (scalar).
    Used as MAR for Sortino ratio.
    """
    start_date = dt.datetime.strptime(start, "%Y-%m-%d")
    end_date = dt.datetime.strptime(end, "%Y-%m-%d")

    data = yf.download(ticker, start=start_date, end=end_date, auto_adjust=True)['Close']
    daily_returns = data.pct_change().dropna()

    # Force scalar
    avg_daily = daily_returns.mean()
    if hasattr(avg_daily, 'item'):
        avg_daily = avg_daily.item()
    elif hasattr(avg_daily, 'squeeze'):
        avg_daily = float(avg_daily.squeeze())

    return float(avg_daily)


def search_tickers(query: str):
    """
    Search for stock tickers using yfinance.
    Returns a list of dicts with ticker info.
    """
    results = []
    try:
        ticker = yf.Ticker(query.upper())
        info = ticker.info
        if info and info.get('symbol'):
            results.append({
                "ticker": info.get('symbol', query.upper()),
                "name": info.get('longName', info.get('shortName', 'Unknown')),
                "exchange": info.get('exchange', 'Unknown'),
                "type": info.get('quoteType', 'EQUITY'),
            })
    except Exception:
        pass

    # Try search as well
    try:
        search_results = yf.Tickers(query.upper())
        # yfinance doesn't have a great search API, so we fall back to ticker info
    except Exception:
        pass

    return results


def validate_tickers(tickers: list[str]):
    """
    Validate that a list of tickers have data on Yahoo Finance.
    Returns (valid, invalid) tuple of lists.
    """
    valid = []
    invalid = []

    for ticker_str in tickers:
        try:
            ticker = yf.Ticker(ticker_str.upper())
            hist = ticker.history(period="5d")
            if len(hist) > 0:
                valid.append(ticker_str.upper())
            else:
                invalid.append(ticker_str.upper())
        except Exception:
            invalid.append(ticker_str.upper())

    return valid, invalid
