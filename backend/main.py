#!/usr/bin/env python3
"""
Railway deployment entry point for Histora backend.
"""
import os
import sys
from pathlib import Path

# Add the current directory and app directory to Python path
current_dir = Path(__file__).parent
app_dir = current_dir / "app"
sys.path.insert(0, str(current_dir))
sys.path.insert(0, str(app_dir))

# Set PYTHONPATH environment variable
os.environ['PYTHONPATH'] = f"{current_dir}:{app_dir}:{os.environ.get('PYTHONPATH', '')}"

if __name__ == "__main__":
    import uvicorn
    
    # Try to import the app
    try:
        from app.main import app
    except ImportError:
        # Fallback import
        import main as main_module
        app = main_module.app
    
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"Starting Histora backend on {host}:{port}")
    uvicorn.run(app, host=host, port=port)