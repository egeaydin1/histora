"""
Chat session management service.
"""

import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, desc
from sqlalchemy.orm import selectinload

from app.models.database import ChatSession, ChatMessage as DBChatMessage, User, Character
import structlog

logger = structlog.get_logger(__name__)

class SessionService:
    """Service for managing chat sessions and messages."""
    
    async def create_session(
        self,
        db_session: AsyncSession,
        user_id: uuid.UUID,
        character_id: str,
        title: Optional[str] = None,
        language: str = "tr",
        mode: str = "chat"
    ) -> ChatSession:
        """Create a new chat session."""
        
        try:
            # Generate title if not provided
            if not title:
                # Get character name for title
                result = await db_session.execute(
                    select(Character.name).where(Character.id == character_id)
                )
                character_name = result.scalar_one_or_none()
                title = f"{character_name} ile Sohbet" if character_name else "Yeni Sohbet"
            
            # Create session
            session = ChatSession(
                id=uuid.uuid4(),
                user_id=user_id,
                character_id=character_id,
                title=title,
                language=language,
                mode=mode,
                is_active=True,
                message_count=0
            )
            
            db_session.add(session)
            await db_session.commit()
            await db_session.refresh(session)
            
            logger.info(
                "Created chat session",
                session_id=str(session.id),
                user_id=str(user_id),
                character_id=character_id
            )
            
            return session
            
        except Exception as e:
            await db_session.rollback()
            logger.error("Failed to create chat session", error=str(e))
            raise
    
    async def get_session(
        self,
        db_session: AsyncSession,
        session_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> Optional[ChatSession]:
        """Get a chat session by ID for a specific user."""
        
        try:
            result = await db_session.execute(
                select(ChatSession)
                .options(selectinload(ChatSession.character))
                .where(
                    and_(
                        ChatSession.id == session_id,
                        ChatSession.user_id == user_id
                    )
                )
            )
            return result.scalar_one_or_none()
            
        except Exception as e:
            logger.error("Failed to get chat session", error=str(e))
            return None
    
    async def get_user_sessions(
        self,
        db_session: AsyncSession,
        user_id: uuid.UUID,
        limit: int = 20,
        offset: int = 0,
        active_only: bool = False
    ) -> List[ChatSession]:
        """Get user's chat sessions."""
        
        try:
            query = (
                select(ChatSession)
                .options(selectinload(ChatSession.character))
                .where(ChatSession.user_id == user_id)
            )
            
            if active_only:
                query = query.where(ChatSession.is_active == True)
            
            query = (
                query.order_by(desc(ChatSession.updated_at))
                .limit(limit)
                .offset(offset)
            )
            
            result = await db_session.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            logger.error("Failed to get user sessions", error=str(e))
            return []
    
    async def add_message(
        self,
        db_session: AsyncSession,
        session_id: uuid.UUID,
        role: str,
        content: str,
        model_used: Optional[str] = None,
        response_time: Optional[int] = None,
        context_used: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> DBChatMessage:
        """Add a message to a chat session."""
        
        try:
            # Create message
            message = DBChatMessage(
                id=uuid.uuid4(),
                session_id=session_id,
                role=role,
                content=content,
                model_used=model_used,
                response_time=response_time,
                context_used=context_used,
                message_metadata=metadata
            )
            
            db_session.add(message)
            
            # Update session message count and last activity
            await db_session.execute(
                update(ChatSession)
                .where(ChatSession.id == session_id)
                .values(
                    message_count=ChatSession.message_count + 1,
                    updated_at=func.now()
                )
            )
            
            await db_session.commit()
            await db_session.refresh(message)
            
            logger.info(
                "Added message to session",
                session_id=str(session_id),
                role=role,
                message_length=len(content)
            )
            
            return message
            
        except Exception as e:
            await db_session.rollback()
            logger.error("Failed to add message", error=str(e))
            raise
    
    async def get_session_messages(
        self,
        db_session: AsyncSession,
        session_id: uuid.UUID,
        user_id: uuid.UUID,
        limit: int = 50,
        offset: int = 0
    ) -> List[DBChatMessage]:
        """Get messages from a chat session."""
        
        try:
            # First verify session belongs to user
            session = await self.get_session(db_session, session_id, user_id)
            if not session:
                return []
            
            # Get messages
            result = await db_session.execute(
                select(DBChatMessage)
                .where(DBChatMessage.session_id == session_id)
                .order_by(DBChatMessage.created_at)
                .limit(limit)
                .offset(offset)
            )
            
            return result.scalars().all()
            
        except Exception as e:
            logger.error("Failed to get session messages", error=str(e))
            return []
    
    async def update_session_title(
        self,
        db_session: AsyncSession,
        session_id: uuid.UUID,
        user_id: uuid.UUID,
        new_title: str
    ) -> bool:
        """Update session title."""
        
        try:
            result = await db_session.execute(
                update(ChatSession)
                .where(
                    and_(
                        ChatSession.id == session_id,
                        ChatSession.user_id == user_id
                    )
                )
                .values(title=new_title, updated_at=func.now())
            )
            
            await db_session.commit()
            
            success = result.rowcount > 0
            if success:
                logger.info(
                    "Updated session title",
                    session_id=str(session_id),
                    new_title=new_title
                )
            
            return success
            
        except Exception as e:
            await db_session.rollback()
            logger.error("Failed to update session title", error=str(e))
            return False
    
    async def deactivate_session(
        self,
        db_session: AsyncSession,
        session_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> bool:
        """Deactivate a chat session."""
        
        try:
            result = await db_session.execute(
                update(ChatSession)
                .where(
                    and_(
                        ChatSession.id == session_id,
                        ChatSession.user_id == user_id
                    )
                )
                .values(is_active=False, updated_at=func.now())
            )
            
            await db_session.commit()
            
            success = result.rowcount > 0
            if success:
                logger.info("Deactivated session", session_id=str(session_id))
            
            return success
            
        except Exception as e:
            await db_session.rollback()
            logger.error("Failed to deactivate session", error=str(e))
            return False
    
    async def delete_session(
        self,
        db_session: AsyncSession,
        session_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> bool:
        """Delete a chat session and all its messages."""
        
        try:
            # First delete all messages
            await db_session.execute(
                delete(DBChatMessage).where(DBChatMessage.session_id == session_id)
            )
            
            # Then delete session (verify ownership)
            result = await db_session.execute(
                delete(ChatSession).where(
                    and_(
                        ChatSession.id == session_id,
                        ChatSession.user_id == user_id
                    )
                )
            )
            
            await db_session.commit()
            
            success = result.rowcount > 0
            if success:
                logger.info("Deleted session", session_id=str(session_id))
            
            return success
            
        except Exception as e:
            await db_session.rollback()
            logger.error("Failed to delete session", error=str(e))
            return False
    
    async def get_session_stats(
        self,
        db_session: AsyncSession,
        user_id: uuid.UUID
    ) -> Dict[str, Any]:
        """Get user's session statistics."""
        
        try:
            # Total sessions
            total_result = await db_session.execute(
                select(func.count(ChatSession.id))
                .where(ChatSession.user_id == user_id)
            )
            total_sessions = total_result.scalar() or 0
            
            # Active sessions
            active_result = await db_session.execute(
                select(func.count(ChatSession.id))
                .where(
                    and_(
                        ChatSession.user_id == user_id,
                        ChatSession.is_active == True
                    )
                )
            )
            active_sessions = active_result.scalar() or 0
            
            # Total messages
            messages_result = await db_session.execute(
                select(func.sum(ChatSession.message_count))
                .where(ChatSession.user_id == user_id)
            )
            total_messages = messages_result.scalar() or 0
            
            # Recent activity (last 7 days)
            recent_cutoff = datetime.now() - timedelta(days=7)
            recent_result = await db_session.execute(
                select(func.count(ChatSession.id))
                .where(
                    and_(
                        ChatSession.user_id == user_id,
                        ChatSession.updated_at >= recent_cutoff
                    )
                )
            )
            recent_sessions = recent_result.scalar() or 0
            
            return {
                "total_sessions": total_sessions,
                "active_sessions": active_sessions,
                "total_messages": total_messages,
                "recent_sessions": recent_sessions
            }
            
        except Exception as e:
            logger.error("Failed to get session stats", error=str(e))
            return {
                "total_sessions": 0,
                "active_sessions": 0,
                "total_messages": 0,
                "recent_sessions": 0
            }

# Global session service instance
session_service = SessionService()
