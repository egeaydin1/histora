#!/usr/bin/env python3
"""
Test session management functionality.
"""
import os
import asyncio
import sys
from pathlib import Path
import uuid

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set environment variables for testing
os.environ.update({
    "DATABASE_URL": "postgresql://histora:histora123@localhost:5433/histora",
    "CHROMA_HOST": "localhost",
    "CHROMA_PORT": "8001",
    "CHROMA_COLLECTION_NAME": "character_embeddings",
    "OPENAI_API_KEY": "your_openai_api_key_here",
    "ENVIRONMENT": "development",
    "DEBUG": "true"
})

from app.core.database import get_async_session
from app.services.session_service import session_service
from app.models.database import User
from sqlalchemy import select

async def test_session_management():
    """Test session management functionality."""
    print("💬 Testing Session Management...")
    
    try:
        session_gen = get_async_session()
        db = await session_gen.__anext__()
        
        try:
            # Get a test user (first user in DB)
            result = await db.execute(select(User).limit(1))
            user = result.scalar_one_or_none()
            
            if not user:
                print("❌ No users found in database")
                return
            
            print(f"👤 Testing with user: {user.email}")
            
            # Test 1: Create session
            print("\n1️⃣ Creating new session...")
            session = await session_service.create_session(
                db_session=db,
                user_id=user.id,
                character_id="ataturk-001",
                title="Test Chat Session",
                language="tr",
                mode="chat"
            )
            
            print(f"   ✅ Created session: {session.id}")
            print(f"   📄 Title: {session.title}")
            print(f"   🎭 Character: {session.character_id}")
            
            # Test 2: Add messages
            print("\n2️⃣ Adding messages...")
            
            # User message
            user_msg = await session_service.add_message(
                db_session=db,
                session_id=session.id,
                role="user",
                content="Merhaba Atatürk! Eğitim hakkında ne düşünüyorsunuz?"
            )
            print(f"   💬 User message: {user_msg.content[:50]}...")
            
            # AI response
            ai_msg = await session_service.add_message(
                db_session=db,
                session_id=session.id,
                role="assistant",
                content="Merhaba! Eğitim, milletimizin geleceğini inşa eden en temel görevdir.",
                model_used="mock-model",
                response_time=1500,
                context_used={"context_chunks": 2}
            )
            print(f"   🤖 AI message: {ai_msg.content[:50]}...")
            
            # Test 3: Get session messages
            print("\n3️⃣ Retrieving messages...")
            messages = await session_service.get_session_messages(
                db_session=db,
                session_id=session.id,
                user_id=user.id
            )
            
            print(f"   📝 Found {len(messages)} messages")
            for i, msg in enumerate(messages):
                print(f"      {i+1}. {msg.role}: {msg.content[:30]}...")
            
            # Test 4: Get user sessions
            print("\n4️⃣ Getting user sessions...")
            user_sessions = await session_service.get_user_sessions(
                db_session=db,
                user_id=user.id,
                limit=10
            )
            
            print(f"   📂 Found {len(user_sessions)} sessions for user")
            for sess in user_sessions:
                print(f"      - {sess.title} ({sess.message_count} messages)")
            
            # Test 5: Session stats
            print("\n5️⃣ Getting session statistics...")
            stats = await session_service.get_session_stats(
                db_session=db,
                user_id=user.id
            )
            
            print(f"   📊 Session Stats:")
            print(f"      - Total sessions: {stats['total_sessions']}")
            print(f"      - Active sessions: {stats['active_sessions']}")
            print(f"      - Total messages: {stats['total_messages']}")
            print(f"      - Recent sessions: {stats['recent_sessions']}")
            
            # Test 6: Update session title
            print("\n6️⃣ Updating session title...")
            new_title = "Atatürk ile Eğitim Sohbeti"
            success = await session_service.update_session_title(
                db_session=db,
                session_id=session.id,
                user_id=user.id,
                new_title=new_title
            )
            
            if success:
                print(f"   ✅ Title updated to: {new_title}")
            else:
                print(f"   ❌ Failed to update title")
            
            print("\n🎉 Session management tests completed!")
            
        finally:
            await db.close()
            
    except Exception as e:
        print(f"❌ Session management test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_session_management())
