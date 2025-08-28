#!/usr/bin/env python
"""
Simple startup script for Railway deployment.
This script assumes dependencies are already installed by Railway.
"""

import os
import sys
import subprocess
import asyncio
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

def main():
    """Main entry point."""
    print("🚀 Starting Histora backend on Railway...")
    
    # Change to backend directory
    os.chdir(backend_path)
    print(f"📂 Working directory: {os.getcwd()}")
    
    # Run database initialization if in Railway environment
    if os.environ.get("RAILWAY_PROJECT_ID"):
        print("🔧 Running Railway database initialization...")
        try:
            # Import and run initialization
            from app.core.database import db_manager
            from app.models.database import Base
            
            async def init_db():
                print("📋 Creating database tables...")
                engine = db_manager.get_async_engine()
                async with engine.begin() as conn:
                    await conn.run_sync(Base.metadata.create_all)
                print("✅ Database tables created successfully!")
            
            # Run the async initialization
            asyncio.run(init_db())
            print("✅ Railway database initialization completed")
        except Exception as e:
            print(f"❌ Railway initialization error: {e}")
            import traceback
            traceback.print_exc()
    
    # Start the application
    print("🚀 Starting FastAPI application...")
    
    # Get port from environment or default to 8000
    port = os.environ.get("PORT", 8000)
    
    # Start uvicorn as a subprocess
    uvicorn_cmd = [
        sys.executable, "-m", "uvicorn",
        "app.main:app",
        "--host", "0.0.0.0",
        "--port", str(port),
        "--workers", "4"
    ]
    
    print(f"🔧 Starting with command: {' '.join(uvicorn_cmd)}")
    os.execv(sys.executable, uvicorn_cmd)

if __name__ == "__main__":
    main()