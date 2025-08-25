"""
Authentication and authorization service.
"""
import os
import jwt
import bcrypt
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from pydantic import BaseModel
import structlog

from app.core.config import get_settings
from app.models.database import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

logger = structlog.get_logger(__name__)

class TokenData(BaseModel):
    """Token data model."""
    user_id: str
    email: str
    role: str
    is_admin: bool
    exp: datetime

class AuthService:
    """Authentication service for user management."""
    
    def __init__(self):
        self.settings = get_settings()
        self.secret_key = self.settings.jwt_secret_key or "histora-super-secret-key-2025"
        self.algorithm = self.settings.jwt_algorithm
        self.token_expire_minutes = self.settings.jwt_expire_minutes
        
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt."""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password against hash."""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False
    
    def create_access_token(self, user_data: Dict[str, Any]) -> str:
        """Create JWT access token."""
        to_encode = user_data.copy()
        
        # Convert UUID objects to strings for JSON serialization
        for key, value in to_encode.items():
            if hasattr(value, 'hex'):  # Check if it's a UUID-like object
                to_encode[key] = str(value)
        
        expire = datetime.utcnow() + timedelta(minutes=self.token_expire_minutes)
        to_encode.update({"exp": expire})
        
        try:
            encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
            return encoded_jwt
        except Exception as e:
            logger.error(f"Token creation error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not create access token"
            )
    
    def verify_token(self, token: str) -> TokenData:
        """Verify and decode JWT token."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            user_id = payload.get("user_id")
            email = payload.get("email")
            role = payload.get("role", "user")
            is_admin = payload.get("is_admin", False)
            exp = datetime.fromtimestamp(payload.get("exp", 0))
            
            if user_id is None or email is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token format"
                )
            
            return TokenData(
                user_id=user_id,
                email=email,
                role=role,
                is_admin=is_admin,
                exp=exp
            )
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except (jwt.DecodeError, jwt.InvalidTokenError) as e:
            logger.error(f"JWT decode error: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate token"
            )
    
    async def authenticate_user(self, email: str, password: str, db: AsyncSession) -> Optional[User]:
        """Authenticate user with email and password."""
        try:
            # Get user from database
            result = await db.execute(
                select(User).where(User.email == email)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                logger.warning(f"Authentication failed: User not found - {email}")
                return None
            
            # Verify password
            if not self.verify_password(password, user.password_hash):
                logger.warning(f"Authentication failed: Invalid password - {email}")
                return None
            
            # Update last login
            user.last_login_at = datetime.utcnow()
            await db.commit()
            
            logger.info(f"User authenticated successfully: {email}")
            return user
            
        except Exception as e:
            logger.error(f"Authentication error for {email}: {e}")
            return None
    
    async def create_user(
        self, 
        email: str, 
        password: str, 
        full_name: str,
        role: str = "user",
        db: AsyncSession = None
    ) -> User:
        """Create new user."""
        try:
            # Check if user already exists
            result = await db.execute(
                select(User).where(User.email == email)
            )
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this email already exists"
                )
            
            # Hash password
            password_hash = self.hash_password(password)
            
            # Create user
            new_user = User(
                email=email,
                password_hash=password_hash,
                full_name=full_name,
                role=role,
                is_active=True,
                is_admin=(role == "admin"),
                email_verified=False  # In production, implement email verification
            )
            
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)
            
            logger.info(f"User created successfully: {email} (role: {role})")
            return new_user
            
        except HTTPException:
            raise
        except Exception as e:
            await db.rollback()
            logger.error(f"User creation error for {email}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not create user"
            )
    
    async def get_user_by_id(self, user_id: str, db: AsyncSession) -> Optional[User]:
        """Get user by ID."""
        try:
            result = await db.execute(
                select(User).where(User.id == user_id)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            return None
    
    async def get_user_by_email(self, email: str, db: AsyncSession) -> Optional[User]:
        """Get user by email."""
        try:
            result = await db.execute(
                select(User).where(User.email == email)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error getting user {email}: {e}")
            return None
    
    def check_admin_api_key(self, api_key: str) -> bool:
        """Check admin API key."""
        admin_key = self.settings.admin_api_key
        if not admin_key or admin_key == "":
            # Development mode - allow default key
            return api_key == "histora-admin-dev-2025"
        return api_key == admin_key
    
    async def check_admin_permissions(self, user: User) -> bool:
        """Check if user has admin permissions."""
        return user.is_admin and user.is_active and user.role in ["admin", "super_admin"]
    
    async def update_user_role(self, user_id: str, new_role: str, db: AsyncSession) -> User:
        """Update user role."""
        try:
            user = await self.get_user_by_id(user_id, db)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            old_role = user.role
            user.role = new_role
            user.is_admin = (new_role in ["admin", "super_admin"])
            
            await db.commit()
            await db.refresh(user)
            
            logger.info(f"User role updated: {user.email} ({old_role} -> {new_role})")
            return user
            
        except HTTPException:
            raise
        except Exception as e:
            await db.rollback()
            logger.error(f"Role update error for user {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not update user role"
            )
    
    async def deactivate_user(self, user_id: str, db: AsyncSession) -> User:
        """Deactivate user."""
        try:
            user = await self.get_user_by_id(user_id, db)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            user.is_active = False
            await db.commit()
            await db.refresh(user)
            
            logger.info(f"User deactivated: {user.email}")
            return user
            
        except HTTPException:
            raise
        except Exception as e:
            await db.rollback()
            logger.error(f"User deactivation error for {user_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not deactivate user"
            )

# Global auth service instance
auth_service = AuthService()
