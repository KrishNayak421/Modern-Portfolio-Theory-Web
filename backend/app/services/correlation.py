"""
Correlation analysis service.
Refactored from legacy/correlation.py
"""
import pandas as pd


def compute_correlation_matrix(daily_returns: pd.DataFrame) -> dict:
    """
    Compute the correlation matrix from daily returns.
    Returns a dict-of-dicts suitable for JSON serialization.
    """
    corr_matrix = daily_returns.corr()

    # Convert to nested dict with string keys
    result = {}
    for col in corr_matrix.columns:
        col_name = str(col)
        result[col_name] = {}
        for idx in corr_matrix.index:
            idx_name = str(idx)
            result[col_name][idx_name] = round(float(corr_matrix.loc[idx, col]), 4)

    stocks = [str(c) for c in corr_matrix.columns.tolist()]
    return result, stocks
