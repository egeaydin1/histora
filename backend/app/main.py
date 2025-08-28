"""
FastAPI main application for Histora backend.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
import time
import os

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
    
    # Initialize database
    try:
        from app.core.database import init_database
        db_initialized = await init_database()
        if db_initialized:
            print("✅ Database initialized successfully")
        else:
            print("❌ Database initialization failed")
    except Exception as e:
        print(f"❌ Database error: {e}")
        import traceback
        traceback.print_exc()
    
    # Run Railway initialization if in Railway environment
    if os.environ.get("RAILWAY_PROJECT_ID"):
        try:
            print("🔧 Running Railway initialization...")
            from app.core.database import db_manager
            from app.models.database import Base
            
            # Create tables automatically on Railway
            engine = db_manager.get_async_engine()
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("✅ Railway database initialization completed")
        except Exception as e:
            print(f"❌ Railway initialization error: {e}")
            import traceback
            traceback.print_exc()
    
    yield
    
    # Shutdown
    print("🛑 Shutting down Histora backend...")
    
    # Cleanup database connections
    try:
        from app.core.database import cleanup_database
        await cleanup_database()
        print("🧹 Database connections cleaned up")
    except Exception as e:
        print(f"⚠️ Database cleanup error: {e}")


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
    if settings.is_development:
        # Development: Allow all origins
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    else:
        # Production: Restrict to configured origins
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
    # Use PORT environment variable for Railway, fallback to settings
    port = int(os.environ.get("PORT", settings.backend_port))
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=settings.dev_auto_reload and settings.is_development,
        log_level=settings.log_level.lower()
    )