"""
Database models for Histora application.
"""
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    Boolean, Column, DateTime, Integer, String, Text, ForeignKey, 
    JSON, UUID, Index, Table
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    """User model for authentication and user management."""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid = Column(String(255), unique=True, nullable=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # For non-Firebase auth
    display_name = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="user")  # "user", "moderator", "admin"
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    email_verified = Column(Boolean, default=False)
    
    # Credit system
    credits = Column(Integer, default=100)  # Free tier gets 100 credits
    total_credits_purchased = Column(Integer, default=0)  # Lifetime purchases
    total_credits_used = Column(Integer, default=0)  # Lifetime usage
    total_tokens = Column(Integer, default=0)  # Lifetime token count
    
    # User preferences
    language_preference = Column(String(10), default="tr")
    timezone = Column(String(50), default="Europe/Istanbul")
    
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    chat_sessions = relationship("ChatSession", back_populates="user")
    created_characters = relationship("Character", back_populates="created_by_user")
    usage_records = relationship("UserUsage", back_populates="user")
    quota = relationship("UserQuota", back_populates="user", uselist=False)
    credit_transactions = relationship("CreditTransaction", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"

class CreditTransaction(Base):
    """Credit purchases and usage transactions."""
    __tablename__ = "credit_transactions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Transaction details
    transaction_type = Column(String(20), nullable=False)  # "purchase", "usage", "bonus", "refund"
    amount = Column(Integer, nullable=False)  # Credits added (positive) or used (negative)
    balance_after = Column(Integer, nullable=False)  # Credit balance after transaction
    
    # Purchase details (for purchases)
    payment_amount = Column(Integer, nullable=True)  # Amount paid in cents
    payment_currency = Column(String(3), default="TRY")
    payment_provider = Column(String(50), nullable=True)  # "stripe", "paypal", etc.
    payment_reference = Column(String(255), nullable=True)  # External payment ID
    
    # Usage details (for usage)
    chat_session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"), nullable=True)
    character_id = Column(String(50), ForeignKey("characters.id"), nullable=True)
    tokens_consumed = Column(Integer, nullable=True)  # Tokens that led to credit usage
    
    # Package details (for purchases)
    package_name = Column(String(100), nullable=True)  # "Basic", "Pro", "Premium"
    bonus_credits = Column(Integer, default=0)  # Bonus credits included
    
    # Metadata
    description = Column(Text, nullable=True)
    transaction_metadata = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="credit_transactions")
    session = relationship("ChatSession")
    character = relationship("Character")
    
    # Indexes
    __table_args__ = (
        Index('idx_credit_transaction_user_date', 'user_id', 'created_at'),
        Index('idx_credit_transaction_type', 'transaction_type'),
    )
    
    def __repr__(self):
        return f"<CreditTransaction(user_id={self.user_id}, type={self.transaction_type}, amount={self.amount})>"
class UserUsage(Base):
    """User token usage tracking for billing and analytics."""
    __tablename__ = "user_usage"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False, default=func.now())
    
    # Token usage tracking
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    
    # Credit usage
    credits_used = Column(Integer, default=0)  # Credits consumed for this usage
    
    # Cost tracking (in cents)
    input_cost = Column(Integer, default=0)  # Cost in cents
    output_cost = Column(Integer, default=0)  # Cost in cents
    total_cost = Column(Integer, default=0)  # Total cost in cents
    
    # AI model used
    model_name = Column(String(100), nullable=True)
    model_version = Column(String(50), nullable=True)
    
    # Request details
    request_type = Column(String(50), default="chat")  # "chat", "embedding", "rag"
    request_duration = Column(Integer, nullable=True)  # Duration in milliseconds
    
    # Context information
    character_id = Column(String(50), ForeignKey("characters.id"), nullable=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"), nullable=True)
    message_id = Column(UUID(as_uuid=True), ForeignKey("chat_messages.id"), nullable=True)
    
    # Usage metadata
    user_message_length = Column(Integer, nullable=True)  # Length of user's input
    ai_response_length = Column(Integer, nullable=True)  # Length of AI response
    context_chunks_used = Column(Integer, default=0)  # Number of RAG chunks used
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="usage_records")
    character = relationship("Character")
    session = relationship("ChatSession")
    message = relationship("ChatMessage")
    
    # Indexes for efficient querying
    __table_args__ = (
        Index('idx_user_usage_user_date', 'user_id', 'date'),
        Index('idx_user_usage_character', 'character_id'),
        Index('idx_user_usage_session', 'session_id'),
    )
    
    def __repr__(self):
        return f"<UserUsage(user_id={self.user_id}, tokens={self.total_tokens}, credits={self.credits_used})>"

class UserQuota(Base):
    """User quota limits and subscription plans."""
    __tablename__ = "user_quotas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    
    # Plan information
    plan_type = Column(String(50), default="free")  # "free", "basic", "premium", "unlimited"
    
    # Monthly limits
    monthly_token_limit = Column(Integer, default=10000)  # Default 10K tokens for free
    monthly_request_limit = Column(Integer, default=100)  # Default 100 requests for free
    
    # Current usage (resets monthly)
    current_month_tokens = Column(Integer, default=0)
    current_month_requests = Column(Integer, default=0)
    current_month_cost = Column(Integer, default=0)  # Cost in cents
    
    # Billing cycle
    billing_cycle_start = Column(DateTime(timezone=True), default=func.now())
    last_reset_date = Column(DateTime(timezone=True), default=func.now())
    
    # Premium features
    rag_access = Column(Boolean, default=False)
    custom_characters = Column(Boolean, default=False)
    priority_support = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationship
    user = relationship("User")
    
    def __repr__(self):
        return f"<UserQuota(user_id={self.user_id}, plan={self.plan_type}, tokens={self.current_month_tokens}/{self.monthly_token_limit})>"

class Character(Base):
    """Character model for historical figures."""
    __tablename__ = "characters"
    
    id = Column(String(50), primary_key=True)  # e.g., "ataturk-001"
    name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=True)  # e.g., "Türkiye Cumhuriyeti Kurucusu"
    birth_year = Column(Integer, nullable=True)
    death_year = Column(Integer, nullable=True)
    nationality = Column(String(100), nullable=True)
    category = Column(String(100), nullable=False)  # "leader", "philosopher", etc.
    description = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Character configuration
    system_prompt = Column(Text, nullable=True)
    personality_traits = Column(JSON, nullable=True)  # ["vizyoner", "kararlı"]
    speaking_style = Column(String(255), nullable=True)
    knowledge_context = Column(Text, nullable=True)
    
    # Supported languages
    supported_languages = Column(JSON, default=["tr", "en"])
    
    # Publishing status
    is_published = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    
    # Metadata
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    created_by_user = relationship("User", back_populates="created_characters")
    chat_sessions = relationship("ChatSession", back_populates="character")
    
    # Indexes
    __table_args__ = (
        Index("idx_character_category", "category"),
        Index("idx_character_published", "is_published"),
        Index("idx_character_featured", "is_featured"),
    )
    
    def __repr__(self):
        return f"<Character(id='{self.id}', name='{self.name}')>"

class ChatSession(Base):
    """Chat sessions between users and characters."""
    __tablename__ = "chat_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    character_id = Column(String(50), ForeignKey("characters.id"), nullable=False)
    
    # Session information
    title = Column(String(255), nullable=True)
    language = Column(String(10), default="tr")
    mode = Column(String(20), default="chat")  # "chat", "advisor", "lesson", "debate"
    
    # Session status
    is_active = Column(Boolean, default=True)
    message_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    character = relationship("Character", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("idx_session_user", "user_id"),
        Index("idx_session_character", "character_id"),
        Index("idx_session_active", "is_active"),
    )
    
    def __repr__(self):
        return f"<ChatSession(id={self.id}, user_id={self.user_id}, character_id='{self.character_id}')>"

class ChatMessage(Base):
    """Individual messages in chat sessions."""
    __tablename__ = "chat_messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id"), nullable=False)
    
    # Message content
    role = Column(String(20), nullable=False)  # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    
    # AI response metadata
    model_used = Column(String(100), nullable=True)
    response_time = Column(Integer, nullable=True)  # Response time in milliseconds
    context_used = Column(JSON, nullable=True)  # Retrieved context chunks
    
    # General metadata
    message_metadata = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")
    
    # Indexes
    __table_args__ = (
        Index("idx_message_session", "session_id"),
        Index("idx_message_role", "role"),
        Index("idx_message_created", "created_at"),
    )
    
    def __repr__(self):
        return f"<ChatMessage(id={self.id}, role='{self.role}', session_id={self.session_id})>"

class PricingPlan(Base):
    """Subscription pricing plans for the platform."""
    __tablename__ = "pricing_plans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Plan details
    name = Column(String(100), nullable=False)  # "Free", "Basic", "Premium", "Unlimited"
    display_name = Column(String(255), nullable=False)  # User-facing name
    description = Column(Text, nullable=True)
    
    # Pricing
    price_monthly = Column(Integer, nullable=False)  # Price in cents
    price_yearly = Column(Integer, nullable=True)  # Yearly price in cents (if available)
    currency = Column(String(3), default="TRY")
    
    # Plan features
    monthly_token_limit = Column(Integer, nullable=False)  # Monthly token allowance
    monthly_request_limit = Column(Integer, nullable=False)  # Monthly request limit
    included_credits = Column(Integer, default=0)  # Credits included monthly
    
    # Feature flags
    rag_access = Column(Boolean, default=False)
    custom_characters = Column(Boolean, default=False)
    priority_support = Column(Boolean, default=False)
    api_access = Column(Boolean, default=False)
    advanced_analytics = Column(Boolean, default=False)
    
    # Plan management
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    
    # Stripe integration
    stripe_price_id_monthly = Column(String(255), nullable=True)
    stripe_price_id_yearly = Column(String(255), nullable=True)
    stripe_product_id = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Indexes
    __table_args__ = (
        Index("idx_pricing_plan_active", "is_active"),
        Index("idx_pricing_plan_featured", "is_featured"),
        Index("idx_pricing_plan_order", "sort_order"),
    )
    
    def __repr__(self):
        return f"<PricingPlan(id={self.id}, name='{self.name}', price={self.price_monthly})>"

class CreditPackage(Base):
    """Credit packages that users can purchase."""
    __tablename__ = "credit_packages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Package details
    name = Column(String(100), nullable=False)  # "Starter", "Popular", "Value", "Premium"
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Credit details
    credit_amount = Column(Integer, nullable=False)  # Base credits included
    bonus_credits = Column(Integer, default=0)  # Bonus credits
    total_credits = Column(Integer, nullable=False)  # Total = credit_amount + bonus_credits
    
    # Pricing
    price = Column(Integer, nullable=False)  # Price in cents
    original_price = Column(Integer, nullable=True)  # Original price (for discounts)
    currency = Column(String(3), default="TRY")
    
    # Package features
    is_popular = Column(Boolean, default=False)
    discount_percentage = Column(Integer, default=0)  # Discount from per-credit rate
    
    # Package management
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    
    # Stripe integration
    stripe_price_id = Column(String(255), nullable=True)
    stripe_product_id = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Indexes
    __table_args__ = (
        Index("idx_credit_package_active", "is_active"),
        Index("idx_credit_package_popular", "is_popular"),
        Index("idx_credit_package_order", "sort_order"),
    )
    
    def __repr__(self):
        return f"<CreditPackage(id={self.id}, name='{self.name}', credits={self.total_credits}, price={self.price})>"

class UserSubscription(Base):
    """User subscription records."""
    __tablename__ = "user_subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("pricing_plans.id"), nullable=False)
    
    # Subscription details
    status = Column(String(20), nullable=False)  # "active", "canceled", "past_due", "unpaid"
    billing_cycle = Column(String(10), nullable=False)  # "monthly", "yearly"
    
    # Billing information
    current_period_start = Column(DateTime(timezone=True), nullable=False)
    current_period_end = Column(DateTime(timezone=True), nullable=False)
    trial_end = Column(DateTime(timezone=True), nullable=True)
    canceled_at = Column(DateTime(timezone=True), nullable=True)
    
    # Stripe integration
    stripe_subscription_id = Column(String(255), nullable=True, unique=True)
    stripe_customer_id = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    plan = relationship("PricingPlan")
    
    # Indexes
    __table_args__ = (
        Index("idx_subscription_user", "user_id"),
        Index("idx_subscription_status", "status"),
        Index("idx_subscription_period", "current_period_end"),
    )
    
    def __repr__(self):
        return f"<UserSubscription(id={self.id}, user_id={self.user_id}, status='{self.status}')>"

class SystemLog(Base):
    """System logs for monitoring and debugging."""
    __tablename__ = "system_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Log information
    level = Column(String(20), nullable=False)  # "INFO", "WARNING", "ERROR", "DEBUG"
    message = Column(Text, nullable=False)
    component = Column(String(100), nullable=True)  # "rag", "embedding", "auth", etc.
    
    # Context
    user_id = Column(UUID(as_uuid=True), nullable=True)
    session_id = Column(UUID(as_uuid=True), nullable=True)
    character_id = Column(String(50), nullable=True)
    
    # Additional data
    log_metadata = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes
    __table_args__ = (
        Index("idx_log_level", "level"),
        Index("idx_log_component", "component"),
        Index("idx_log_created", "created_at"),
    )
    
    def __repr__(self):
        return f"<SystemLog(id={self.id}, level='{self.level}', component='{self.component}')>"
