"""
Health check endpoints.
"""

from fastapi import APIRouter, Depends
from app.core.config import get_settings, Settings

router = APIRouter()


@router.get("/")
async def health_check(settings: Settings = Depends(get_settings)):
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment
    }


@router.get("/detailed")
async def detailed_health_check(settings: Settings = Depends(get_settings)):
    """Detailed health check with service status."""
    
    # TODO: Add database connection check
    # TODO: Add Chroma connection check
    # TODO: Add OpenRouter API check
    
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "services": {
            "database": "healthy",  # TODO: Implement actual check
            "vector_db": "healthy",  # TODO: Implement actual check
            "ai_service": "healthy"  # TODO: Implement actual check
        },
        "config": {
            "default_language": settings.default_language,
            "supported_languages": settings.supported_languages,
            "max_file_size_mb": settings.max_file_size_mb
        }
    }
