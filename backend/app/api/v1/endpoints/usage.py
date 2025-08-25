"""
User usage and billing endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.models.database import User
from app.services.usage_service import UsageService
from app.api.dependencies import get_current_user, get_current_admin

router = APIRouter()

class UsageStats(BaseModel):
    """User usage statistics response."""
    period_days: int
    total_tokens: int
    total_cost_cents: int
    total_requests: int
    daily_usage: Dict[str, Dict[str, int]]
    current_quota: Dict[str, Any]

class QuotaInfo(BaseModel):
    """User quota information."""
    plan_type: str
    tokens_used: int
    tokens_limit: int
    tokens_remaining: int
    requests_used: int
    requests_limit: int
    requests_remaining: int
    cost_this_month_cents: int
    rag_access: bool
    custom_characters: bool

class PlanUpgrade(BaseModel):
    """Plan upgrade request."""
    plan_type: str

class CreditPurchase(BaseModel):
    """Credit purchase request."""
    package_id: str
    amount: int

class AddCredits(BaseModel):
    """Admin add credits request."""
    user_id: str
    amount: int
    description: Optional[str] = None

@router.get("/stats", response_model=UsageStats)
async def get_usage_stats(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get user's token usage statistics."""
    usage_service = UsageService()
    
    try:
        stats = await usage_service.get_user_usage_stats(
            db_session=db,
            user_id=current_user.id,
            days=days
        )
        return UsageStats(**stats)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get usage stats: {str(e)}"
        )

@router.get("/quota", response_model=QuotaInfo)
async def get_quota_info(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get user's current quota information."""
    usage_service = UsageService()
    
    try:
        quota_check = await usage_service.check_user_limits(
            db_session=db,
            user_id=current_user.id
        )
        
        return QuotaInfo(**quota_check["quota"])
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get quota info: {str(e)}"
        )

@router.post("/upgrade")
async def upgrade_plan(
    upgrade_request: PlanUpgrade,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Upgrade user's subscription plan."""
    usage_service = UsageService()
    
    # Validate plan type
    valid_plans = ["free", "basic", "premium", "unlimited"]
    if upgrade_request.plan_type not in valid_plans:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid plan type. Must be one of: {valid_plans}"
        )
    
    try:
        result = await usage_service.upgrade_user_plan(
            db_session=db,
            user_id=current_user.id,
            plan_type=upgrade_request.plan_type
        )
        
        return {
            "message": f"Successfully upgraded to {upgrade_request.plan_type} plan",
            "plan_details": result
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upgrade plan: {str(e)}"
        )

@router.get("/plans")
async def get_available_plans():
    """Get available subscription plans and their features."""
    usage_service = UsageService()
    
    return {
        "plans": {
            "free": {
                "name": "Free",
                "price_monthly": 0,
                "features": usage_service.plan_limits["free"],
                "description": "Perfect for trying out Histora"
            },
            "basic": {
                "name": "Basic",
                "price_monthly": 999,  # $9.99
                "features": usage_service.plan_limits["basic"],
                "description": "For regular users who want RAG-enhanced conversations"
            },
            "premium": {
                "name": "Premium",
                "price_monthly": 2999,  # $29.99
                "features": usage_service.plan_limits["premium"],
                "description": "For power users who want to create custom characters"
            },
            "unlimited": {
                "name": "Unlimited",
                "price_monthly": 9999,  # $99.99
                "features": usage_service.plan_limits["unlimited"],
                "description": "For enterprises and heavy users"
            }
        },
        "model_pricing": usage_service.model_pricing
    }

# ================================
# CREDIT MANAGEMENT ENDPOINTS
# ================================

@router.get("/users/stats")
async def get_user_token_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get current user's comprehensive token and credit statistics."""
    from app.services.token_service import TokenCreditService
    
    try:
        service = TokenCreditService(db)
        stats = await service.get_user_stats(current_user.id)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user stats: {str(e)}"
        )

@router.post("/users/credits/purchase")
async def purchase_credits(
    purchase_request: CreditPurchase,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Purchase credits for the current user."""
    from app.services.token_service import TokenCreditService
    
    try:
        service = TokenCreditService(db)
        transaction = await service.add_credits(
            user_id=current_user.id,
            amount=purchase_request.amount,
            transaction_type="purchase",
            package_name=purchase_request.package_id,
            description=f"Credit purchase: {purchase_request.package_id}"
        )
        
        return {
            "message": "Credits purchased successfully",
            "transaction_id": transaction.id,
            "credits_added": purchase_request.amount,
            "new_balance": transaction.balance_after
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to purchase credits: {str(e)}"
        )

@router.get("/users/credits/transactions")
async def get_credit_transactions(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session)
):
    """Get user's credit transaction history."""
    from sqlalchemy import select, desc
    from app.models.database import CreditTransaction
    
    try:
        query = select(CreditTransaction).where(
            CreditTransaction.user_id == current_user.id
        ).order_by(desc(CreditTransaction.created_at)).offset(offset).limit(limit)
        
        result = await db.execute(query)
        transactions = result.scalars().all()
        
        return {
            "transactions": [
                {
                    "id": tx.id,
                    "type": tx.transaction_type,
                    "amount": tx.amount,
                    "balance_after": tx.balance_after,
                    "description": tx.description,
                    "created_at": tx.created_at.isoformat(),
                    "package_name": tx.package_name,
                    "tokens_consumed": tx.tokens_consumed
                }
                for tx in transactions
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get transactions: {str(e)}"
        )

# Admin endpoints
@router.get("/admin/users/{user_id}/stats", response_model=UsageStats)
async def admin_get_user_stats(
    user_id: str,
    days: int = 30,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_async_session)
):
    """Admin endpoint to get any user's usage statistics."""
    usage_service = UsageService()
    
    try:
        from uuid import UUID
        user_uuid = UUID(user_id)
        
        stats = await usage_service.get_user_usage_stats(
            db_session=db,
            user_id=user_uuid,
            days=days
        )
        return UsageStats(**stats)
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user stats: {str(e)}"
        )

@router.post("/admin/users/{user_id}/upgrade")
async def admin_upgrade_user(
    user_id: str,
    upgrade_request: PlanUpgrade,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_async_session)
):
    """Admin endpoint to upgrade any user's plan."""
    usage_service = UsageService()
    
    try:
        from uuid import UUID
        user_uuid = UUID(user_id)
        
        result = await usage_service.upgrade_user_plan(
            db_session=db,
            user_id=user_uuid,
            plan_type=upgrade_request.plan_type
        )
        
        return {
            "message": f"Successfully upgraded user {user_id} to {upgrade_request.plan_type} plan",
            "plan_details": result
        }
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format or plan type"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upgrade user plan: {str(e)}"
        )

# ================================
# ADMIN CREDIT MANAGEMENT
# ================================

@router.post("/admin/users/credits")
async def admin_add_credits(
    add_request: AddCredits,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_async_session)
):
    """Admin endpoint to add credits to any user."""
    from app.services.token_service import TokenCreditService
    
    try:
        service = TokenCreditService(db)
        transaction = await service.add_credits(
            user_id=add_request.user_id,
            amount=add_request.amount,
            transaction_type="admin_add",
            description=add_request.description or f"Admin added {add_request.amount} credits"
        )
        
        return {
            "message": "Credits added successfully",
            "transaction_id": transaction.id,
            "user_id": add_request.user_id,
            "credits_added": add_request.amount,
            "new_balance": transaction.balance_after
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add credits: {str(e)}"
        )

@router.get("/admin/users/{user_id}/stats")
async def admin_get_user_token_stats(
    user_id: str,
    admin_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_async_session)
):
    """Admin endpoint to get any user's token and credit statistics."""
    from app.services.token_service import TokenCreditService
    
    try:
        service = TokenCreditService(db)
        stats = await service.get_user_stats(user_id)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user stats: {str(e)}"
        )
