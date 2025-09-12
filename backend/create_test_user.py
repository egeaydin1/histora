#!/usr/bin/env python3
"""
Create a test user quickly.
"""
import os
import asyncio
import sys
import uuid
from pathlib import Path
import bcrypt

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set default environment variables (Railway will override these)
if not os.environ.get("DATABASE_URL"):
    os.environ.update({
        "DATABASE_URL": "postgresql://histora:histora123@localhost:5433/histora",
        "CHROMA_HOST": "localhost",
        "CHROMA_PORT": "8001",
        "CHROMA_COLLECTION_NAME": "character_embeddings",
        "OPENAI_API_KEY": "your_openai_api_key_here",
        "ENVIRONMENT": "development",
        "DEBUG": "true"
    })

# Print current database URL for debugging
print(f"🔗 Using DATABASE_URL: {os.environ.get('DATABASE_URL', 'Not set')}")

from app.core.database import get_async_session
from app.models.database import User

async def create_test_user():
    """Create a test user."""
    print("👤 Creating test user...")
    
    try:
        session_gen = get_async_session()
        db = await session_gen.__anext__()
        
        try:
            # Create test user
            password = "test123"
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            user = User(
                id=uuid.uuid4(),
                email="test@histora.com",
                password_hash=password_hash,
                display_name="Test User",
                full_name="Test User",
                role="user",
                is_admin=False,
                is_active=True,
                email_verified=True
            )
            
            db.add(user)
            await db.commit()
            await db.refresh(user)
            
            print(f"✅ Created test user:")
            print(f"   Email: {user.email}")
            print(f"   Password: {password}")
            print(f"   ID: {user.id}")
            
        finally:
            await db.close()
            
    except Exception as e:
        print(f"❌ Failed to create test user: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(create_test_user())
