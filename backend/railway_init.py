#!/usr/bin/env python3
"""
Railway initialization script.
This script runs automatically when deploying to Railway to set up the database.
"""
import os
import asyncio
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.core.database import db_manager
from app.models.database import Base

async def init_railway_database():
    """Initialize database tables for Railway deployment."""
    print("🔧 Initializing database for Railway deployment...")
    
    try:
        # Test database connection
        connection_ok = await db_manager.test_connection()
        if not connection_ok:
            print("❌ Cannot connect to database")
            return False
        
        # Create tables
        print("📋 Creating database tables...")
        engine = db_manager.get_async_engine()
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        print("✅ Database tables created successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to initialize database: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main entry point."""
    # Only run in Railway environment
    if not os.environ.get("RAILWAY_PROJECT_ID"):
        print("⚠️  Not running in Railway environment. Skipping initialization.")
        return
    
    print("🚀 Running Railway initialization...")
    
    # Run database initialization
    success = asyncio.run(init_railway_database())
    
    if success:
        print("🎉 Railway initialization completed successfully!")
    else:
        print("❌ Railway initialization failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()