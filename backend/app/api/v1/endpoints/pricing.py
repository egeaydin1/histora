"""
Public pricing endpoints for Histora platform.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import structlog

from app.core.database import get_async_session
from app.models.database import PricingPlan, CreditPackage

logger = structlog.get_logger(__name__)

router = APIRouter()


@router.get("/plans")
async def get_pricing_plans(
    db: AsyncSession = Depends(get_async_session)
):
    """Get active pricing plans for public display."""
    try:
        # Get active pricing plans
        query = select(PricingPlan).where(PricingPlan.is_active == True).order_by(PricingPlan.sort_order)
        result = await db.execute(query)
        plans = result.scalars().all()
        
        # Format for frontend
        formatted_plans = []
        for plan in plans:
            formatted_plans.append({
                "id": str(plan.id),
                "name": plan.name,
                "display_name": plan.display_name,
                "description": plan.description,
                "price_monthly": plan.price_monthly,
                "price_yearly": plan.price_yearly,
                "currency": plan.currency,
                "monthly_token_limit": plan.monthly_token_limit,
                "monthly_request_limit": plan.monthly_request_limit,
                "included_credits": plan.included_credits,
                "features": {
                    "rag_access": plan.rag_access,
                    "custom_characters": plan.custom_characters,
                    "priority_support": plan.priority_support,
                    "api_access": plan.api_access,
                    "advanced_analytics": plan.advanced_analytics
                },
                "is_featured": plan.is_featured,
                "sort_order": plan.sort_order
            })
        
        return {"plans": formatted_plans}
        
    except Exception as e:
        logger.error("Failed to get pricing plans", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve pricing plans")


@router.get("/credits")
async def get_credit_packages(
    db: AsyncSession = Depends(get_async_session)
):
    """Get active credit packages for public display.""" 
    try:
        # Get active credit packages
        query = select(CreditPackage).where(CreditPackage.is_active == True).order_by(CreditPackage.sort_order)
        result = await db.execute(query)
        packages = result.scalars().all()
        
        # Format for frontend
        formatted_packages = []
        for package in packages:
            formatted_packages.append({
                "id": str(package.id),
                "name": package.name,
                "display_name": package.display_name,
                "description": package.description,
                "credit_amount": package.credit_amount,
                "bonus_credits": package.bonus_credits,
                "total_credits": package.total_credits,
                "price": package.price,
                "original_price": package.original_price,
                "currency": package.currency,
                "is_popular": package.is_popular,
                "discount_percentage": package.discount_percentage,
                "sort_order": package.sort_order
            })
        
        return {"packages": formatted_packages}
        
    except Exception as e:
        logger.error("Failed to get credit packages", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to retrieve credit packages")


@router.get("/health")
async def pricing_health_check():
    """Pricing service health check."""
    return {
        "status": "healthy",
        "service": "pricing",
        "endpoints": ["plans", "credits"]
    }