#!/usr/bin/env python3
"""
Create database tables manually.
"""
import os
import asyncio
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set environment variables for testing
os.environ.update({
    "DATABASE_URL": "postgresql://histora:histora123@localhost:5433/histora",
    "CHROMA_HOST": "localhost",
    "CHROMA_PORT": "8001",
    "CHROMA_COLLECTION_NAME": "character_embeddings",
    "OPENAI_API_KEY": "your_openai_api_key_here",
    "ENVIRONMENT": "development",
    "DEBUG": "true"
})

from app.core.database import engine
from app.models.database import Base

async def create_tables():
    """Create all database tables."""
    print("🔧 Creating database tables...")
    
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Failed to create tables: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(create_tables())
