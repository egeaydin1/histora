"""
API dependencies for authentication and authorization.
"""
import uuid
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import jwt
from datetime import datetime, timedelta
import structlog

from app.core.config import get_settings
from app.core.database import get_async_session
from app.models.database import User, UserQuota
from app.services.usage_service import UsageService

logger = structlog.get_logger(__name__)

security = HTTPBearer(auto_error=False)

class AuthenticationError(Exception):
    """Custom authentication error."""
    pass

class QuotaExceededError(Exception):
    """User quota exceeded error."""
    pass

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_async_session)
) -> User:
    """Get current authenticated user."""
    
    # Development mode: allow without authentication
    settings = get_settings()
    if settings.environment == "development" and not credentials:
        # Return a mock user for development - try to find existing or create one
        try:
            # Look for existing demo user
            stmt = select(User).where(User.email == "demo@histora.com")
            result = await db.execute(stmt)
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                return existing_user
        except Exception:
            pass  # Database might not be available
        
        # Create a mock user object that won't cause database issues
        class MockUser:
            def __init__(self):
                # Use a fixed UUID for consistency
                self.id = uuid.UUID('12345678-1234-5678-9abc-123456789abc')
                self.email = "demo@histora.com"
                self.full_name = "Demo User"
                self.role = "user"
                self.is_admin = False
                self.is_active = True
                self.language_preference = "tr"
                self.created_at = datetime.now()
                self.last_login_at = datetime.now()
                # Add fields that might be accessed
                self.firebase_uid = "demo-firebase-uid"
                self.email_verified = True
        
        return MockUser()
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        settings = get_settings()
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise AuthenticationError("Invalid token payload")
        
        # Convert string UUID to UUID object
        try:
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            raise AuthenticationError("Invalid user ID format")
        
    except jwt.PyJWTError as e:
        logger.error("JWT decode error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except AuthenticationError as e:
        logger.error("Authentication error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    stmt = select(User).where(User.id == user_uuid, User.is_active == True)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current authenticated admin user."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

async def check_user_quota(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
    tokens_needed: int = 100  # Default estimate
) -> Dict[str, Any]:
    """Check if user has enough quota for the request."""
    
    # Development mode: always allow for mock users
    settings = get_settings()
    if (settings.environment == "development" and 
        hasattr(current_user, '__class__') and 
        current_user.__class__.__name__ == 'MockUser'):
        return {
            "allowed": True,
            "quota": {
                "plan_type": "development",
                "tokens_remaining": 10000,
                "requests_remaining": 1000
            },
            "limits_exceeded": {"tokens": False, "requests": False}
        }
    
    usage_service = UsageService()
    
    try:
        quota_check = await usage_service.check_user_limits(
            db, 
            current_user.id, 
            tokens_needed=tokens_needed, 
            requests_needed=1
        )
        
        if not quota_check["allowed"]:
            limits = quota_check["limits_exceeded"]
            if limits["tokens"]:
                raise QuotaExceededError("Monthly token limit exceeded")
            if limits["requests"]:
                raise QuotaExceededError("Monthly request limit exceeded")
        
        # Store quota info in request state for later use
        request.state.quota_info = quota_check["quota"]
        
        return quota_check
        
    except QuotaExceededError as e:
        logger.warning(
            "Quota exceeded",
            user_id=str(current_user.id),
            error=str(e)
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": str(e),
                "quota": quota_check.get("quota", {}),
                "upgrade_required": True
            }
        )
    except Exception as e:
        logger.error("Error checking quota", error=str(e), user_id=str(current_user.id))
        # Allow request to proceed if quota check fails
        return {"allowed": True, "quota": {}}

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_async_session)
) -> Optional[User]:
    """Get current user if authenticated, otherwise None."""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None

class RateLimiter:
    """Simple rate limiter for API endpoints."""
    
    def __init__(self, max_requests: int = 60, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = {}  # In production, use Redis
    
    def is_allowed(self, key: str) -> bool:
        """Check if request is allowed under rate limit."""
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.window_seconds)
        
        # Clean old requests
        if key in self.requests:
            self.requests[key] = [
                req_time for req_time in self.requests[key] 
                if req_time > window_start
            ]
        else:
            self.requests[key] = []
        
        # Check limit
        if len(self.requests[key]) >= self.max_requests:
            return False
        
        # Add current request
        self.requests[key].append(now)
        return True

# Rate limiter instances
general_limiter = RateLimiter(max_requests=60, window_seconds=60)  # 60 requests per minute
chat_limiter = RateLimiter(max_requests=20, window_seconds=60)     # 20 chat requests per minute

async def rate_limit_general(
    request: Request,
    current_user: Optional[User] = Depends(get_optional_user)
):
    """General rate limiting for API endpoints."""
    # Use user ID if authenticated, otherwise IP
    key = str(current_user.id) if current_user else request.client.host
    
    if not general_limiter.is_allowed(f"general:{key}"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later."
        )

async def rate_limit_chat(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Chat-specific rate limiting."""
    key = str(current_user.id)
    
    if not chat_limiter.is_allowed(f"chat:{key}"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Chat rate limit exceeded. Please wait before sending another message."
        )

async def require_rag_access(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Require user to have RAG access (premium feature)."""
    stmt = select(UserQuota).where(UserQuota.user_id == current_user.id)
    result = await db.execute(stmt)
    quota = result.scalar_one_or_none()
    
    if not quota or not quota.rag_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "RAG access required",
                "message": "This feature requires a premium subscription",
                "upgrade_required": True
            }
        )

async def require_custom_characters(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Require user to have custom character creation access."""
    stmt = select(UserQuota).where(UserQuota.user_id == current_user.id)
    result = await db.execute(stmt)
    quota = result.scalar_one_or_none()
    
    if not quota or not quota.custom_characters:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Custom character access required",
                "message": "Creating custom characters requires a premium subscription",
                "upgrade_required": True
            }
        )
