"""
Yahoo Finance data fetching service.
"""
import yfinance as yf
import pandas as pd
import datetime as dt
import requests


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
    Search for stock tickers using Yahoo Finance's native search API.
    Returns a list of dicts with ticker info.
    """
    results = []
    if not query:
        return results
        
    try:
        url = f"https://query2.finance.yahoo.com/v1/finance/search"
        params = {"q": query, "quotesCount": 6, "newsCount": 0}
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, params=params, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        quotes = data.get("quotes", [])
        for q in quotes:
            # We mostly care about equities/ETFs, but let's allow all for now.
            if "symbol" in q:
                results.append({
                    "ticker": q.get("symbol"),
                    "name": q.get("shortname", q.get("longname", "Unknown")),
                    "exchange": q.get("exchange", "Unknown"),
                    "type": q.get("quoteType", "Unknown"),
                })
    except Exception as e:
        print(f"Error searching tickers: {e}")

    return results

def get_tickers_info(tickers: list[str]):
    """
    Fetch the latest price, name, and daily change for multiple tickers using yfinance.
    """
    if not tickers:
        return {}
        
    result = {}
    for symbol in tickers:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # yfinance info dict can vary, try a few common keys
            price = info.get("currentPrice") or info.get("regularMarketPrice") or info.get("previousClose") or 0.0
            prev_close = info.get("previousClose") or price
            
            if prev_close and prev_close > 0:
                change_percent = ((price - prev_close) / prev_close) * 100
            else:
                change_percent = 0.0
                
            name = info.get("shortName") or info.get("longName") or symbol
            
            result[symbol] = {
                "name": name,
                "price": float(price),
                "change": float(change_percent),
                "isUp": change_percent >= 0
            }
        except Exception as e:
            print(f"Error fetching info for {symbol}: {e}")
            
    return result


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
