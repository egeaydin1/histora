"""
FastAPI main application for Histora backend.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
import time

from app.core.config import get_settings
from app.api.v1.router import api_router


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    print(f"🌍 Environment: {settings.environment}")
    print(f"🔧 Debug mode: {settings.debug}")
    
    # TODO: Initialize database connections
    # TODO: Initialize Chroma client
    # TODO: Run migrations if needed
    
    yield
    
    # Shutdown
    print("🛑 Shutting down Histora backend...")


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    
    app = FastAPI(
        title=settings.app_name,
        description="AI Historical Figures Chat Platform - Backend API",
        version=settings.app_version,
        debug=settings.debug,
        docs_url="/docs" if settings.dev_show_docs else None,
        redoc_url="/redoc" if settings.dev_show_docs else None,
        lifespan=lifespan
    )
    
    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Trusted Host Middleware (production security)
    if settings.is_production:
        app.add_middleware(
            TrustedHostMiddleware, 
            allowed_hosts=[settings.backend_url.replace("http://", "").replace("https://", "")]
        )
    
    # Request timing middleware
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
    
    # Include API routes
    app.include_router(api_router, prefix="/api/v1")
    
    # Health check endpoint
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {
            "status": "healthy",
            "app": settings.app_name,
            "version": settings.app_version,
            "environment": settings.environment
        }
    
    # Root endpoint
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {
            "message": f"Welcome to {settings.app_name} API",
            "version": settings.app_version,
            "docs": f"{settings.backend_url}/docs" if settings.dev_show_docs else None
        }
    
    return app


# Create app instance
app = create_app()


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.backend_port,
        reload=settings.dev_auto_reload and settings.is_development,
        log_level=settings.log_level.lower()
    )
