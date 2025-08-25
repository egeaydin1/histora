"""
Token usage tracking and billing service.
"""
import uuid
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional, List
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
import structlog

from app.models.database import User, UserUsage, UserQuota
from app.core.config import get_settings

logger = structlog.get_logger(__name__)

class UsageService:
    """Service for tracking user token usage and billing."""
    
    def __init__(self):
        self.settings = get_settings()
        
        # Model pricing (in cents per 1K tokens)
        self.model_pricing = {
            "meta-llama/llama-3.1-8b-instruct:free": {
                "input_cost_per_1k": 0,  # Free model
                "output_cost_per_1k": 0
            },
            "deepseek/deepseek-r1-0528:free": {
                "input_cost_per_1k": 0,  # Free model
                "output_cost_per_1k": 0
            },
            "meta-llama/llama-3.1-70b-instruct": {
                "input_cost_per_1k": 88,  # $0.88 per 1K tokens
                "output_cost_per_1k": 88
            },
            "gpt-4": {
                "input_cost_per_1k": 3000,  # $30 per 1K tokens
                "output_cost_per_1k": 6000   # $60 per 1K tokens
            },
            "text-embedding-3-small": {
                "input_cost_per_1k": 2,  # $0.02 per 1K tokens
                "output_cost_per_1k": 0   # No output cost for embeddings
            }
        }
        
        # Plan limits
        self.plan_limits = {
            "free": {
                "monthly_tokens": 10000,
                "monthly_requests": 100,
                "rag_access": False,
                "custom_characters": False
            },
            "basic": {
                "monthly_tokens": 100000,  # 100K tokens
                "monthly_requests": 1000,
                "rag_access": True,
                "custom_characters": False
            },
            "premium": {
                "monthly_tokens": 1000000,  # 1M tokens
                "monthly_requests": 10000,
                "rag_access": True,
                "custom_characters": True
            },
            "unlimited": {
                "monthly_tokens": 999999999,
                "monthly_requests": 999999999,
                "rag_access": True,
                "custom_characters": True
            }
        }
    
    async def track_usage(
        self,
        db_session: AsyncSession,
        user_id: uuid.UUID,
        input_tokens: int,
        output_tokens: int,
        model_name: str,
        request_type: str = "chat",
        character_id: Optional[str] = None,
        session_id: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        """Track token usage for a user."""
        try:
            total_tokens = input_tokens + output_tokens
            
            # Calculate costs
            pricing = self.model_pricing.get(model_name, {
                "input_cost_per_1k": 0,
                "output_cost_per_1k": 0
            })
            
            input_cost = int((input_tokens / 1000) * pricing["input_cost_per_1k"])
            output_cost = int((output_tokens / 1000) * pricing["output_cost_per_1k"])
            total_cost = input_cost + output_cost
            
            # Create usage record
            usage_record = UserUsage(
                user_id=user_id,
                date=datetime.utcnow(),
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=total_tokens,
                input_cost=input_cost,
                output_cost=output_cost,
                total_cost=total_cost,
                model_name=model_name,
                request_type=request_type,
                character_id=character_id,
                session_id=session_id
            )
            
            db_session.add(usage_record)
            
            # Update user quota
            await self.update_user_quota(db_session, user_id, total_tokens, 1, total_cost)
            
            await db_session.commit()
            
            logger.info(
                "Usage tracked",
                user_id=str(user_id),
                tokens=total_tokens,
                cost_cents=total_cost,
                model=model_name
            )
            
            return {
                "usage_id": usage_record.id,
                "tokens_used": total_tokens,
                "cost_cents": total_cost,
                "model": model_name
            }
            
        except Exception as e:
            logger.error("Failed to track usage", error=str(e), user_id=str(user_id))
            await db_session.rollback()
            raise
    
    async def update_user_quota(
        self,
        db_session: AsyncSession,
        user_id: uuid.UUID,
        tokens_used: int,
        requests_used: int,
        cost_cents: int
    ):
        """Update user's current month quota usage."""
        # Get or create user quota
        stmt = select(UserQuota).where(UserQuota.user_id == user_id)
        result = await db_session.execute(stmt)
        quota = result.scalar_one_or_none()
        
        if not quota:
            quota = UserQuota(
                user_id=user_id,
                plan_type="free",
                **self.plan_limits["free"]
            )
            db_session.add(quota)
        
        # Check if we need to reset monthly counters
        await self.check_and_reset_monthly_usage(quota)
        
        # Update usage
        quota.current_month_tokens += tokens_used
        quota.current_month_requests += requests_used
        quota.current_month_cost += cost_cents
        quota.updated_at = datetime.utcnow()
    
    async def check_and_reset_monthly_usage(self, quota: UserQuota):
        """Reset monthly usage if billing cycle has passed."""
        current_date = datetime.utcnow().date()
        last_reset = quota.last_reset_date.date() if quota.last_reset_date else current_date
        
        # If it's a new month, reset counters
        if current_date.month != last_reset.month or current_date.year != last_reset.year:
            quota.current_month_tokens = 0
            quota.current_month_requests = 0
            quota.current_month_cost = 0
            quota.last_reset_date = datetime.utcnow()
            
            logger.info(
                "Monthly usage reset",
                user_id=str(quota.user_id),
                plan=quota.plan_type
            )
    
    async def check_user_limits(
        self,
        db_session: AsyncSession,
        user_id: uuid.UUID,
        tokens_needed: int = 0,
        requests_needed: int = 1
    ) -> Dict[str, Any]:
        """Check if user has enough quota for the request."""
        stmt = select(UserQuota).where(UserQuota.user_id == user_id)
        result = await db_session.execute(stmt)
        quota = result.scalar_one_or_none()
        
        if not quota:
            # Create default free quota
            quota = UserQuota(
                user_id=user_id,
                plan_type="free",
                monthly_token_limit=self.plan_limits["free"]["monthly_tokens"],
                monthly_request_limit=self.plan_limits["free"]["monthly_requests"]
            )
            db_session.add(quota)
            await db_session.commit()
        
        # Check and reset if needed
        await self.check_and_reset_monthly_usage(quota)
        
        # Check limits
        token_limit_exceeded = (quota.current_month_tokens + tokens_needed) > quota.monthly_token_limit
        request_limit_exceeded = (quota.current_month_requests + requests_needed) > quota.monthly_request_limit
        
        return {
            "allowed": not (token_limit_exceeded or request_limit_exceeded),
            "quota": {
                "plan_type": quota.plan_type,
                "tokens_used": quota.current_month_tokens,
                "tokens_limit": quota.monthly_token_limit,
                "tokens_remaining": max(0, quota.monthly_token_limit - quota.current_month_tokens),
                "requests_used": quota.current_month_requests,
                "requests_limit": quota.monthly_request_limit,
                "requests_remaining": max(0, quota.monthly_request_limit - quota.current_month_requests),
                "cost_this_month_cents": quota.current_month_cost,
                "rag_access": quota.rag_access,
                "custom_characters": quota.custom_characters
            },
            "limits_exceeded": {
                "tokens": token_limit_exceeded,
                "requests": request_limit_exceeded
            }
        }
    
    async def upgrade_user_plan(
        self,
        db_session: AsyncSession,
        user_id: uuid.UUID,
        plan_type: str
    ) -> Dict[str, Any]:
        """Upgrade user to a different plan."""
        if plan_type not in self.plan_limits:
            raise ValueError(f"Invalid plan type: {plan_type}")
        
        stmt = select(UserQuota).where(UserQuota.user_id == user_id)
        result = await db_session.execute(stmt)
        quota = result.scalar_one_or_none()
        
        if not quota:
            quota = UserQuota(user_id=user_id)
            db_session.add(quota)
        
        # Update plan
        plan_config = self.plan_limits[plan_type]
        quota.plan_type = plan_type
        quota.monthly_token_limit = plan_config["monthly_tokens"]
        quota.monthly_request_limit = plan_config["monthly_requests"]
        quota.rag_access = plan_config["rag_access"]
        quota.custom_characters = plan_config["custom_characters"]
        quota.updated_at = datetime.utcnow()
        
        await db_session.commit()
        
        logger.info(
            "User plan upgraded",
            user_id=str(user_id),
            new_plan=plan_type
        )
        
        return {
            "user_id": user_id,
            "plan_type": plan_type,
            "limits": plan_config
        }
    
    async def get_user_usage_stats(
        self,
        db_session: AsyncSession,
        user_id: uuid.UUID,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get user usage statistics for the last N days."""
        from_date = datetime.utcnow().date() - timedelta(days=days)
        
        # Get usage records
        stmt = (
            select(UserUsage)
            .where(
                UserUsage.user_id == user_id,
                func.date(UserUsage.date) >= from_date
            )
            .order_by(UserUsage.date.desc())
        )
        result = await db_session.execute(stmt)
        usage_records = result.scalars().all()
        
        # Calculate totals
        total_tokens = sum(record.total_tokens for record in usage_records)
        total_cost = sum(record.total_cost for record in usage_records)
        total_requests = len(usage_records)
        
        # Group by date
        daily_usage = {}
        for record in usage_records:
            date_key = record.date.date().isoformat()
            if date_key not in daily_usage:
                daily_usage[date_key] = {
                    "tokens": 0,
                    "cost_cents": 0,
                    "requests": 0
                }
            daily_usage[date_key]["tokens"] += record.total_tokens
            daily_usage[date_key]["cost_cents"] += record.total_cost
            daily_usage[date_key]["requests"] += 1
        
        # Get current quota
        quota_check = await self.check_user_limits(db_session, user_id)
        
        return {
            "period_days": days,
            "total_tokens": total_tokens,
            "total_cost_cents": total_cost,
            "total_requests": total_requests,
            "daily_usage": daily_usage,
            "current_quota": quota_check["quota"]
        }
