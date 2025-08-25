"""
Authentication endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional

from app.core.config import get_settings, Settings

router = APIRouter()


class UserRegister(BaseModel):
    """User registration model."""
    firebase_uid: str
    email: str
    display_name: Optional[str] = None
    language_preference: str = "tr"


class UserLogin(BaseModel):
    """User login model."""
    firebase_uid: str
    email: str


class UserResponse(BaseModel):
    """User response model."""
    id: str
    firebase_uid: str
    email: str
    display_name: Optional[str]
    role: str
    language_preference: str
    created_at: str


@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserRegister,
    settings: Settings = Depends(get_settings)
):
    """Register a new user."""
    
    # TODO: Verify Firebase token
    # TODO: Check if user already exists
    # TODO: Create user in database
    # TODO: Return user data
    
    # Placeholder response
    return {
        "id": "uuid-placeholder",
        "firebase_uid": user_data.firebase_uid,
        "email": user_data.email,
        "display_name": user_data.display_name,
        "role": "user",
        "language_preference": user_data.language_preference,
        "created_at": "2024-01-01T00:00:00Z"
    }


@router.post("/login", response_model=UserResponse)
async def login_user(
    user_data: UserLogin,
    settings: Settings = Depends(get_settings)
):
    """Login user with Firebase."""
    
    # TODO: Verify Firebase token
    # TODO: Get or create user in database
    # TODO: Update last_login
    # TODO: Return user data
    
    # Placeholder response
    return {
        "id": "uuid-placeholder",
        "firebase_uid": user_data.firebase_uid,
        "email": user_data.email,
        "display_name": "Test User",
        "role": "user",
        "language_preference": "tr",
        "created_at": "2024-01-01T00:00:00Z"
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    # TODO: Add Firebase token dependency
    settings: Settings = Depends(get_settings)
):
    """Get current user information."""
    
    # TODO: Extract user from Firebase token
    # TODO: Get user from database
    # TODO: Return user data
    
    # Placeholder response
    return {
        "id": "uuid-placeholder",
        "firebase_uid": "firebase-uid",
        "email": "user@example.com",
        "display_name": "Test User",
        "role": "user",
        "language_preference": "tr",
        "created_at": "2024-01-01T00:00:00Z"
    }


@router.post("/logout")
async def logout_user():
    """Logout user (client-side Firebase logout)."""
    return {"message": "Logged out successfully"}
