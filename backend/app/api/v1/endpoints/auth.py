"""
Authentication endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import structlog

from app.core.database import get_async_session
from app.core.security import get_current_user, get_current_admin_user, verify_admin_access
from app.services.auth_service import auth_service
from app.services.firebase_service import firebase_service
from app.models.database import User
from sqlalchemy import select, func

logger = structlog.get_logger(__name__)
router = APIRouter()

# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class LoginRequest(BaseModel):
    """Login request model."""
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    """Register request model."""
    email: EmailStr
    password: str
    full_name: str
    role: str = "user"

class AuthResponse(BaseModel):
    """Authentication response model."""
    access_token: str
    token_type: str = "bearer"
    user: dict
    expires_in: int

class UserResponse(BaseModel):
    """User response model."""
    id: str
    email: str
    full_name: str
    role: str
    is_admin: bool
    is_active: bool
    email_verified: bool
    created_at: str
    last_login_at: Optional[str]

class UserCreateRequest(BaseModel):
    """Admin user creation request."""
    email: EmailStr
    password: str
    full_name: str
    role: str = "user"

class UserUpdateRequest(BaseModel):
    """User update request."""
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class FirebaseRegisterRequest(BaseModel):
    """Firebase register request."""
    firebase_uid: str
    email: EmailStr
    display_name: Optional[str] = None
    language_preference: str = "tr"

class FirebaseLoginRequest(BaseModel):
    """Firebase login request."""
    firebase_token: str

# =============================================================================
# PUBLIC AUTHENTICATION ENDPOINTS
# =============================================================================

@router.post("/login", response_model=AuthResponse)
async def login(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_async_session)
):
    """User login endpoint."""
    try:
        # Authenticate user
        user = await auth_service.authenticate_user(
            email=login_data.email,
            password=login_data.password,
            db=db
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create access token
        token_data = {
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "is_admin": user.is_admin
        }
        
        access_token = auth_service.create_access_token(token_data)
        
        # Return response
        return AuthResponse(
            access_token=access_token,
            user={
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_admin": user.is_admin
            },
            expires_in=auth_service.token_expire_minutes * 60
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/register", response_model=AuthResponse)
async def register(
    register_data: RegisterRequest,
    db: AsyncSession = Depends(get_async_session)
):
    """User registration endpoint."""
    try:
        # Create user
        user = await auth_service.create_user(
            email=register_data.email,
            password=register_data.password,
            full_name=register_data.full_name,
            role=register_data.role,
            db=db
        )
        
        # Create access token
        token_data = {
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "is_admin": user.is_admin
        }
        
        access_token = auth_service.create_access_token(token_data)
        
        # Return response
        return AuthResponse(
            access_token=access_token,
            user={
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_admin": user.is_admin
            },
            expires_in=auth_service.token_expire_minutes * 60
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_admin=current_user.is_admin,
        is_active=current_user.is_active,
        email_verified=current_user.email_verified,
        created_at=current_user.created_at.isoformat(),
        last_login_at=current_user.last_login_at.isoformat() if current_user.last_login_at else None
    )

@router.post("/firebase-register", response_model=AuthResponse)
async def firebase_register(
    register_data: FirebaseRegisterRequest,
    db: AsyncSession = Depends(get_async_session)
):
    """Firebase user registration endpoint."""
    try:
        # Check if user already exists
        existing_user = await auth_service.get_user_by_email(register_data.email, db)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        
        # Create user with Firebase UID
        user = await auth_service.create_user(
            email=register_data.email,
            password="firebase_auth",  # Firebase users don't need traditional password
            full_name=register_data.display_name or register_data.email.split('@')[0],
            role="user",
            db=db
        )
        
        # Set Firebase UID
        user.firebase_uid = register_data.firebase_uid
        user.email_verified = True  # Firebase handles email verification
        await db.commit()
        await db.refresh(user)
        
        # Create access token
        token_data = {
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "is_admin": user.is_admin,
            "firebase_uid": register_data.firebase_uid
        }
        
        access_token = auth_service.create_access_token(token_data)
        
        # Return response
        return AuthResponse(
            access_token=access_token,
            user={
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_admin": user.is_admin,
                "firebase_uid": register_data.firebase_uid
            },
            expires_in=auth_service.token_expire_minutes * 60
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Firebase registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase registration failed"
        )

@router.post("/firebase-login", response_model=AuthResponse)
async def firebase_login(
    firebase_data: FirebaseLoginRequest,
    db: AsyncSession = Depends(get_async_session)
):
    """Login with Firebase token."""
    try:
        # Verify Firebase token
        firebase_user = await firebase_service.verify_firebase_token(firebase_data.firebase_token)
        
        if not firebase_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase token"
            )
        
        # Get or create user in database
        user = await auth_service.get_user_by_email(firebase_user["email"], db)
        
        if not user:
            # Create new user from Firebase data
            user = await auth_service.create_user(
                email=firebase_user["email"],
                password="firebase_auth",  # Firebase users don't need password
                full_name=firebase_user.get("name", firebase_user["email"]),
                role="user",
                db=db
            )
            
            # Update with Firebase UID
            user.firebase_uid = firebase_user["uid"]
            user.email_verified = firebase_user.get("email_verified", False)
            await db.commit()
            await db.refresh(user)
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        await db.commit()
        
        # Create access token
        token_data = {
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "is_admin": user.is_admin,
            "firebase_uid": firebase_user["uid"]
        }
        
        access_token = auth_service.create_access_token(token_data)
        
        # Return response
        return AuthResponse(
            access_token=access_token,
            user={
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_admin": user.is_admin,
                "firebase_uid": firebase_user["uid"]
            },
            expires_in=auth_service.token_expire_minutes * 60
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Firebase login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase login failed"
        )

@router.post("/logout")
async def logout():
    """User logout endpoint."""
    # In a stateless JWT system, logout is handled client-side
    # In production, you might want to maintain a token blacklist
    return {"message": "Logged out successfully"}

# =============================================================================
# ADMIN USER MANAGEMENT ENDPOINTS
# =============================================================================

@router.get("/admin/users", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    admin: dict = Depends(verify_admin_access),
    db: AsyncSession = Depends(get_async_session)
):
    """List all users (admin only)."""
    try:
        query = select(User)
        
        # Apply filters
        if role:
            query = query.where(User.role == role)
        if is_active is not None:
            query = query.where(User.is_active == is_active)
        
        # Apply pagination
        query = query.offset(skip).limit(limit).order_by(User.created_at.desc())
        
        result = await db.execute(query)
        users = result.scalars().all()
        
        return [
            UserResponse(
                id=str(user.id),
                email=user.email,
                full_name=user.full_name,
                role=user.role,
                is_admin=user.is_admin,
                is_active=user.is_active,
                email_verified=user.email_verified,
                created_at=user.created_at.isoformat(),
                last_login_at=user.last_login_at.isoformat() if user.last_login_at else None
            )
            for user in users
        ]
        
    except Exception as e:
        logger.error(f"Error listing users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list users"
        )

@router.post("/admin/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreateRequest,
    admin: dict = Depends(verify_admin_access),
    db: AsyncSession = Depends(get_async_session)
):
    """Create new user (admin only)."""
    try:
        user = await auth_service.create_user(
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name,
            role=user_data.role,
            db=db
        )
        
        return UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_admin=user.is_admin,
            is_active=user.is_active,
            email_verified=user.email_verified,
            created_at=user.created_at.isoformat(),
            last_login_at=user.last_login_at.isoformat() if user.last_login_at else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

@router.put("/admin/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    update_data: UserUpdateRequest,
    admin: dict = Depends(verify_admin_access),
    db: AsyncSession = Depends(get_async_session)
):
    """Update user (admin only)."""
    try:
        user = await auth_service.get_user_by_id(user_id, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update fields
        if update_data.full_name is not None:
            user.full_name = update_data.full_name
        if update_data.role is not None:
            user.role = update_data.role
            user.is_admin = (update_data.role in ["admin", "super_admin"])
        if update_data.is_active is not None:
            user.is_active = update_data.is_active
        
        await db.commit()
        await db.refresh(user)
        
        return UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_admin=user.is_admin,
            is_active=user.is_active,
            email_verified=user.email_verified,
            created_at=user.created_at.isoformat(),
            last_login_at=user.last_login_at.isoformat() if user.last_login_at else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )

@router.delete("/admin/users/{user_id}")
async def deactivate_user(
    user_id: str,
    admin: dict = Depends(verify_admin_access),
    db: AsyncSession = Depends(get_async_session)
):
    """Deactivate user (admin only)."""
    try:
        user = await auth_service.deactivate_user(user_id, db)
        return {"message": f"User {user.email} deactivated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deactivating user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate user"
        )

@router.get("/admin/stats")
async def get_auth_stats(
    admin: dict = Depends(verify_admin_access),
    db: AsyncSession = Depends(get_async_session)
):
    """Get authentication statistics (admin only)."""
    try:
        # Total users
        total_users = await db.scalar(select(func.count(User.id)))
        
        # Active users
        active_users = await db.scalar(
            select(func.count(User.id)).where(User.is_active == True)
        )
        
        # Admin users
        admin_users = await db.scalar(
            select(func.count(User.id)).where(User.is_admin == True)
        )
        
        # Users by role
        role_counts = {}
        roles = ["user", "moderator", "admin", "super_admin"]
        for role in roles:
            count = await db.scalar(
                select(func.count(User.id)).where(User.role == role)
            )
            role_counts[role] = count or 0
        
        return {
            "total_users": total_users or 0,
            "active_users": active_users or 0,
            "admin_users": admin_users or 0,
            "users_by_role": role_counts,
            "auth_method": "JWT + API Key",
            "token_expire_minutes": auth_service.token_expire_minutes
        }
        
    except Exception as e:
        logger.error(f"Error getting auth stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get auth statistics"
        )

@router.get("/firebase/status")
async def firebase_status():
    """Firebase service status."""
    return firebase_service.get_status()

@router.get("/health")
async def auth_health():
    """Auth service health check."""
    firebase_status = firebase_service.get_status()
    return {
        "status": "healthy",
        "service": "authentication",
        "auth_methods": ["JWT", "API_Key", "Firebase", "Development_Bypass"],
        "token_expire_minutes": auth_service.token_expire_minutes,
        "firebase": firebase_status
    }