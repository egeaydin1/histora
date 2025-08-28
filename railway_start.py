#!/usr/bin/env python
"""
Simple startup script for Railway deployment.
This script assumes dependencies are already installed by Railway.
"""

import os
import sys
import asyncio
from pathlib import Path

def main():
    """Main entry point."""
    print("🚀 Starting Histora backend on Railway...")
    
    # Add backend to Python path
    backend_path = Path(__file__).parent / "backend"
    sys.path.insert(0, str(backend_path))
    
    # Change to backend directory
    os.chdir(backend_path)
    print(f"📂 Working directory: {os.getcwd()}")
    
    # Run database initialization if in Railway environment
    if os.environ.get("RAILWAY_PROJECT_ID"):
        print("🔧 Running Railway database initialization...")
        try:
            # Add the backend directory to Python path for imports
            sys.path.append(str(backend_path))
            
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
    port = int(os.environ.get("PORT", 8000))
    
    # Import and run the FastAPI app directly
    try:
        from app.main import app
        import uvicorn
        
        print(f"🔧 Starting Uvicorn server on port {port}")
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=port,
            workers=4,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ Failed to start FastAPI application: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()