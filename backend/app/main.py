"""
FastAPI application entry point.
Modern Portfolio Theory Backend.
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.models.database import connect_db, close_db
from app.routers import auth, portfolio, stocks, analysis

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="MPT Portfolio Optimizer",
    description="Modern Portfolio Theory optimization API with interactive stock analysis",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:3000,https://modern-portfolio-theory.up.railway.app"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(portfolio.router)
app.include_router(stocks.router)
app.include_router(analysis.router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "MPT Portfolio Optimizer"}
