"""
Token counting and credit management service.
"""
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sqlalchemy.orm import selectinload

from app.models.database import (
    User, UserUsage, UserQuota, CreditTransaction, 
    ChatSession, ChatMessage
)
from app.core.config import settings
import structlog

logger = structlog.get_logger(__name__)

class TokenCreditService:
    """Service for managing tokens and credits."""
    
    # Credit costs per token (can be adjusted based on model)
    TOKEN_TO_CREDIT_RATIO = {
        "gemini-2.0-flash": {
            "input": 0.1,  # 0.1 credits per input token
            "output": 0.2,  # 0.2 credits per output token
        },
        "default": {
            "input": 0.1,
            "output": 0.2,
        }
    }
    
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
    
    async def count_tokens(self, text: str, model: str = "gemini-2.0-flash") -> int:
        """Count tokens in text (simplified approximation)."""
        # Simple token counting - in production, use tiktoken or model-specific tokenizer
        return len(text.split()) * 1.3  # Rough approximation
    
    async def calculate_credits_needed(
        self, 
        input_tokens: int, 
        output_tokens: int, 
        model: str = "gemini-2.0-flash"
    ) -> int:
        """Calculate credits needed for token usage."""
        rates = self.TOKEN_TO_CREDIT_RATIO.get(model, self.TOKEN_TO_CREDIT_RATIO["default"])
        
        input_credits = input_tokens * rates["input"]
        output_credits = output_tokens * rates["output"]
        
        return max(1, int(input_credits + output_credits))  # Minimum 1 credit
    
    async def record_usage(
        self,
        user_id: str,
        input_tokens: int,
        output_tokens: int,
        model: str,
        request_type: str = "chat",
        character_id: Optional[str] = None,
        session_id: Optional[str] = None,
        message_id: Optional[str] = None,
        user_message_length: Optional[int] = None,
        ai_response_length: Optional[int] = None
    ) -> UserUsage:
        """Record token usage and deduct credits."""
        
        total_tokens = input_tokens + output_tokens
        credits_needed = await self.calculate_credits_needed(input_tokens, output_tokens, model)
        
        # Check user's credit balance
        user = await self.db.execute(select(User).where(User.id == user_id))
        user = user.scalar_one_or_none()
        
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        if user.credits < credits_needed:
            raise ValueError(f"Insufficient credits. Need {credits_needed}, have {user.credits}")
        
        # Deduct credits from user
        user.credits -= credits_needed
        user.total_credits_used += credits_needed
        user.total_tokens += total_tokens
        
        # Record usage
        usage = UserUsage(
            user_id=user_id,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            credits_used=credits_needed,
            model_name=model,
            request_type=request_type,
            character_id=character_id,
            session_id=session_id,
            message_id=message_id,
            user_message_length=user_message_length,
            ai_response_length=ai_response_length
        )
        
        self.db.add(usage)
        
        # Record credit transaction
        credit_transaction = CreditTransaction(
            user_id=user_id,
            transaction_type="usage",
            amount=-credits_needed,
            balance_after=user.credits,
            chat_session_id=session_id,
            character_id=character_id,
            tokens_consumed=total_tokens,
            description=f"Token usage: {total_tokens} tokens ({model})"
        )
        
        self.db.add(credit_transaction)
        await self.db.commit()
        
        logger.info(
            "Usage recorded",
            user_id=user_id,
            tokens=total_tokens,
            credits_used=credits_needed,
            remaining_credits=user.credits
        )
        
        return usage
    
    async def add_credits(
        self,
        user_id: str,
        amount: int,
        transaction_type: str = "purchase",
        payment_amount: Optional[int] = None,
        payment_provider: Optional[str] = None,
        payment_reference: Optional[str] = None,
        package_name: Optional[str] = None,
        bonus_credits: int = 0,
        description: Optional[str] = None
    ) -> CreditTransaction:
        """Add credits to user account."""
        
        user = await self.db.execute(select(User).where(User.id == user_id))
        user = user.scalar_one_or_none()
        
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        # Add credits to user
        user.credits += amount
        user.total_credits_purchased += amount
        
        # Record transaction
        transaction = CreditTransaction(
            user_id=user_id,
            transaction_type=transaction_type,
            amount=amount,
            balance_after=user.credits,
            payment_amount=payment_amount,
            payment_provider=payment_provider,
            payment_reference=payment_reference,
            package_name=package_name,
            bonus_credits=bonus_credits,
            description=description or f"Credits added: {amount}"
        )
        
        self.db.add(transaction)
        await self.db.commit()
        
        logger.info(
            "Credits added",
            user_id=user_id,
            amount=amount,
            new_balance=user.credits
        )
        
        return transaction
    
    async def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive user usage statistics."""
        
        user = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = user.scalar_one_or_none()
        
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        # Get monthly usage
        month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        monthly_usage = await self.db.execute(
            select(
                func.sum(UserUsage.total_tokens).label("tokens"),
                func.sum(UserUsage.credits_used).label("credits"),
                func.count(UserUsage.id).label("requests")
            ).where(
                and_(
                    UserUsage.user_id == user_id,
                    UserUsage.created_at >= month_start
                )
            )
        )
        monthly = monthly_usage.first()
        
        # Get recent activity
        recent_activity = await self.db.execute(
            select(CreditTransaction).where(
                CreditTransaction.user_id == user_id
            ).order_by(desc(CreditTransaction.created_at)).limit(10)
        )
        
        return {
            "user_id": user_id,
            "credits": user.credits,
            "total_credits_purchased": user.total_credits_purchased,
            "total_credits_used": user.total_credits_used,
            "total_tokens": user.total_tokens,
            "monthly_usage": {
                "tokens": monthly.tokens or 0,
                "credits": monthly.credits or 0,
                "requests": monthly.requests or 0
            },
            "recent_activity": [
                {
                    "type": tx.transaction_type,
                    "amount": tx.amount,
                    "balance_after": tx.balance_after,
                    "description": tx.description,
                    "created_at": tx.created_at.isoformat()
                }
                for tx in recent_activity.scalars().all()
            ]
        }