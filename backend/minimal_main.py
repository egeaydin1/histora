#!/usr/bin/env python3
"""
Minimal Railway deployment for Histora backend.
Works without database dependencies for testing.
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Create minimal app
app = FastAPI(
    title="Histora Backend API",
    version="1.0.0",
    description="Histora AI Character Chat Backend"
)

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic endpoints
@app.get("/")
async def root():
    return {
        "message": "Histora Backend API",
        "version": "1.0.0",
        "status": "active",
        "mode": "minimal"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "Histora Backend is running",
        "mode": "minimal"
    }

# API v1 routes
@app.get("/api/v1/health")
async def api_health():
    return {
        "status": "ok",
        "api_version": "v1",
        "message": "API v1 is working"
    }

@app.get("/api/v1/characters")
async def get_characters():
    """Mock characters endpoint"""
    return {
        "characters": [
            {
                "id": "demo-1",
                "name": "Demo Character",
                "description": "A demo character for testing",
                "avatar_url": "/avatars/demo.svg",
                "is_active": True
            }
        ],
        "total": 1,
        "mode": "demo"
    }

@app.get("/api/v1/auth/me")
async def get_current_user():
    """Mock auth endpoint"""
    raise HTTPException(status_code=401, detail="Authentication required")

@app.post("/api/v1/chat/characters/{character_id}")
async def chat_with_character(character_id: str):
    """Mock chat endpoint"""
    return {
        "message": f"Demo response from character {character_id}",
        "character_id": character_id,
        "mode": "demo"
    }

# For Railway deployment
if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0"
    
    print(f"🚀 Starting Histora Minimal Backend on {host}:{port}")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info",
        reload=False
    )
