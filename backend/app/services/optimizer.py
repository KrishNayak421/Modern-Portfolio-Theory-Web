"""
Core MPT optimization service.
All pure computation functions — no plotting, no I/O.
Refactored from legacy/main.py
"""
import numpy as np
import pandas as pd
import scipy.optimize as sco
from scipy.interpolate import interp1d


def portfolio_performance(weights, mean_returns, cov_matrix):
    """Calculate annualized portfolio return and volatility."""
    annual_return = np.dot(mean_returns, weights) * 252
    port_variance = np.dot(weights.T, np.dot(cov_matrix, weights)) * 252
    port_volatility = np.sqrt(port_variance)
    return float(annual_return), float(port_volatility)


def negative_sharpe_ratio(weights, mean_returns, cov_matrix, risk_free_rate=0):
    """Returns the negative Sharpe ratio (for minimization)."""
    ret, vol = portfolio_performance(weights, mean_returns, cov_matrix)
    return -(ret - risk_free_rate) / vol


def max_sharpe_ratio(mean_returns, cov_matrix, risk_free_rate=0, constraint_set=(0, 1)):
    """Optimize for the maximum Sharpe ratio portfolio."""
    num_assets = len(mean_returns)
    args = (mean_returns, cov_matrix, risk_free_rate)
    constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
    bounds = tuple(constraint_set for _ in range(num_assets))

    result = sco.minimize(
        negative_sharpe_ratio,
        num_assets * [1. / num_assets],
        args=args,
        method='SLSQP',
        bounds=bounds,
        constraints=constraints
    )
    return result


def portfolio_variance(weights, mean_returns, cov_matrix):
    """Returns the portfolio variance (annualized)."""
    return np.dot(weights.T, np.dot(cov_matrix, weights)) * 252


def min_variance(mean_returns, cov_matrix, constraint_set=(0, 1)):
    """Optimize for the minimum volatility portfolio."""
    num_assets = len(mean_returns)
    args = (mean_returns, cov_matrix)
    constraints = ({'type': 'eq', 'fun': lambda x: np.sum(x) - 1})
    bounds = tuple(constraint_set for _ in range(num_assets))

    result = sco.minimize(
        portfolio_variance,
        num_assets * [1. / num_assets],
        args=args,
        method='SLSQP',
        bounds=bounds,
        constraints=constraints
    )
    return result


def efficient_optimization(mean_returns, cov_matrix, target_return, constraint_set=(0, 1)):
    """Find the minimum variance portfolio for a given target return."""
    num_assets = len(mean_returns)
    args = (mean_returns, cov_matrix)
    constraints = (
        {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},
        {'type': 'eq', 'fun': lambda x: np.dot(mean_returns, x) * 252 - target_return}
    )
    bounds = tuple(constraint_set for _ in range(num_assets))

    result = sco.minimize(
        portfolio_variance,
        num_assets * [1. / num_assets],
        args=args,
        method='SLSQP',
        bounds=bounds,
        constraints=constraints
    )
    return result


def random_portfolios(mean_returns, cov_matrix, num_portfolios=5000, risk_free_rate=0):
    """Generate random portfolios for visualization."""
    num_assets = len(mean_returns)
    results_ret = []
    results_vol = []

    weights = np.random.dirichlet(np.ones(num_assets), num_portfolios)
    for i in range(num_portfolios):
        ret, vol = portfolio_performance(weights[i], mean_returns, cov_matrix)
        results_ret.append(ret * 100)
        results_vol.append(vol * 100)

    return results_ret, results_vol


def filter_random_portfolios(random_rets, random_vols, ef_vols, target_rets):
    """Filter random portfolios to lie below the efficient frontier."""
    ef_interp = interp1d(ef_vols, target_rets, kind='linear', fill_value='extrapolate')
    filtered_rets = []
    filtered_vols = []

    for ret, vol in zip(random_rets, random_vols):
        if ret <= ef_interp(vol):
            filtered_rets.append(ret)
            filtered_vols.append(vol)

    return filtered_rets, filtered_vols


def sortino_ratio(weights, daily_returns, MAR):
    """Calculate the Sortino Ratio for a portfolio."""
    portfolio_daily = daily_returns.dot(weights)
    downside_returns = portfolio_daily[portfolio_daily < MAR]

    if len(downside_returns) == 0:
        return float('nan')

    downside_std = np.std(downside_returns)
    annual_downside = downside_std * np.sqrt(252)
    annual_portfolio_return = portfolio_daily.mean() * 252

    return float((annual_portfolio_return - MAR * 252) / annual_downside)


def calculate_full_optimization(mean_returns, cov_matrix, daily_returns,
                                 risk_free_rate=0, constraint_set=(0, 1),
                                 num_portfolios=5000, benchmark_daily_return=0):
    """
    Run the complete optimization pipeline.
    Returns a dict with all results ready for the API response.
    """
    # Max Sharpe portfolio
    max_sharpe_obj = max_sharpe_ratio(mean_returns, cov_matrix, risk_free_rate, constraint_set)
    sr_ret, sr_vol = portfolio_performance(max_sharpe_obj.x, mean_returns, cov_matrix)
    sr_ret_pct = sr_ret * 100
    sr_vol_pct = sr_vol * 100
    sr_sharpe = sr_ret / sr_vol if sr_vol != 0 else 0

    max_sharpe_allocations = []
    for stock, weight in zip(mean_returns.index, max_sharpe_obj.x):
        max_sharpe_allocations.append({
            "stock": str(stock),
            "weight": round(float(weight) * 100, 2)
        })

    # Min Volatility portfolio
    min_vol_obj = min_variance(mean_returns, cov_matrix, constraint_set)
    mv_ret, mv_vol = portfolio_performance(min_vol_obj.x, mean_returns, cov_matrix)
    mv_ret_pct = mv_ret * 100
    mv_vol_pct = mv_vol * 100
    mv_sharpe = mv_ret / mv_vol if mv_vol != 0 else 0

    min_vol_allocations = []
    for stock, weight in zip(mean_returns.index, min_vol_obj.x):
        min_vol_allocations.append({
            "stock": str(stock),
            "weight": round(float(weight) * 100, 2)
        })

    # Efficient Frontier
    target_returns_frac = np.linspace(mv_ret, sr_ret * 1.2, 50)
    ef_vols = []
    ef_rets = []
    for ret in target_returns_frac:
        try:
            eff = efficient_optimization(mean_returns, cov_matrix, ret, constraint_set)
            eff_vol = np.sqrt(eff.fun) * 100
            ef_vols.append(float(eff_vol))
            ef_rets.append(float(ret * 100))
        except Exception:
            continue

    # Random portfolios (filtered)
    rand_rets, rand_vols = random_portfolios(mean_returns, cov_matrix, num_portfolios, risk_free_rate)

    if ef_vols and ef_rets:
        filt_rets, filt_vols = filter_random_portfolios(rand_rets, rand_vols, ef_vols, ef_rets)
    else:
        filt_rets, filt_vols = rand_rets, rand_vols

    # Sortino ratio
    sort_ratio = sortino_ratio(max_sharpe_obj.x, daily_returns, benchmark_daily_return)

    return {
        "max_sharpe": {
            "allocations": max_sharpe_allocations,
            "annual_return": round(sr_ret_pct, 2),
            "annual_volatility": round(sr_vol_pct, 2),
            "sharpe_ratio": round(sr_sharpe, 2),
        },
        "min_volatility": {
            "allocations": min_vol_allocations,
            "annual_return": round(mv_ret_pct, 2),
            "annual_volatility": round(mv_vol_pct, 2),
            "sharpe_ratio": round(mv_sharpe, 2),
        },
        "sortino_ratio": round(sort_ratio, 2) if not np.isnan(sort_ratio) else None,
        "efficient_frontier": {
            "returns": ef_rets,
            "volatilities": ef_vols,
        },
        "random_portfolios": {
            "returns": filt_rets,
            "volatilities": filt_vols,
        },
    }
