"""
Database connection and session management.
"""
import asyncio
from typing import AsyncGenerator
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import structlog

from app.core.config import get_settings
from app.models.database import Base

logger = structlog.get_logger(__name__)

class DatabaseManager:
    """Database connection and session manager."""
    
    def __init__(self):
        self.settings = get_settings()
        self._async_engine = None
        self._sync_engine = None
        self._async_session_factory = None
        self._sync_session_factory = None
    
    def get_sync_engine(self):
        """Get synchronous database engine."""
        if self._sync_engine is None:
            database_url = self.settings.database_url
            
            # Convert async URL to sync URL for SQLAlchemy
            if database_url.startswith("postgresql+asyncpg://"):
                database_url = database_url.replace("postgresql+asyncpg://", "postgresql://")
            elif database_url.startswith("postgresql://"):
                pass  # Already sync format
            else:
                # Default to sync postgres
                database_url = database_url.replace("postgresql+", "postgresql://")
            
            self._sync_engine = create_engine(
                database_url,
                pool_size=self.settings.db_pool_size,
                max_overflow=self.settings.db_max_overflow,
                echo=self.settings.debug,
                future=True
            )
            
            logger.info(
                "Created synchronous database engine",
                database_url=database_url.split("@")[-1]  # Hide credentials
            )
        
        return self._sync_engine
    
    def get_async_engine(self):
        """Get asynchronous database engine."""
        if self._async_engine is None:
            database_url = self.settings.database_url
            
            # Ensure async URL format
            if not database_url.startswith("postgresql+asyncpg://"):
                if database_url.startswith("postgresql://"):
                    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")
                else:
                    database_url = f"postgresql+asyncpg://{database_url}"
            
            self._async_engine = create_async_engine(
                database_url,
                pool_size=self.settings.db_pool_size,
                max_overflow=self.settings.db_max_overflow,
                echo=self.settings.debug,
                future=True
            )
            
            logger.info(
                "Created asynchronous database engine", 
                database_url=database_url.split("@")[-1]  # Hide credentials
            )
        
        return self._async_engine
    
    def get_sync_session_factory(self):
        """Get synchronous session factory."""
        if self._sync_session_factory is None:
            engine = self.get_sync_engine()
            self._sync_session_factory = sessionmaker(
                bind=engine,
                class_=Session,
                expire_on_commit=False
            )
        return self._sync_session_factory
    
    def get_async_session_factory(self):
        """Get asynchronous session factory."""
        if self._async_session_factory is None:
            engine = self.get_async_engine()
            self._async_session_factory = async_sessionmaker(
                bind=engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
        return self._async_session_factory
    
    async def create_tables(self):
        """Create all database tables."""
        try:
            engine = self.get_async_engine()
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            
            logger.info("Database tables created successfully")
            return True
            
        except Exception as e:
            logger.error("Failed to create database tables", error=str(e))
            return False
    
    async def drop_tables(self):
        """Drop all database tables."""
        try:
            engine = self.get_async_engine()
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.drop_all)
            
            logger.info("Database tables dropped successfully")
            return True
            
        except Exception as e:
            logger.error("Failed to drop database tables", error=str(e))
            return False
    
    async def test_connection(self) -> bool:
        """Test database connection."""
        try:
            engine = self.get_async_engine()
            async with engine.begin() as conn:
                result = await conn.execute(text("SELECT 1"))
                row = result.fetchone()  # Remove await here
            
            logger.info("Database connection test successful")
            return True
            
        except Exception as e:
            logger.error("Database connection test failed", error=str(e))
            return False
    
    async def close(self):
        """Close database connections."""
        if self._async_engine:
            await self._async_engine.dispose()
            logger.info("Closed async database engine")
        
        if self._sync_engine:
            self._sync_engine.dispose()
            logger.info("Closed sync database engine")

# Global database manager instance
db_manager = DatabaseManager()

# Export engine for external access
engine = db_manager.get_async_engine()

# Dependency functions for FastAPI
async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Get async database session for FastAPI dependency injection."""
    session_factory = db_manager.get_async_session_factory()
    async with session_factory() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error("Database session error", error=str(e))
            raise
        finally:
            await session.close()

def get_sync_session() -> Session:
    """Get sync database session."""
    session_factory = db_manager.get_sync_session_factory()
    session = session_factory()
    try:
        return session
    except Exception as e:
        session.rollback()
        logger.error("Database session error", error=str(e))
        raise
    finally:
        session.close()

# Database initialization functions
async def init_database():
    """Initialize database connection and tables."""
    logger.info("Initializing database...")
    
    # Test connection
    connection_ok = await db_manager.test_connection()
    if not connection_ok:
        logger.error("Cannot connect to database")
        return False
    
    # Create tables if they don't exist
    if get_settings().run_migrations_on_start:
        tables_created = await db_manager.create_tables()
        if not tables_created:
            logger.error("Failed to create database tables")
            return False
    
    logger.info("Database initialized successfully")
    return True

async def cleanup_database():
    """Cleanup database connections."""
    logger.info("Cleaning up database connections...")
    await db_manager.close()
    logger.info("Database cleanup completed")
