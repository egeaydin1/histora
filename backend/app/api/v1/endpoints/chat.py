"""
Chat endpoints for conversations with historical characters.
"""

import time
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.config import get_settings, Settings
from app.services.ai_service import get_ai_service, AIService

router = APIRouter()


class ChatMessage(BaseModel):
    """Chat message model."""
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Chat request model."""
    character_id: str
    message: str
    session_id: Optional[str] = None
    language: str = "tr"
    mode: str = "chat"  # 'chat', 'advisor', 'lesson'


class ChatResponse(BaseModel):
    """Chat response model."""
    session_id: str
    character_id: str
    message: str
    response: str
    language: str
    mode: str
    timestamp: datetime
    model_used: str
    response_time: float


class ChatSession(BaseModel):
    """Chat session model."""
    id: str
    character_id: str
    character_name: str
    title: Optional[str]
    message_count: int
    last_message_at: datetime
    created_at: datetime
    language: str
    mode: str


@router.post("/send", response_model=ChatResponse)
async def send_message(
    chat_request: ChatRequest,
    ai_service: AIService = Depends(get_ai_service),
    settings: Settings = Depends(get_settings)
):
    """Send a message to a character and get AI response."""
    
    try:
        # Generate session ID if not provided
        session_id = chat_request.session_id or str(uuid.uuid4())
        
        # Get AI response using the AI service
        ai_response = await ai_service.get_character_response(
            character_id=chat_request.character_id,
            user_message=chat_request.message,
            language=chat_request.language
        )
        
        return ChatResponse(
            session_id=session_id,
            character_id=chat_request.character_id,
            message=chat_request.message,
            response=ai_response.content,
            language=chat_request.language,
            mode=chat_request.mode,
            timestamp=datetime.now(),
            model_used=ai_response.model_used,
            response_time=ai_response.response_time
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.get("/characters")
async def get_available_characters():
    """Get list of available characters for chat."""
    
    characters = [
        {
            "id": "ataturk-001",
            "name": "Mustafa Kemal Atatürk",
            "description": "Türkiye Cumhuriyeti'nin kurucusu",
            "era": "Modern Turkey (1881-1938)",
            "specialties": ["Liderlik", "Devrimler", "Modernleşme", "Cumhuriyet"],
            "avatar_url": "/avatars/ataturk.jpg"
        },
        {
            "id": "mevlana-001", 
            "name": "Mevlana Celaleddin Rumi",
            "description": "Büyük mutasavvıf ve şair",
            "era": "13th Century Anatolia",
            "specialties": ["Tasavvuf", "Sevgi", "Hoşgörü", "Maneviyat"],
            "avatar_url": "/avatars/mevlana.jpg"
        },
        {
            "id": "konfucyus-001",
            "name": "Konfüçyüs", 
            "description": "Antik Çin filozofu",
            "era": "Spring and Autumn Period (551-479 BC)",
            "specialties": ["Felsefe", "Eğitim", "Ahlak", "Yönetim"],
            "avatar_url": "/avatars/konfucyus.jpg"
        }
    ]
    
    return {"characters": characters}


@router.get("/sessions", response_model=List[ChatSession])
async def get_chat_sessions(
    # TODO: Add user authentication dependency
    limit: int = 20,
    offset: int = 0,
    settings: Settings = Depends(get_settings)
):
    """Get user's chat sessions."""
    
    # TODO: Get user from authentication
    # TODO: Query database for user's sessions
    # TODO: Return sessions list
    
    # Placeholder sessions
    placeholder_sessions = [
        {
            "id": "session-001",
            "character_id": "ataturk-001",
            "character_name": "Mustafa Kemal Atatürk",
            "title": "Cumhuriyet ve Modernleşme",
            "message_count": 5,
            "last_message_at": datetime.now(),
            "created_at": datetime.now(),
            "language": "tr",
            "mode": "chat"
        }
    ]
    
    return placeholder_sessions


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessage])
async def get_session_messages(
    session_id: str,
    limit: int = 50,
    offset: int = 0,
    settings: Settings = Depends(get_settings)
):
    """Get messages from a chat session."""
    
    # TODO: Verify session belongs to user
    # TODO: Query database for session messages
    # TODO: Return messages list
    
    # Placeholder messages
    placeholder_messages = [
        {
            "role": "user",
            "content": "Merhaba Atatürk! Cumhuriyet nasıl kuruldu?",
            "timestamp": datetime.now()
        },
        {
            "role": "assistant", 
            "content": "Merhaba! Türkiye Cumhuriyeti, uzun bir mücadele sonucunda kuruldu. Milli Mücadele döneminde...",
            "timestamp": datetime.now()
        }
    ]
    
    return placeholder_messages


@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    settings: Settings = Depends(get_settings)
):
    """Delete a chat session."""
    
    # TODO: Verify session belongs to user
    # TODO: Delete session and messages from database
    # TODO: Return success message
    
    return {"message": "Chat session deleted successfully"}


@router.get("/health")
async def chat_service_health(
    ai_service: AIService = Depends(get_ai_service)
):
    """Check chat service health."""
    
    return {
        "status": "healthy",
        "service": "chat",
        "available_characters": 3,
        "ai_service": "ready",
        "models": ["mock-deepseek-r1", "deepseek/deepseek-r1-0528:free"]
    }