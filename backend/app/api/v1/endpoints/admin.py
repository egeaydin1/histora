"""
Admin endpoints for Histora backend.
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete, update
from pydantic import BaseModel, Field
import structlog

from app.core.database import get_async_session
from app.core.config import get_settings, Settings
from app.core.security import verify_admin_access
from app.models.database import Character, User, SystemLog, ChatMessage, ChatSession, PricingPlan, CreditPackage, UserSubscription, CreditTransaction
from app.services.auth_service import AuthService

logger = structlog.get_logger(__name__)
router = APIRouter()

# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class AdminLoginRequest(BaseModel):
    """Schema for admin login request."""
    email: str = Field(..., description="Admin email address")
    password: str = Field(..., description="Admin password")

class AdminLoginResponse(BaseModel):
    """Schema for admin login response."""
    user: dict
    access_token: str
    token_type: str = "bearer"

class CharacterCreate(BaseModel):
    """Schema for creating a new character."""
    id: str = Field(..., min_length=3, max_length=50, description="Character ID (e.g., 'ataturk-001')")
    name: str = Field(..., min_length=1, max_length=255, description="Character name")
    title: Optional[str] = Field(None, max_length=255, description="Character title/description")
    birth_year: Optional[int] = Field(None, ge=0, le=2024, description="Birth year")
    death_year: Optional[int] = Field(None, ge=0, le=2024, description="Death year")
    nationality: Optional[str] = Field(None, max_length=100, description="Nationality")
    category: str = Field(..., description="Category (leader, philosopher, scientist, etc.)")
    description: Optional[str] = Field(None, description="Character description")
    avatar_url: Optional[str] = Field(None, max_length=500, description="Avatar image URL")
    system_prompt: Optional[str] = Field(None, description="AI system prompt for character")
    personality_traits: Optional[List[str]] = Field(default=[], description="Personality traits")
    speaking_style: Optional[str] = Field(None, max_length=255, description="Speaking style description")
    knowledge_context: Optional[str] = Field(None, description="Knowledge context description")
    supported_languages: Optional[List[str]] = Field(default=["tr", "en"], description="Supported languages")
    is_published: Optional[bool] = Field(False, description="Whether character is published")

class CharacterUpdate(BaseModel):
    """Schema for updating an existing character."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    title: Optional[str] = Field(None, max_length=255)
    birth_year: Optional[int] = Field(None, ge=0, le=2024)
    death_year: Optional[int] = Field(None, ge=0, le=2024)
    nationality: Optional[str] = Field(None, max_length=100)
    category: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    avatar_url: Optional[str] = Field(None, max_length=500)
    system_prompt: Optional[str] = Field(None)
    personality_traits: Optional[List[str]] = Field(None)
    speaking_style: Optional[str] = Field(None, max_length=255)
    knowledge_context: Optional[str] = Field(None)
    supported_languages: Optional[List[str]] = Field(None)
    is_published: Optional[bool] = Field(None)

class CharacterResponse(BaseModel):
    """Schema for character response."""
    id: str
    name: str
    title: Optional[str]
    birth_year: Optional[int]
    death_year: Optional[int]
    nationality: Optional[str]
    category: str
    description: Optional[str]
    avatar_url: Optional[str]
    personality_traits: Optional[List[str]]
    speaking_style: Optional[str]
    knowledge_context: Optional[str]
    supported_languages: List[str]
    is_published: bool
    is_featured: bool
    created_at: str
    updated_at: str

class SystemStatsResponse(BaseModel):
    """Schema for system statistics."""
    total_characters: int
    published_characters: int
    total_users: int

class PricingPlanCreate(BaseModel):
    """Schema for creating a pricing plan."""
    name: str = Field(..., max_length=100)
    display_name: str = Field(..., max_length=255)
    description: Optional[str] = Field(None)
    price_monthly: int = Field(..., ge=0)  # Price in cents
    price_yearly: Optional[int] = Field(None, ge=0)
    monthly_token_limit: int = Field(..., ge=0)
    monthly_request_limit: int = Field(..., ge=0)
    included_credits: int = Field(default=0, ge=0)
    rag_access: bool = Field(default=False)
    custom_characters: bool = Field(default=False)
    priority_support: bool = Field(default=False)
    api_access: bool = Field(default=False)
    advanced_analytics: bool = Field(default=False)
    is_active: bool = Field(default=True)
    is_featured: bool = Field(default=False)
    sort_order: int = Field(default=0)

class PricingPlanUpdate(BaseModel):
    """Schema for updating a pricing plan."""
    display_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None)
    price_monthly: Optional[int] = Field(None, ge=0)
    price_yearly: Optional[int] = Field(None, ge=0)
    monthly_token_limit: Optional[int] = Field(None, ge=0)
    monthly_request_limit: Optional[int] = Field(None, ge=0)
    included_credits: Optional[int] = Field(None, ge=0)
    rag_access: Optional[bool] = Field(None)
    custom_characters: Optional[bool] = Field(None)
    priority_support: Optional[bool] = Field(None)
    api_access: Optional[bool] = Field(None)
    advanced_analytics: Optional[bool] = Field(None)
    is_active: Optional[bool] = Field(None)
    is_featured: Optional[bool] = Field(None)
    sort_order: Optional[int] = Field(None)

class PricingPlanResponse(BaseModel):
    """Schema for pricing plan response."""
    id: str
    name: str
    display_name: str
    description: Optional[str]
    price_monthly: int
    price_yearly: Optional[int]
    currency: str
    monthly_token_limit: int
    monthly_request_limit: int
    included_credits: int
    rag_access: bool
    custom_characters: bool
    priority_support: bool
    api_access: bool
    advanced_analytics: bool
    is_active: bool
    is_featured: bool
    sort_order: int
    created_at: str
    updated_at: str

class CreditPackageCreate(BaseModel):
    """Schema for creating a credit package."""
    name: str = Field(..., max_length=100)
    display_name: str = Field(..., max_length=255)
    description: Optional[str] = Field(None)
    credit_amount: int = Field(..., ge=1)
    bonus_credits: int = Field(default=0, ge=0)
    price: int = Field(..., ge=1)  # Price in cents
    original_price: Optional[int] = Field(None, ge=1)
    is_popular: bool = Field(default=False)
    discount_percentage: int = Field(default=0, ge=0, le=100)
    is_active: bool = Field(default=True)
    sort_order: int = Field(default=0)

class CreditPackageUpdate(BaseModel):
    """Schema for updating a credit package."""
    display_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None)
    credit_amount: Optional[int] = Field(None, ge=1)
    bonus_credits: Optional[int] = Field(None, ge=0)
    price: Optional[int] = Field(None, ge=1)
    original_price: Optional[int] = Field(None, ge=1)
    is_popular: Optional[bool] = Field(None)
    discount_percentage: Optional[int] = Field(None, ge=0, le=100)
    is_active: Optional[bool] = Field(None)
    sort_order: Optional[int] = Field(None)

class CreditPackageResponse(BaseModel):
    """Schema for credit package response."""
    id: str
    name: str
    display_name: str
    description: Optional[str]
    credit_amount: int
    bonus_credits: int
    total_credits: int
    price: int
    original_price: Optional[int]
    currency: str
    is_popular: bool
    discount_percentage: int
    is_active: bool
    sort_order: int
    created_at: str
    updated_at: str

# =============================================================================
# DEPENDENCY FUNCTIONS
# =============================================================================

async def verify_admin_access(settings: Settings = Depends(get_settings)):
    """Verify admin access (simplified for development)."""
    # TODO: Implement proper admin authentication
    logger.info("Admin access verified (development mode)")
    return {"admin": True}

# =============================================================================
# ADMIN AUTHENTICATION ENDPOINTS
# =============================================================================

@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(
    login_data: AdminLoginRequest,
    db: AsyncSession = Depends(get_async_session)
):
    """Admin login endpoint."""
    try:
        auth_service = AuthService()
        
        # Authenticate user with email and password
        user = await auth_service.authenticate_user(
            email=login_data.email,
            password=login_data.password,
            db=db
        )
        
        if not user:
            # Demo admin fallback for development
            if login_data.email == "admin@histora.com" and login_data.password == "admin123":
                # Check if demo admin exists
                demo_query = select(User).where(User.email == "admin@histora.com")
                result = await db.execute(demo_query)
                demo_user = result.scalar_one_or_none()
                
                if not demo_user:
                    # Create demo admin user
                    demo_admin = User(
                        firebase_uid="admin-001",
                        email="admin@histora.com",
                        password_hash=auth_service.hash_password("admin123"),
                        display_name="Admin User",
                        full_name="Demo Admin",
                        role="admin",
                        language_preference="tr",
                        is_admin=True,
                        is_active=True,
                        email_verified=True
                    )
                    db.add(demo_admin)
                    await db.commit()
                    await db.refresh(demo_admin)
                    user = demo_admin
                else:
                    user = demo_user
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
        
        # Verify user is admin
        if not user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Create proper token data
        token_data = {
            "sub": str(user.id),  # Use 'sub' for compatibility with get_current_user
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role,
            "is_admin": user.is_admin
        }
        
        # Generate token
        token = auth_service.create_access_token(token_data)
        
        return AdminLoginResponse(
            user={
                "id": str(user.id),
                "email": user.email,
                "display_name": user.display_name or user.full_name,
                "role": user.role,
                "is_admin": user.is_admin
            },
            access_token=token
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

# =============================================================================
# CHARACTER MANAGEMENT ENDPOINTS
# =============================================================================

@router.get("/characters", response_model=List[CharacterResponse])
async def list_characters(
    published_only: bool = False,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """List all characters."""
    try:
        query = select(Character)
        
        if published_only:
            query = query.where(Character.is_published == True)
        
        if category:
            query = query.where(Character.category == category)
        
        query = query.order_by(Character.created_at.desc())
        
        result = await db.execute(query)
        characters = result.scalars().all()
        
        # Simple response without RAG stats
        character_responses = []
        for char in characters:
            character_response = CharacterResponse(
                id=char.id,
                name=char.name,
                title=char.title,
                birth_year=char.birth_year,
                death_year=char.death_year,
                nationality=char.nationality,
                category=char.category,
                description=char.description,
                avatar_url=char.avatar_url,
                personality_traits=char.personality_traits or [],
                speaking_style=char.speaking_style,
                knowledge_context=char.knowledge_context,
                supported_languages=char.supported_languages or ["tr", "en"],
                is_published=char.is_published,
                is_featured=char.is_featured,
                created_at=char.created_at.isoformat(),
                updated_at=char.updated_at.isoformat()
            )
            character_responses.append(character_response)
        
        return character_responses
        
    except Exception as e:
        logger.error(f"Failed to list characters: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list characters"
        )

@router.post("/characters", response_model=CharacterResponse)
async def create_character(
    character: CharacterCreate,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Create a new character."""
    try:
        # Check if character ID already exists
        existing = await db.execute(
            select(Character).where(Character.id == character.id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Character with ID '{character.id}' already exists"
            )
        
        # Create new character
        new_character = Character(
            id=character.id,
            name=character.name,
            title=character.title,
            birth_year=character.birth_year,
            death_year=character.death_year,
            nationality=character.nationality,
            category=character.category,
            description=character.description,
            avatar_url=character.avatar_url,
            system_prompt=character.system_prompt,
            personality_traits=character.personality_traits,
            speaking_style=character.speaking_style,
            knowledge_context=character.knowledge_context,
            supported_languages=character.supported_languages or ["tr", "en"],
            is_published=character.is_published,
            is_featured=False  # New characters are not featured by default
        )
        
        db.add(new_character)
        await db.commit()
        await db.refresh(new_character)
        
        response = CharacterResponse(
            id=new_character.id,
            name=new_character.name,
            title=new_character.title,
            birth_year=new_character.birth_year,
            death_year=new_character.death_year,
            nationality=new_character.nationality,
            category=new_character.category,
            description=new_character.description,
            avatar_url=new_character.avatar_url,
            personality_traits=new_character.personality_traits or [],
            speaking_style=new_character.speaking_style,
            knowledge_context=new_character.knowledge_context,
            supported_languages=new_character.supported_languages or ["tr", "en"],
            is_published=new_character.is_published,
            is_featured=new_character.is_featured,
            created_at=new_character.created_at.isoformat(),
            updated_at=new_character.updated_at.isoformat()
        )
        
        logger.info(f"Created character: {new_character.id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to create character: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create character"
        )

@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(get_async_session),
    _: None = Depends(verify_admin_access)
) -> Dict[str, Any]:
    """Get comprehensive admin statistics for dashboard."""
    try:
        logger.info("Getting comprehensive admin statistics")
        
        # Import required models
        from app.models.database import Character, User, ChatSession, ChatMessage
        
        # Character stats
        characters_query = select(func.count(Character.id)).select_from(Character)
        published_query = select(func.count(Character.id)).select_from(Character).where(Character.is_published == True)
        
        # User stats
        users_query = select(func.count(User.id)).select_from(User)
        active_users_query = select(func.count(User.id)).select_from(User).where(User.is_active == True)
        
        # Token/Credit usage stats (mock data for now)
        total_tokens_consumed = 1240567
        total_credits_distributed = 45230
        total_credits_used = 32145
        
        # Revenue stats (mock data for now)
        monthly_revenue = 8950
        monthly_new_users = 156
        
        # Knowledge source stats (mock data for now)
        total_sources = 3
        processed_sources = 3
        total_chunks = 5
        
        # Execute queries
        total_characters = (await db.execute(characters_query)).scalar() or 0
        published_characters = (await db.execute(published_query)).scalar() or 0
        total_users = (await db.execute(users_query)).scalar() or 0
        active_users = (await db.execute(active_users_query)).scalar() or 0
        
        # Top characters (mock data for now)
        top_characters = [
            {"character_id": "ataturk-001", "name": "Mustafa Kemal Atatürk", "usage_count": 342, "tokens_consumed": 125430},
            {"character_id": "mevlana-001", "name": "Mevlana Celaleddin Rumi", "usage_count": 198, "tokens_consumed": 89245},
            {"character_id": "konfucyus-001", "name": "Konfüçyüs", "usage_count": 156, "tokens_consumed": 67892}
        ]
        
        # Recent activity (mock data for now)
        recent_activity = [
            {"type": "user_registration", "description": "24 yeni kullanıcı kaydı", "timestamp": datetime.now().isoformat(), "user_count": 24},
            {"type": "token_usage", "description": "15,420 token kullanımı", "timestamp": datetime.now().isoformat(), "tokens": 15420},
            {"type": "credit_purchase", "description": "1,250 kredi satışı", "timestamp": datetime.now().isoformat()},
            {"type": "character_chat", "description": "89 yeni sohbet başlatıldı", "timestamp": datetime.now().isoformat()}
        ]
        
        # RAG health (mock data for now)
        rag_health = {
            "status": "healthy",
            "openai_configured": False,  # Mock value
            "chroma_connected": True,    # Mock value
            "collection_count": 5        # Mock value
        }
        
        stats = {
            "total_characters": total_characters,
            "published_characters": published_characters,
            "total_sources": total_sources,
            "processed_sources": processed_sources,
            "total_chunks": total_chunks,
            "total_users": total_users,
            "active_users": active_users,
            "total_tokens_consumed": total_tokens_consumed,
            "total_credits_distributed": total_credits_distributed,
            "total_credits_used": total_credits_used,
            "monthly_revenue": monthly_revenue,
            "monthly_new_users": monthly_new_users,
            "top_characters": top_characters,
            "recent_activity": recent_activity,
            "rag_health": rag_health
        }
        
        logger.info(f"Admin stats retrieved successfully: {total_characters} characters, {total_users} users")
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get admin stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve admin statistics"
        )

@router.get("/health")
async def admin_health_check():
    """Admin service health check."""
    return {
        "status": "healthy",
        "service": "admin",
        "features": [
            "character_management",
            "system_stats",
            "pricing_management",
            "user_management"
        ]
    }

# =============================================================================
# PRICING PLAN MANAGEMENT ENDPOINTS
# =============================================================================

@router.get("/pricing-plans", response_model=List[PricingPlanResponse])
async def list_pricing_plans(
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """List all pricing plans."""
    try:
        query = select(PricingPlan).order_by(PricingPlan.sort_order)
        result = await db.execute(query)
        plans = result.scalars().all()
        
        plan_responses = []
        for plan in plans:
            plan_response = PricingPlanResponse(
                id=str(plan.id),
                name=plan.name,
                display_name=plan.display_name,
                description=plan.description,
                price_monthly=plan.price_monthly,
                price_yearly=plan.price_yearly,
                currency="USD",
                monthly_token_limit=plan.monthly_token_limit,
                monthly_request_limit=plan.monthly_request_limit,
                included_credits=plan.included_credits,
                rag_access=plan.rag_access,
                custom_characters=plan.custom_characters,
                priority_support=plan.priority_support,
                api_access=plan.api_access,
                advanced_analytics=plan.advanced_analytics,
                is_active=plan.is_active,
                is_featured=plan.is_featured,
                sort_order=plan.sort_order,
                created_at=plan.created_at.isoformat(),
                updated_at=plan.updated_at.isoformat()
            )
            plan_responses.append(plan_response)
        
        return plan_responses
        
    except Exception as e:
        logger.error(f"Failed to list pricing plans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list pricing plans"
        )

@router.post("/pricing-plans", response_model=PricingPlanResponse)
async def create_pricing_plan(
    plan: PricingPlanCreate,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Create a new pricing plan."""
    try:
        new_plan = PricingPlan(
            name=plan.name,
            display_name=plan.display_name,
            description=plan.description,
            price_monthly=plan.price_monthly,
            price_yearly=plan.price_yearly,
            monthly_token_limit=plan.monthly_token_limit,
            monthly_request_limit=plan.monthly_request_limit,
            included_credits=plan.included_credits,
            rag_access=plan.rag_access,
            custom_characters=plan.custom_characters,
            priority_support=plan.priority_support,
            api_access=plan.api_access,
            advanced_analytics=plan.advanced_analytics,
            is_active=plan.is_active,
            is_featured=plan.is_featured,
            sort_order=plan.sort_order
        )
        
        db.add(new_plan)
        await db.commit()
        await db.refresh(new_plan)
        
        response = PricingPlanResponse(
            id=str(new_plan.id),
            name=new_plan.name,
            display_name=new_plan.display_name,
            description=new_plan.description,
            price_monthly=new_plan.price_monthly,
            price_yearly=new_plan.price_yearly,
            currency="USD",
            monthly_token_limit=new_plan.monthly_token_limit,
            monthly_request_limit=new_plan.monthly_request_limit,
            included_credits=new_plan.included_credits,
            rag_access=new_plan.rag_access,
            custom_characters=new_plan.custom_characters,
            priority_support=new_plan.priority_support,
            api_access=new_plan.api_access,
            advanced_analytics=new_plan.advanced_analytics,
            is_active=new_plan.is_active,
            is_featured=new_plan.is_featured,
            sort_order=new_plan.sort_order,
            created_at=new_plan.created_at.isoformat(),
            updated_at=new_plan.updated_at.isoformat()
        )
        
        logger.info(f"Created pricing plan: {new_plan.name}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to create pricing plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create pricing plan"
        )

@router.get("/pricing-plans/{plan_id}", response_model=PricingPlanResponse)
async def get_pricing_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Get pricing plan details."""
    try:
        result = await db.execute(
            select(PricingPlan).where(PricingPlan.id == plan_id)
        )
        plan = result.scalar_one_or_none()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pricing plan '{plan_id}' not found"
            )
        
        response = PricingPlanResponse(
            id=str(plan.id),
            name=plan.name,
            display_name=plan.display_name,
            description=plan.description,
            price_monthly=plan.price_monthly,
            price_yearly=plan.price_yearly,
            currency="USD",
            monthly_token_limit=plan.monthly_token_limit,
            monthly_request_limit=plan.monthly_request_limit,
            included_credits=plan.included_credits,
            rag_access=plan.rag_access,
            custom_characters=plan.custom_characters,
            priority_support=plan.priority_support,
            api_access=plan.api_access,
            advanced_analytics=plan.advanced_analytics,
            is_active=plan.is_active,
            is_featured=plan.is_featured,
            sort_order=plan.sort_order,
            created_at=plan.created_at.isoformat(),
            updated_at=plan.updated_at.isoformat()
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get pricing plan {plan_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve pricing plan"
        )

@router.patch("/pricing-plans/{plan_id}", response_model=PricingPlanResponse)
async def update_pricing_plan(
    plan_id: str,
    plan_update: PricingPlanUpdate,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Update pricing plan details."""
    try:
        # Get existing plan
        result = await db.execute(
            select(PricingPlan).where(PricingPlan.id == plan_id)
        )
        plan = result.scalar_one_or_none()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pricing plan '{plan_id}' not found"
            )
        
        # Update only provided fields
        update_data = plan_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(plan, field, value)
        
        await db.commit()
        await db.refresh(plan)
        
        response = PricingPlanResponse(
            id=str(plan.id),
            name=plan.name,
            display_name=plan.display_name,
            description=plan.description,
            price_monthly=plan.price_monthly,
            price_yearly=plan.price_yearly,
            currency="USD",
            monthly_token_limit=plan.monthly_token_limit,
            monthly_request_limit=plan.monthly_request_limit,
            included_credits=plan.included_credits,
            rag_access=plan.rag_access,
            custom_characters=plan.custom_characters,
            priority_support=plan.priority_support,
            api_access=plan.api_access,
            advanced_analytics=plan.advanced_analytics,
            is_active=plan.is_active,
            is_featured=plan.is_featured,
            sort_order=plan.sort_order,
            created_at=plan.created_at.isoformat(),
            updated_at=plan.updated_at.isoformat()
        )
        
        logger.info(f"Updated pricing plan: {plan.name}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to update pricing plan {plan_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update pricing plan"
        )

@router.delete("/pricing-plans/{plan_id}")
async def delete_pricing_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Delete a pricing plan."""
    try:
        # Get plan
        result = await db.execute(
            select(PricingPlan).where(PricingPlan.id == plan_id)
        )
        plan = result.scalar_one_or_none()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Pricing plan '{plan_id}' not found"
            )
        
        # Delete the plan
        await db.delete(plan)
        await db.commit()
        
        logger.info(f"Deleted pricing plan: {plan.name}")
        return {"message": f"Pricing plan '{plan.name}' deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to delete pricing plan {plan_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete pricing plan: {str(e)}"
        )

# =============================================================================
# CREDIT PACKAGE MANAGEMENT ENDPOINTS
# =============================================================================

@router.get("/credit-packages", response_model=List[CreditPackageResponse])
async def list_credit_packages(
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """List all credit packages."""
    try:
        query = select(CreditPackage).order_by(CreditPackage.sort_order)
        result = await db.execute(query)
        packages = result.scalars().all()
        
        package_responses = []
        for package in packages:
            package_response = CreditPackageResponse(
                id=str(package.id),
                name=package.name,
                display_name=package.display_name,
                description=package.description,
                credit_amount=package.credit_amount,
                bonus_credits=package.bonus_credits,
                total_credits=package.credit_amount + package.bonus_credits,
                price=package.price,
                original_price=package.original_price,
                currency="USD",
                is_popular=package.is_popular,
                discount_percentage=package.discount_percentage,
                is_active=package.is_active,
                sort_order=package.sort_order,
                created_at=package.created_at.isoformat(),
                updated_at=package.updated_at.isoformat()
            )
            package_responses.append(package_response)
        
        return package_responses
        
    except Exception as e:
        logger.error(f"Failed to list credit packages: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list credit packages"
        )

@router.post("/credit-packages", response_model=CreditPackageResponse)
async def create_credit_package(
    package: CreditPackageCreate,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Create a new credit package."""
    try:
        new_package = CreditPackage(
            name=package.name,
            display_name=package.display_name,
            description=package.description,
            credit_amount=package.credit_amount,
            bonus_credits=package.bonus_credits,
            price=package.price,
            original_price=package.original_price,
            is_popular=package.is_popular,
            discount_percentage=package.discount_percentage,
            is_active=package.is_active,
            sort_order=package.sort_order
        )
        
        db.add(new_package)
        await db.commit()
        await db.refresh(new_package)
        
        response = CreditPackageResponse(
            id=str(new_package.id),
            name=new_package.name,
            display_name=new_package.display_name,
            description=new_package.description,
            credit_amount=new_package.credit_amount,
            bonus_credits=new_package.bonus_credits,
            total_credits=new_package.credit_amount + new_package.bonus_credits,
            price=new_package.price,
            original_price=new_package.original_price,
            currency="USD",
            is_popular=new_package.is_popular,
            discount_percentage=new_package.discount_percentage,
            is_active=new_package.is_active,
            sort_order=new_package.sort_order,
            created_at=new_package.created_at.isoformat(),
            updated_at=new_package.updated_at.isoformat()
        )
        
        logger.info(f"Created credit package: {new_package.name}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to create credit package: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create credit package"
        )

@router.get("/credit-packages/{package_id}", response_model=CreditPackageResponse)
async def get_credit_package(
    package_id: str,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Get credit package details."""
    try:
        result = await db.execute(
            select(CreditPackage).where(CreditPackage.id == package_id)
        )
        package = result.scalar_one_or_none()
        
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Credit package '{package_id}' not found"
            )
        
        response = CreditPackageResponse(
            id=str(package.id),
            name=package.name,
            display_name=package.display_name,
            description=package.description,
            credit_amount=package.credit_amount,
            bonus_credits=package.bonus_credits,
            total_credits=package.credit_amount + package.bonus_credits,
            price=package.price,
            original_price=package.original_price,
            currency="USD",
            is_popular=package.is_popular,
            discount_percentage=package.discount_percentage,
            is_active=package.is_active,
            sort_order=package.sort_order,
            created_at=package.created_at.isoformat(),
            updated_at=package.updated_at.isoformat()
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get credit package {package_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve credit package"
        )

@router.patch("/credit-packages/{package_id}", response_model=CreditPackageResponse)
async def update_credit_package(
    package_id: str,
    package_update: CreditPackageUpdate,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Update credit package details."""
    try:
        # Get existing package
        result = await db.execute(
            select(CreditPackage).where(CreditPackage.id == package_id)
        )
        package = result.scalar_one_or_none()
        
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Credit package '{package_id}' not found"
            )
        
        # Update only provided fields
        update_data = package_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(package, field, value)
        
        await db.commit()
        await db.refresh(package)
        
        response = CreditPackageResponse(
            id=str(package.id),
            name=package.name,
            display_name=package.display_name,
            description=package.description,
            credit_amount=package.credit_amount,
            bonus_credits=package.bonus_credits,
            total_credits=package.credit_amount + package.bonus_credits,
            price=package.price,
            original_price=package.original_price,
            currency="USD",
            is_popular=package.is_popular,
            discount_percentage=package.discount_percentage,
            is_active=package.is_active,
            sort_order=package.sort_order,
            created_at=package.created_at.isoformat(),
            updated_at=package.updated_at.isoformat()
        )
        
        logger.info(f"Updated credit package: {package.name}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to update credit package: {package_data.name}", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update credit package"
        )

@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(get_async_session),
    _: None = Depends(verify_admin_access)
) -> Dict[str, Any]:
    """Get comprehensive admin statistics."""
    try:
        logger.info("Getting admin statistics")
        
        # Character stats
        characters_query = select(func.count(Character.id)).select_from(Character)
        published_query = select(func.count(Character.id)).select_from(Character).where(Character.is_published == True)
        
        # User stats
        users_query = select(func.count(User.id)).select_from(User)
        admin_users_query = select(func.count(User.id)).select_from(User).where(User.is_admin == True)
        
        # Execute all queries
        total_characters = (await db.execute(characters_query)).scalar() or 0
        published_characters = (await db.execute(published_query)).scalar() or 0
        total_users = (await db.execute(users_query)).scalar() or 0
        admin_users = (await db.execute(admin_users_query)).scalar() or 0
        
        # Calculate percentages
        publish_rate = (published_characters / total_characters * 100) if total_characters > 0 else 0
        
        stats = {
            "characters": {
                "total": total_characters,
                "published": published_characters,
                "unpublished": total_characters - published_characters,
                "publish_rate": round(publish_rate, 1)
            },
            "users": {
                "total": total_users,
                "admin": admin_users,
                "regular": total_users - admin_users
            },
            "system": {
                "status": "healthy",
                "database": "connected",
                "ai_service": "active"
            }
        }
        
        logger.info(f"Admin stats retrieved successfully: {total_characters} characters, {total_users} users")
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get admin stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve admin statistics"
        )


# =============================================================================
# USER MANAGEMENT ENDPOINTS
# =============================================================================

class UserResponse(BaseModel):
    """Schema for user response."""
    id: str
    email: str
    display_name: Optional[str]
    role: str
    is_active: bool
    credits: int
    total_tokens: int
    total_credits_used: int
    total_credits_purchased: int
    last_login_at: Optional[str]
    created_at: str
    current_plan: str
    monthly_usage: Dict[str, int]

class UserListResponse(BaseModel):
    """Schema for user list response."""
    users: List[UserResponse]
    total: int
    page: int
    per_page: int
    pages: int

class UpdateUserRole(BaseModel):
    """Schema for updating user role."""
    role: str

class UpdateUserStatus(BaseModel):
    """Schema for updating user status."""
    is_active: bool

@router.get("/users", response_model=UserListResponse)
async def get_all_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Get all users with filtering and pagination."""
    try:
        from sqlalchemy import or_, desc, asc
        
        query = select(User)
        
        # Apply filters
        if search:
            query = query.where(
                or_(
                    User.email.ilike(f"%{search}%"),
                    User.display_name.ilike(f"%{search}%")
                )
            )
        
        if role:
            query = query.where(User.role == role)
        
        if status == "active":
            query = query.where(User.is_active == True)
        elif status == "inactive":
            query = query.where(User.is_active == False)
        
        # Apply sorting
        sort_column = getattr(User, sort_by, User.created_at)
        if sort_order == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
        
        # Get total count
        count_query = select(func.count(User.id)).select_from(User)
        if search:
            count_query = count_query.where(
                or_(
                    User.email.ilike(f"%{search}%"),
                    User.display_name.ilike(f"%{search}%")
                )
            )
        if role:
            count_query = count_query.where(User.role == role)
        if status == "active":
            count_query = count_query.where(User.is_active == True)
        elif status == "inactive":
            count_query = count_query.where(User.is_active == False)
        
        total = (await db.execute(count_query)).scalar() or 0
        
        # Apply pagination
        query = query.offset(offset).limit(limit)
        
        result = await db.execute(query)
        users = result.scalars().all()
        
        # Build response
        user_responses = []
        for user in users:
            # Mock monthly usage data
            monthly_usage = {
                "tokens": user.total_tokens or 0,
                "credits": user.total_credits_used or 0,
                "conversations": 10  # Mock data
            }
            
            user_response = UserResponse(
                id=str(user.id),
                email=user.email,
                display_name=user.display_name,
                role=user.role,
                is_active=getattr(user, 'is_active', True),
                credits=getattr(user, 'credits', 0),
                total_tokens=getattr(user, 'total_tokens', 0),
                total_credits_used=getattr(user, 'total_credits_used', 0),
                total_credits_purchased=getattr(user, 'total_credits_purchased', 0),
                last_login_at=getattr(user, 'last_login_at', None),
                created_at=user.created_at.isoformat(),
                current_plan=getattr(user, 'current_plan', 'free'),
                monthly_usage=monthly_usage
            )
            user_responses.append(user_response)
        
        pages = (total + limit - 1) // limit
        page = (offset // limit) + 1
        
        return UserListResponse(
            users=user_responses,
            total=total,
            page=page,
            per_page=limit,
            pages=pages
        )
        
    except Exception as e:
        logger.error(f"Failed to get users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role_update: UpdateUserRole,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Update a user's role."""
    try:
        # Get user
        query = select(User).where(User.id == user_id)
        result = await db.execute(query)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update role
        user.role = role_update.role
        await db.commit()
        
        logger.info(f"User {user_id} role updated to {role_update.role}")
        return {"message": "User role updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to update user role: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user role"
        )

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    status_update: UpdateUserStatus,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Update a user's active status."""
    try:
        # Get user
        query = select(User).where(User.id == user_id)
        result = await db.execute(query)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update status
        if hasattr(user, 'is_active'):
            user.is_active = status_update.is_active
        else:
            # Add the field if it doesn't exist
            setattr(user, 'is_active', status_update.is_active)
        
        await db.commit()
        
        status_text = "activated" if status_update.is_active else "deactivated"
        logger.info(f"User {user_id} {status_text}")
        return {"message": f"User {status_text} successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to update user status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user status"
        )

@router.get("/health")
async def admin_health_check():
    """Admin service health check."""
    return {
        "status": "healthy",
        "service": "admin",
        "features": [
            "character_management",
            "user_management",
            "pricing_management",
            "system_stats"
        ]
    }

# =============================================================================
# PRICING PLAN MANAGEMENT ENDPOINTS
# =============================================================================

@router.get("/pricing-plans", response_model=List[PricingPlanResponse])
async def get_pricing_plans(
    active_only: bool = False,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Get all pricing plans."""
    try:
        query = select(PricingPlan)
        
        if active_only:
            query = query.where(PricingPlan.is_active == True)
        
        query = query.order_by(PricingPlan.sort_order, PricingPlan.price_monthly)
        
        result = await db.execute(query)
        plans = result.scalars().all()
        
        return [
            PricingPlanResponse(
                id=str(plan.id),
                name=plan.name,
                display_name=plan.display_name,
                description=plan.description,
                price_monthly=plan.price_monthly,
                price_yearly=plan.price_yearly,
                currency=plan.currency,
                monthly_token_limit=plan.monthly_token_limit,
                monthly_request_limit=plan.monthly_request_limit,
                included_credits=plan.included_credits,
                rag_access=plan.rag_access,
                custom_characters=plan.custom_characters,
                priority_support=plan.priority_support,
                api_access=plan.api_access,
                advanced_analytics=plan.advanced_analytics,
                is_active=plan.is_active,
                is_featured=plan.is_featured,
                sort_order=plan.sort_order,
                created_at=plan.created_at.isoformat(),
                updated_at=plan.updated_at.isoformat()
            )
            for plan in plans
        ]
        
    except Exception as e:
        logger.error(f"Failed to get pricing plans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve pricing plans"
        )

@router.post("/pricing-plans", response_model=PricingPlanResponse)
async def create_pricing_plan(
    plan_data: PricingPlanCreate,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Create a new pricing plan."""
    try:
        # Check if plan name already exists
        existing_query = select(PricingPlan).where(PricingPlan.name == plan_data.name)
        existing_result = await db.execute(existing_query)
        if existing_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Plan with this name already exists"
            )
        
        # Calculate total credits
        total_credits = plan_data.included_credits
        
        # Create plan
        plan = PricingPlan(
            name=plan_data.name,
            display_name=plan_data.display_name,
            description=plan_data.description,
            price_monthly=plan_data.price_monthly,
            price_yearly=plan_data.price_yearly,
            monthly_token_limit=plan_data.monthly_token_limit,
            monthly_request_limit=plan_data.monthly_request_limit,
            included_credits=plan_data.included_credits,
            rag_access=plan_data.rag_access,
            custom_characters=plan_data.custom_characters,
            priority_support=plan_data.priority_support,
            api_access=plan_data.api_access,
            advanced_analytics=plan_data.advanced_analytics,
            is_active=plan_data.is_active,
            is_featured=plan_data.is_featured,
            sort_order=plan_data.sort_order
        )
        
        db.add(plan)
        await db.commit()
        await db.refresh(plan)
        
        logger.info(f"Created pricing plan: {plan.name}")
        
        return PricingPlanResponse(
            id=str(plan.id),
            name=plan.name,
            display_name=plan.display_name,
            description=plan.description,
            price_monthly=plan.price_monthly,
            price_yearly=plan.price_yearly,
            currency=plan.currency,
            monthly_token_limit=plan.monthly_token_limit,
            monthly_request_limit=plan.monthly_request_limit,
            included_credits=plan.included_credits,
            rag_access=plan.rag_access,
            custom_characters=plan.custom_characters,
            priority_support=plan.priority_support,
            api_access=plan.api_access,
            advanced_analytics=plan.advanced_analytics,
            is_active=plan.is_active,
            is_featured=plan.is_featured,
            sort_order=plan.sort_order,
            created_at=plan.created_at.isoformat(),
            updated_at=plan.updated_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to create pricing plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create pricing plan"
        )

@router.put("/pricing-plans/{plan_id}", response_model=PricingPlanResponse)
async def update_pricing_plan(
    plan_id: str,
    plan_data: PricingPlanUpdate,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Update an existing pricing plan."""
    try:
        # Get plan
        query = select(PricingPlan).where(PricingPlan.id == plan_id)
        result = await db.execute(query)
        plan = result.scalar_one_or_none()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pricing plan not found"
            )
        
        # Update fields
        update_data = plan_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(plan, field, value)
        
        await db.commit()
        await db.refresh(plan)
        
        logger.info(f"Updated pricing plan: {plan.name}")
        
        return PricingPlanResponse(
            id=str(plan.id),
            name=plan.name,
            display_name=plan.display_name,
            description=plan.description,
            price_monthly=plan.price_monthly,
            price_yearly=plan.price_yearly,
            currency=plan.currency,
            monthly_token_limit=plan.monthly_token_limit,
            monthly_request_limit=plan.monthly_request_limit,
            included_credits=plan.included_credits,
            rag_access=plan.rag_access,
            custom_characters=plan.custom_characters,
            priority_support=plan.priority_support,
            api_access=plan.api_access,
            advanced_analytics=plan.advanced_analytics,
            is_active=plan.is_active,
            is_featured=plan.is_featured,
            sort_order=plan.sort_order,
            created_at=plan.created_at.isoformat(),
            updated_at=plan.updated_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to update pricing plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update pricing plan"
        )

@router.delete("/pricing-plans/{plan_id}")
async def delete_pricing_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Delete a pricing plan."""
    try:
        # Get plan
        query = select(PricingPlan).where(PricingPlan.id == plan_id)
        result = await db.execute(query)
        plan = result.scalar_one_or_none()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pricing plan not found"
            )
        
        # Check if plan is in use
        subscription_query = select(UserSubscription).where(UserSubscription.plan_id == plan_id)
        subscription_result = await db.execute(subscription_query)
        if subscription_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete plan that has active subscriptions"
            )
        
        await db.delete(plan)
        await db.commit()
        
        logger.info(f"Deleted pricing plan: {plan.name}")
        return {"message": "Pricing plan deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to delete pricing plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete pricing plan"
        )

# =============================================================================
# CREDIT PACKAGE MANAGEMENT ENDPOINTS
# =============================================================================

@router.get("/credit-packages", response_model=List[CreditPackageResponse])
async def get_credit_packages(
    active_only: bool = False,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Get all credit packages."""
    try:
        query = select(CreditPackage)
        
        if active_only:
            query = query.where(CreditPackage.is_active == True)
        
        query = query.order_by(CreditPackage.sort_order, CreditPackage.price)
        
        result = await db.execute(query)
        packages = result.scalars().all()
        
        return [
            CreditPackageResponse(
                id=str(package.id),
                name=package.name,
                display_name=package.display_name,
                description=package.description,
                credit_amount=package.credit_amount,
                bonus_credits=package.bonus_credits,
                total_credits=package.total_credits,
                price=package.price,
                original_price=package.original_price,
                currency=package.currency,
                is_popular=package.is_popular,
                discount_percentage=package.discount_percentage,
                is_active=package.is_active,
                sort_order=package.sort_order,
                created_at=package.created_at.isoformat(),
                updated_at=package.updated_at.isoformat()
            )
            for package in packages
        ]
        
    except Exception as e:
        logger.error(f"Failed to get credit packages: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve credit packages"
        )

@router.post("/credit-packages", response_model=CreditPackageResponse)
async def create_credit_package(
    package_data: CreditPackageCreate,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Create a new credit package."""
    try:
        # Check if package name already exists
        existing_query = select(CreditPackage).where(CreditPackage.name == package_data.name)
        existing_result = await db.execute(existing_query)
        if existing_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Package with this name already exists"
            )
        
        # Calculate total credits
        total_credits = package_data.credit_amount + package_data.bonus_credits
        
        # Create package
        package = CreditPackage(
            name=package_data.name,
            display_name=package_data.display_name,
            description=package_data.description,
            credit_amount=package_data.credit_amount,
            bonus_credits=package_data.bonus_credits,
            total_credits=total_credits,
            price=package_data.price,
            original_price=package_data.original_price,
            is_popular=package_data.is_popular,
            discount_percentage=package_data.discount_percentage,
            is_active=package_data.is_active,
            sort_order=package_data.sort_order
        )
        
        db.add(package)
        await db.commit()
        await db.refresh(package)
        
        logger.info(f"Created credit package: {package.name}")
        
        return CreditPackageResponse(
            id=str(package.id),
            name=package.name,
            display_name=package.display_name,
            description=package.description,
            credit_amount=package.credit_amount,
            bonus_credits=package.bonus_credits,
            total_credits=package.total_credits,
            price=package.price,
            original_price=package.original_price,
            currency=package.currency,
            is_popular=package.is_popular,
            discount_percentage=package.discount_percentage,
            is_active=package.is_active,
            sort_order=package.sort_order,
            created_at=package.created_at.isoformat(),
            updated_at=package.updated_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to create credit package: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create credit package"
        )

@router.put("/credit-packages/{package_id}", response_model=CreditPackageResponse)
async def update_credit_package(
    package_id: str,
    package_data: CreditPackageUpdate,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Update an existing credit package."""
    try:
        # Get package
        query = select(CreditPackage).where(CreditPackage.id == package_id)
        result = await db.execute(query)
        package = result.scalar_one_or_none()
        
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Credit package not found"
            )
        
        # Update fields
        update_data = package_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(package, field, value)
        
        # Recalculate total credits if needed
        if 'credit_amount' in update_data or 'bonus_credits' in update_data:
            package.total_credits = package.credit_amount + package.bonus_credits
        
        await db.commit()
        await db.refresh(package)
        
        logger.info(f"Updated credit package: {package.name}")
        
        return CreditPackageResponse(
            id=str(package.id),
            name=package.name,
            display_name=package.display_name,
            description=package.description,
            credit_amount=package.credit_amount,
            bonus_credits=package.bonus_credits,
            total_credits=package.total_credits,
            price=package.price,
            original_price=package.original_price,
            currency=package.currency,
            is_popular=package.is_popular,
            discount_percentage=package.discount_percentage,
            is_active=package.is_active,
            sort_order=package.sort_order,
            created_at=package.created_at.isoformat(),
            updated_at=package.updated_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to update credit package: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update credit package"
        )

@router.delete("/credit-packages/{package_id}")
async def delete_credit_package(
    package_id: str,
    db: AsyncSession = Depends(get_async_session),
    admin: dict = Depends(verify_admin_access)
):
    """Delete a credit package."""
    try:
        # Get package
        query = select(CreditPackage).where(CreditPackage.id == package_id)
        result = await db.execute(query)
        package = result.scalar_one_or_none()
        
        if not package:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Credit package not found"
            )
        
        # Check if package is referenced in transactions
        transaction_query = select(CreditTransaction).where(
            CreditTransaction.package_name == package.display_name
        )
        transaction_result = await db.execute(transaction_query)
        if transaction_result.scalar_one_or_none():
            # Don't delete, just deactivate
            package.is_active = False
            await db.commit()
            logger.info(f"Deactivated credit package: {package.name}")
            return {"message": "Credit package deactivated (has transaction history)"}
        
        await db.delete(package)
        await db.commit()
        
        logger.info(f"Deleted credit package: {package.name}")
        return {"message": "Credit package deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to delete credit package: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete credit package"
        )