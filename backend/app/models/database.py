"""
MongoDB connection and database helpers.
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "mpt_portfolio"

client: AsyncIOMotorClient = None
db = None
_connected = False


async def connect_db():
    """Initialize MongoDB connection. Non-fatal if unavailable."""
    global client, db, _connected
    try:
        client = AsyncIOMotorClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=5000,  # fail fast (5s instead of 30s)
        )
        db = client[DB_NAME]

        # Ping to verify the connection actually works
        await client.admin.command("ping")

        # Create indexes only after successful connection
        await db.users.create_index("email", unique=True)
        await db.saved_portfolios.create_index("user_id")

        _connected = True
        print(f"✓ Connected to MongoDB: {DB_NAME}")
    except Exception as e:
        _connected = False
        print(f"⚠ MongoDB unavailable — auth & saved portfolios disabled: {e}")
        print("  Set MONGODB_URI in backend/.env to enable these features.")


async def close_db():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("✓ MongoDB connection closed")


def get_db():
    """Get database instance. Returns None if not connected."""
    return db


def is_connected():
    """Check whether MongoDB is available."""
    return _connected
