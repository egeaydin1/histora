#!/usr/bin/env python3
"""
Simplified Railway deployment entry point for Histora backend.
"""
import os
import sys
from pathlib import Path

# Add paths
current_dir = Path(__file__).parent.resolve()
app_dir = current_dir / "app"

sys.path.insert(0, str(current_dir))
sys.path.insert(0, str(app_dir))

# Set environment
os.environ.setdefault('PYTHONPATH', f"{current_dir}:{app_dir}")

def create_simple_app():
    """Create a minimal FastAPI app for Railway."""
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    app = FastAPI(
        title="Histora Backend",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc"
    )
    
    # Simple CORS - allow all for initial deployment
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/")
    async def root():
        return {"message": "Histora Backend API", "status": "running"}
    
    @app.get("/health")
    async def health():
        return {"status": "healthy", "service": "histora-backend"}
    
    @app.get("/api/v1/health")
    async def api_health():
        return {"status": "healthy", "api": "v1", "service": "histora-backend"}
    
    return app

if __name__ == "__main__":
    import uvicorn
    
    # Try to import full app, fallback to simple app
    try:
        from app.main import create_app
        app = create_app()
        print("Using full application")
    except Exception as e:
        print(f"Full app import failed: {e}")
        print("Using simplified app")
        app = create_simple_app()
    
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0"
    
    print(f"Starting server on {host}:{port}")
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )