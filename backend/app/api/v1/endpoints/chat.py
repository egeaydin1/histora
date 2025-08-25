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
from app.services.usage_service import UsageService
from app.services.session_service import session_service
from app.services.token_service import TokenCreditService
from app.core.database import get_async_session
from app.models.database import Character, User
from app.api.dependencies import get_current_user, check_user_quota, rate_limit_chat
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

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
    usage: Optional[dict] = None  # Token usage information


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
    current_user: User = Depends(get_current_user),
    quota_check: dict = Depends(check_user_quota),
    _: None = Depends(rate_limit_chat),
    ai_service: AIService = Depends(get_ai_service),
    db: AsyncSession = Depends(get_async_session),
    settings: Settings = Depends(get_settings)
):
    """Send a message to a character and get RAG-enhanced AI response."""
    
    try:
        # Handle session creation or retrieval
        if chat_request.session_id:
            # Use existing session
            session_uuid = uuid.UUID(chat_request.session_id)
            session = await session_service.get_session(db, session_uuid, current_user.id)
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
            session_id = chat_request.session_id
        else:
            # Development mode: use mock session for mock users
            settings = get_settings()
            if (settings.environment == "development" and 
                hasattr(current_user, '__class__') and 
                current_user.__class__.__name__ == 'MockUser'):
                # Generate a consistent mock session ID
                session_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"mock-session-{current_user.id}-{chat_request.character_id}"))
            else:
                # Create new session
                session = await session_service.create_session(
                    db_session=db,
                    user_id=current_user.id,
                    character_id=chat_request.character_id,
                    language=chat_request.language,
                    mode=chat_request.mode
                )
                session_id = str(session.id)
        
        # Verify character exists and is published
        result = await db.execute(
            select(Character).where(
                Character.id == chat_request.character_id,
                Character.is_published == True
            )
        )
        character = result.scalar_one_or_none()
        
        # Fallback character data if not found in database
        if not character:
            # Check if it's one of our known characters
            fallback_characters = {
                "ataturk-001": {
                    "id": "ataturk-001",
                    "name": "Mustafa Kemal Atatürk",
                    "system_prompt": """Sen Mustafa Kemal Atatürk'sün. Türkiye Cumhuriyeti'nin kurucusu ve ilk Cumhurbaşkanısın (1881-1938). 

# ROLÜN VE KİŞİLİĞİN:
- Vizyoner lider ve modernist düşünür
- Güçlü irade, kararlılık ve pragmatizm
- Bilim ve akla dayalı dünya görüşü
- Kadın hakları ve eşitlik savunucusu
- Milli birlik ve bağımsızlık vurgusu

# KONUŞMA STİLİN:
- Resmi ama samimi ve sıcak ton
- Etkili, ikna edici ve net ifadeler
- Gençlere rehberlik eden tavır
- "Gençler!", "Vatandaşlar!" hitapları
- Örneklerle desteklenen açıklamalar

# ANA KONULARIN:
- Türkiye Cumhuriyeti'nin kuruluşu
- Modernleşme ve çağdaşlaşma
- Eğitim ve bilimin önemi
- Milli egemenlik ve demokrasi
- Laiklik ve din-devlet ayrımı
- Kadın hakları ve toplumsal eşitlik

# TALİMATLAR:
- Sadece Türkçe konuş
- Atatürk'ün gerçek fikirlerini yansıt
- Güncel konulara Atatürk perspektifinden yaklaş
- Kısa, net ve öğretici yanıtlar ver""",
                    "is_published": True
                },
                "mevlana-001": {
                    "id": "mevlana-001",
                    "name": "Mevlana Celaleddin Rumi",
                    "system_prompt": """Sen Mevlana Celaleddin Rumi'sin. 13. yüzyılın büyük mutasavvıf şairi ve filozofusun (1207-1273).

# ROLÜN VE KİŞİLİĞİN:
- Büyük mutasavvıf ve şair
- Aşk ve hoşgörü öğretisi
- Evrensel sevgi anlayışı
- Derin maneviyat ve hikmet
- İnsanlık birliği vurgusu

# KONUŞMA STİLİN:
- Şiirsel ve mecazi dil
- Derin anlamlar içeren hikayeler
- Sevgi dolu ve şefkatli ton
- Sufiyane ifadeler
- Sembolik ve metaforik anlatım

# ANA KONULARIN:
- Aşkın ve sevginin gücü
- Hoşgörü ve anlayış
- Maneviyat ve ruh gelişimi
- İnsan-Tanrı ilişkisi
- Evrensel kardeşlik
- İç dünya ve kalp temizliği

# TALİMATLAR:
- Türkçe konuş ama eski dönemin ruhunu yansıt
- Mevlana'nın gerçek öğretilerini aktar
- Şiirsel ve hikmetli bir dil kullan
- Sevgi ve hoşgörüyü ön plana çıkar""",
                    "is_published": True
                },
                "konfucyus-001": {
                    "id": "konfucyus-001",
                    "name": "Konfüçyüs",
                    "system_prompt": """Sen Konfüçyüs'sün. Antik Çin'in büyük filozofu ve öğretmensin (M.Ö. 551-479).

# ROLÜN VE KİŞİLİĞİN:
- Büyük filozof ve öğretmen
- Ahlak ve erdem öğreticisi
- Toplumsal düzen savunucusu
- Bilgelik ve öğrenme sevdalısı
- Saygı ve nezaket örneği

# KONUŞMA STİLİN:
- Bilgece ve ölçülü
- Öğretici ve rehber
- Saygılı ve alçakgönüllü
- Özlü ve anlamlı sözler
- Örnek verici hikayeler

# ANA KONULARIN:
- Ahlak ve erdem
- Toplumsal düzen ve saygı
- Eğitim ve öğrenme
- Aile değerleri
- Yönetim ahlakı
- Kişisel gelişim

# TALİMATLAR:
- Türkçe konuş ama bilgece bir ton kullan
- Konfüçyüs'ün gerçek öğretilerini yansıt
- Ahlaki öğütler ver
- Saygı ve erdemli yaşamı vurgula""",
                    "is_published": True
                }
            }
            
            fallback_char = fallback_characters.get(chat_request.character_id)
            if not fallback_char:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Character '{chat_request.character_id}' not found or not published"
                )
            
            # Create a mock character object for fallback
            class MockCharacter:
                def __init__(self, data):
                    self.id = data["id"]
                    self.name = data["name"]
                    self.system_prompt = data["system_prompt"]
                    self.is_published = data["is_published"]
            
            character = MockCharacter(fallback_char)
        
        # Use character's base system prompt (RAG system removed)
        start_time = time.time()
        base_prompt = character.system_prompt or "Sen bu karaktersin ve ona uygun şekilde konuş."
        enhanced_prompt = base_prompt
        
        # Get AI response with enhanced prompt
        ai_response = await ai_service.get_character_response(
            character_id=chat_request.character_id,
            user_message=chat_request.message,
            language=chat_request.language,
            system_prompt_override=enhanced_prompt
        )
        
        # Save user message (skip in development mode for mock users)
        if not (settings.environment == "development" and 
                hasattr(current_user, '__class__') and 
                current_user.__class__.__name__ == 'MockUser'):
            await session_service.add_message(
                db_session=db,
                session_id=uuid.UUID(session_id),
                role="user",
                content=chat_request.message
            )
        
        # Save AI response (skip in development mode for mock users)
        response_time_ms = int((time.time() - start_time) * 1000)
        if not (settings.environment == "development" and 
                hasattr(current_user, '__class__') and 
                current_user.__class__.__name__ == 'MockUser'):
            await session_service.add_message(
                db_session=db,
                session_id=uuid.UUID(session_id),
                role="assistant",
                content=ai_response.content,
                model_used=ai_response.model_used,
                response_time=response_time_ms,
                context_used=None  # No RAG context since system was removed
            )
        
        # Track token usage and deduct credits
        usage_service = UsageService()
        token_service = TokenCreditService(db)
        usage_info = None
        
        if ai_response.usage:
            try:
                # Count tokens in user message and AI response
                input_tokens = await token_service.count_tokens(chat_request.message, ai_response.model_used)
                output_tokens = await token_service.count_tokens(ai_response.content, ai_response.model_used)
                
                # For non-mock users, record usage and deduct credits
                if not (settings.environment == "development" and 
                        hasattr(current_user, '__class__') and 
                        current_user.__class__.__name__ == 'MockUser'):
                    
                    # Record usage with TokenCreditService (handles credit deduction)
                    usage_record = await token_service.record_usage(
                        user_id=str(current_user.id),
                        input_tokens=int(input_tokens),
                        output_tokens=int(output_tokens),
                        model=ai_response.model_used,
                        request_type="chat",
                        character_id=chat_request.character_id,
                        session_id=session_id,
                        user_message_length=len(chat_request.message),
                        ai_response_length=len(ai_response.content)
                    )
                    
                    # Also track with legacy usage service for compatibility
                    usage_info = await usage_service.track_usage(
                        db_session=db,
                        user_id=current_user.id,
                        input_tokens=int(input_tokens),
                        output_tokens=int(output_tokens),
                        model_name=ai_response.model_used,
                        request_type="chat",
                        character_id=chat_request.character_id,
                        session_id=uuid.UUID(session_id) if session_id else None
                    )
                    
                    # Add credit usage info to response
                    usage_info = {
                        "input_tokens": int(input_tokens),
                        "output_tokens": int(output_tokens),
                        "total_tokens": int(input_tokens + output_tokens),
                        "credits_used": usage_record.credits_used,
                        "model": ai_response.model_used
                    }
                    
                else:
                    # For mock users, just return token info without deducting credits
                    usage_info = {
                        "input_tokens": int(input_tokens),
                        "output_tokens": int(output_tokens),
                        "total_tokens": int(input_tokens + output_tokens),
                        "credits_used": 0,
                        "model": ai_response.model_used,
                        "mock_mode": True
                    }
                    
            except ValueError as credit_error:
                # Handle insufficient credits
                if "Insufficient credits" in str(credit_error):
                    raise HTTPException(
                        status_code=402,  # Payment Required
                        detail=f"Insufficient credits for this request. {str(credit_error)}"
                    )
                else:
                    raise HTTPException(status_code=400, detail=str(credit_error))
            except Exception as e:
                # Don't fail the request if usage tracking fails, but log the error
                print(f"Warning: Failed to track token usage: {e}")
                # Provide basic usage info without credit deduction
                usage_info = {
                    "error": "Usage tracking failed",
                    "model": ai_response.model_used
                }
        
        else:
            # No usage info from AI service
            if not (settings.environment == "development" and 
                    hasattr(current_user, '__class__') and 
                    current_user.__class__.__name__ == 'MockUser'):
                print(f"Warning: No token usage information from AI service")
        
        total_time = time.time() - start_time
        
        return ChatResponse(
            session_id=session_id,
            character_id=chat_request.character_id,
            message=chat_request.message,
            response=ai_response.content,
            language=chat_request.language,
            mode=chat_request.mode,
            timestamp=datetime.now(),
            model_used=ai_response.model_used,
            response_time=total_time,
            usage=usage_info
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.get("/characters")
async def get_available_characters(
    db: AsyncSession = Depends(get_async_session)
):
    """Get list of available published characters for chat."""
    
    try:
        # Get published characters from database
        result = await db.execute(
            select(Character).where(Character.is_published == True)
            .order_by(Character.is_featured.desc(), Character.name)
        )
        characters_db = result.scalars().all()
        
        # Format characters for frontend
        characters = []
        for char in characters_db:
            # Set default stats since RAG system was removed
            stats = {
                "ready_for_chat": True,  # All published characters are ready
                "total_sources": 0,
                "total_chunks": 0
            }
            
            # Build era string
            era = ""
            if char.birth_year and char.death_year:
                era = f"{char.birth_year}-{char.death_year}"
            elif char.birth_year:
                era = f"Born {char.birth_year}"
            
            character_data = {
                "id": char.id,
                "name": char.name,
                "title": char.title,
                "description": char.description or char.title,
                "era": era,
                "nationality": char.nationality,
                "category": char.category,
                "personality_traits": char.personality_traits or [],
                "speaking_style": char.speaking_style,
                "avatar_url": f"/avatars/{char.id}.svg",
                "is_featured": char.is_featured,
                "ready_for_chat": stats.get("ready_for_chat", False),
                "knowledge_sources": stats.get("total_sources", 0),
                "processed_chunks": stats.get("total_chunks", 0)
            }
            characters.append(character_data)
        
        return {"characters": characters}
        
    except Exception as e:
        # Fallback to static data if database fails
        characters = [
            {
                "id": "ataturk-001",
                "name": "Mustafa Kemal Atatürk",
                "description": "Türkiye Cumhuriyeti'nin kurucusu",
                "era": "1881-1938",
                "category": "leader",
                "avatar_url": "/avatars/ataturk.jpg",
                "ready_for_chat": True
            }
        ]
        return {"characters": characters}


@router.get("/sessions", response_model=List[ChatSession])
async def get_chat_sessions(
    current_user: User = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0,
    active_only: bool = False,
    db: AsyncSession = Depends(get_async_session),
    settings: Settings = Depends(get_settings)
):
    """Get user's chat sessions."""
    
    try:
        # Get user's sessions from database
        sessions_db = await session_service.get_user_sessions(
            db_session=db,
            user_id=current_user.id,
            limit=limit,
            offset=offset,
            active_only=active_only
        )
        
        # Convert to response format
        sessions = []
        for session_db in sessions_db:
            session_data = {
                "id": str(session_db.id),
                "character_id": session_db.character_id,
                "character_name": session_db.character.name if session_db.character else "Unknown",
                "title": session_db.title,
                "message_count": session_db.message_count,
                "last_message_at": session_db.updated_at,
                "created_at": session_db.created_at,
                "language": session_db.language,
                "mode": session_db.mode
            }
            sessions.append(session_data)
        
        return sessions
        
    except Exception as e:
        logger.error("Failed to get user sessions", error=str(e))
        return []


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessage])
async def get_session_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_async_session),
    settings: Settings = Depends(get_settings)
):
    """Get messages from a chat session."""
    
    try:
        # Get messages from database (includes session ownership verification)
        messages_db = await session_service.get_session_messages(
            db_session=db,
            session_id=uuid.UUID(session_id),
            user_id=current_user.id,
            limit=limit,
            offset=offset
        )
        
        # Convert to response format
        messages = []
        for message_db in messages_db:
            message_data = {
                "role": message_db.role,
                "content": message_db.content,
                "timestamp": message_db.created_at
            }
            messages.append(message_data)
        
        return messages
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID format")
    except Exception as e:
        logger.error("Failed to get session messages", error=str(e))
        return []


@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
    settings: Settings = Depends(get_settings)
):
    """Delete a chat session."""
    
    try:
        success = await session_service.delete_session(
            db_session=db,
            session_id=uuid.UUID(session_id),
            user_id=current_user.id
        )
        
        if success:
            return {"message": "Chat session deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Session not found")
            
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid session ID format")
    except Exception as e:
        logger.error("Failed to delete session", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to delete session")


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