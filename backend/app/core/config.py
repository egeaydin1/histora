"""
Configuration settings for Histora backend application.
Centralized configuration management with environment variables.
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # =============================================================================
    # APPLICATION SETTINGS
    # =============================================================================
    app_name: str = Field(default="Histora", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=True, env="DEBUG")
    log_level: str = Field(default="info", env="LOG_LEVEL")
    
    # =============================================================================
    # API SETTINGS
    # =============================================================================
    backend_url: str = Field(default="http://localhost:8000", env="BACKEND_URL")
    backend_port: int = Field(default=8000, env="BACKEND_PORT")
    frontend_url: str = Field(default="http://localhost:3000", env="FRONTEND_URL")
    
    # CORS
    allowed_origins: str = Field(
        default="http://localhost:3000,http://localhost:3001",
        env="ALLOWED_ORIGINS"
    )
    
    # =============================================================================
    # AI MODEL SETTINGS
    # =============================================================================
    # OpenRouter Configuration
    openrouter_api_key: str = Field(default="", env="OPENROUTER_API_KEY")
    openrouter_base_url: str = Field(
        default="https://openrouter.ai/api/v1", 
        env="OPENROUTER_BASE_URL"
    )
    
    # Default models
    default_ai_model: str = Field(
        default="google/gemini-2.0-flash-001",
        env="DEFAULT_AI_MODEL"
    )
    backup_ai_model: str = Field(
        default="deepseek/deepseek-r1-0528:free",
        env="BACKUP_AI_MODEL"
    )
    
    # Model parameters
    ai_max_tokens: int = Field(default=2048, env="AI_MAX_TOKENS")
    ai_temperature: float = Field(default=0.7, env="AI_TEMPERATURE")
    ai_top_p: float = Field(default=0.9, env="AI_TOP_P")
    
    # =============================================================================
    # EMBEDDING SETTINGS
    # =============================================================================
    openai_api_key: str = Field(default="", env="OPENAI_API_KEY")
    openai_embedding_model: str = Field(
        default="text-embedding-3-small",
        env="OPENAI_EMBEDDING_MODEL"
    )
    embedding_dimensions: int = Field(default=1536, env="EMBEDDING_DIMENSIONS")
    
    # =============================================================================
    # DATABASE SETTINGS
    # =============================================================================
    # PostgreSQL
    database_url: str = Field(
        default="postgresql://username:password@localhost:5432/histora",
        env="DATABASE_URL"
    )
    db_host: str = Field(default="localhost", env="DB_HOST")
    db_port: int = Field(default=5432, env="DB_PORT")
    db_name: str = Field(default="histora", env="DB_NAME")
    db_user: str = Field(default="username", env="DB_USER")
    db_password: str = Field(default="password", env="DB_PASSWORD")
    db_pool_size: int = Field(default=10, env="DB_POOL_SIZE")
    db_max_overflow: int = Field(default=20, env="DB_MAX_OVERFLOW")
    
    # =============================================================================
    # AUTHENTICATION (FIREBASE)
    # =============================================================================
    firebase_project_id: str = Field(default="", env="FIREBASE_PROJECT_ID")
    firebase_private_key_id: str = Field(default="", env="FIREBASE_PRIVATE_KEY_ID")
    firebase_private_key: str = Field(default="", env="FIREBASE_PRIVATE_KEY")
    firebase_client_email: str = Field(default="", env="FIREBASE_CLIENT_EMAIL")
    firebase_client_id: str = Field(default="", env="FIREBASE_CLIENT_ID")
    firebase_auth_uri: str = Field(
        default="https://accounts.google.com/o/oauth2/auth",
        env="FIREBASE_AUTH_URI"
    )
    firebase_token_uri: str = Field(
        default="https://oauth2.googleapis.com/token",
        env="FIREBASE_TOKEN_URI"
    )
    
    # =============================================================================
    # SECURITY SETTINGS
    # =============================================================================
    jwt_secret_key: str = Field(default="", env="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(default=1440, env="JWT_EXPIRE_MINUTES")
    admin_api_key: str = Field(default="", env="ADMIN_API_KEY")
    
    # =============================================================================
    # FILE UPLOAD SETTINGS
    # =============================================================================
    max_file_size_mb: int = Field(default=50, env="MAX_FILE_SIZE_MB")
    allowed_file_types: str = Field(
        default=".txt,.md,.pdf,.docx",
        env="ALLOWED_FILE_TYPES"
    )
    upload_directory: str = Field(default="./uploads", env="UPLOAD_DIRECTORY")
    temp_directory: str = Field(default="./temp", env="TEMP_DIRECTORY")
    
    # =============================================================================
    # INTERNATIONALIZATION
    # =============================================================================
    default_language: str = Field(default="tr", env="DEFAULT_LANGUAGE")
    supported_languages: str = Field(
        default="tr,en",
        env="SUPPORTED_LANGUAGES"
    )
    translation_cache: bool = Field(default=True, env="TRANSLATION_CACHE")
    
    # =============================================================================
    # MONITORING & LOGGING
    # =============================================================================
    log_file_path: str = Field(default="./logs/histora.log", env="LOG_FILE_PATH")
    log_max_size_mb: int = Field(default=100, env="LOG_MAX_SIZE_MB")
    log_backup_count: int = Field(default=5, env="LOG_BACKUP_COUNT")
    
    # Analytics
    google_analytics_id: Optional[str] = Field(default=None, env="GOOGLE_ANALYTICS_ID")
    sentry_dsn: Optional[str] = Field(default=None, env="SENTRY_DSN")
    
    # =============================================================================
    # DEVELOPMENT SETTINGS
    # =============================================================================
    dev_seed_database: bool = Field(default=True, env="DEV_SEED_DATABASE")
    dev_auto_reload: bool = Field(default=True, env="DEV_AUTO_RELOAD")
    dev_show_docs: bool = Field(default=True, env="DEV_SHOW_DOCS")
    dev_cors_allow_all: bool = Field(default=True, env="DEV_CORS_ALLOW_ALL")
    
    # Testing
    test_database_url: str = Field(
        default="postgresql://username:password@localhost:5432/histora_test",
        env="TEST_DATABASE_URL"
    )
    run_migrations_on_start: bool = Field(default=True, env="RUN_MIGRATIONS_ON_START")
    
    class Config:
        env_file = [".env", "../.env"]
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"
        
    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment.lower() == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment.lower() == "production"
    
    @property
    def cors_origins(self) -> List[str]:
        """Get CORS origins based on environment."""
        if self.dev_cors_allow_all and self.is_development:
            return ["*"]
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    
    @property
    def max_file_size_bytes(self) -> int:
        """Convert max file size from MB to bytes."""
        return self.max_file_size_mb * 1024 * 1024
    
    @property
    def allowed_file_types_list(self) -> List[str]:
        """Get allowed file types as list."""
        return [ext.strip() for ext in self.allowed_file_types.split(",")]
    
    @property
    def supported_languages_list(self) -> List[str]:
        """Get supported languages as list."""
        return [lang.strip() for lang in self.supported_languages.split(",")]


# Global settings instance
settings = Settings()

def get_settings() -> Settings:
    """Get application settings."""
    return settings
