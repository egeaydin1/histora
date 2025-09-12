#!/usr/bin/env python3
"""
Railway deployment entry point for Histora backend.
Direct import from app.main for full API functionality.
"""
import os
import sys
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent.resolve()
sys.path.insert(0, str(current_dir))

# Set PYTHONPATH environment variable
os.environ.setdefault('PYTHONPATH', str(current_dir))

# Direct import from app.main - this has full API v1
try:
    from app.main import app
    print("✅ Direct import from app.main:app - Full API v1 loaded!")
except Exception as e:
    print(f"❌ Failed to import app.main:app - {e}")
    # Create fallback
    from fastapi import FastAPI
    app = FastAPI(title="Histora Backend Fallback", version="1.0.0")
    
    @app.get("/health")
    async def health_check():
        return {"status": "ok", "message": "Fallback mode - check logs"}
    
    print("⚠️ Using fallback app")

# For Railway deployment
if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0"
    
    print(f"🚀 Starting Histora Backend on {host}:{port}")
    
    # Run the server
    uvicorn.run(
        app,  # Direct app object with full API
        host=host,
        port=port,
        log_level="info",
        reload=False
    )