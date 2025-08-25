"""
Security dependencies and middleware.
"""
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.services.auth_service import auth_service, TokenData
from app.models.database import User
import structlog

logger = structlog.get_logger(__name__)

# Bearer token scheme
security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_async_session)
) -> User:
    """Get current authenticated user."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Verify token
        token_data = auth_service.verify_token(credentials.credentials)
        
        # Get user from database
        user = await auth_service.get_user_by_id(token_data.user_id, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive",
            )
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current admin user."""
    if not await auth_service.check_admin_permissions(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    return current_user

async def verify_admin_access(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_async_session)
) -> Dict[str, Any]:
    """Verify admin access with multiple authentication methods."""
    
    # Method 1: Check for admin API key in headers
    api_key = request.headers.get("X-Admin-API-Key")
    if api_key and auth_service.check_admin_api_key(api_key):
        logger.info("Admin access granted via API key")
        return {
            "method": "api_key",
            "admin": True,
            "user_id": "admin",
            "role": "admin"
        }
    
    # Method 2: JWT Token authentication
    if credentials:
        try:
            token_data = auth_service.verify_token(credentials.credentials)
            user = await auth_service.get_user_by_id(token_data.user_id, db)
            
            if user and await auth_service.check_admin_permissions(user):
                logger.info(f"Admin access granted via JWT token: {user.email}")
                return {
                    "method": "jwt",
                    "admin": True,
                    "user_id": user.id,
                    "user": user,
                    "role": user.role
                }
        except HTTPException:
            pass  # Fall through to unauthorized
    
    # Development mode: Allow bypass with special header
    dev_bypass = request.headers.get("X-Dev-Admin-Bypass")
    if dev_bypass == "histora-dev-2025" and auth_service.settings.environment == "development":
        logger.warning("Admin access granted via development bypass")
        return {
            "method": "dev_bypass",
            "admin": True,
            "user_id": "dev_admin",
            "role": "super_admin"
        }
    
    # No valid authentication found
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Admin authentication required",
        headers={"WWW-Authenticate": "Bearer"},
    )

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_async_session)
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None."""
    if not credentials:
        return None
    
    try:
        token_data = auth_service.verify_token(credentials.credentials)
        user = await auth_service.get_user_by_id(token_data.user_id, db)
        
        if user and user.is_active:
            return user
    except HTTPException:
        pass
    
    return None

def require_roles(allowed_roles: list):
    """Decorator to require specific roles."""
    def role_dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role {current_user.role} not authorized. Required: {allowed_roles}"
            )
        return current_user
    
    return role_dependency

# Pre-defined role dependencies
require_admin = require_roles(["admin", "super_admin"])
require_moderator = require_roles(["moderator", "admin", "super_admin"])
require_user = require_roles(["user", "moderator", "admin", "super_admin"])
