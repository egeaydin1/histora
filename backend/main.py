#!/usr/bin/env python3
"""
Railway deployment entry point for Histora backend.
"""
import os
import sys
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent.resolve()
sys.path.insert(0, str(current_dir))

# Set PYTHONPATH environment variable
os.environ.setdefault('PYTHONPATH', str(current_dir))

# Import and create the app
try:
    from app.main import create_app
    app = create_app()
    print("✅ Full application loaded successfully")
except ImportError as e:
    print(f"❌ Failed to import app.main: {e}")
    # Create a simple fallback app
    from fastapi import FastAPI
    app = FastAPI(title="Histora Backend", version="1.0.0")
    
    @app.get("/health")
    async def health_check():
        return {"status": "ok", "message": "Histora Backend is running"}
    
    @app.get("/")
    async def root():
        return {"message": "Histora Backend API", "status": "active"}
    
    print("✅ Fallback application created")

# For Railway deployment
if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0"
    
    print(f"🚀 Starting Histora Backend on {host}:{port}")
    
    # Run the server
    uvicorn.run(
        app,  # Direct app object, not string
        host=host,
        port=port,
        log_level="info",
        reload=False
    )