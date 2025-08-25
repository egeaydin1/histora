"""
Main API router for v1 endpoints.
"""

from fastapi import APIRouter

from .endpoints import (
    auth,
    characters,
    chat,
    admin,
    health
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    health.router,
    prefix="/health",
    tags=["health"]
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["authentication"]
)

api_router.include_router(
    characters.router,
    prefix="/characters",
    tags=["characters"]
)

api_router.include_router(
    chat.router,
    prefix="/chat",
    tags=["chat"]
)

api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["admin"]
)
