#!/usr/bin/env python3
"""
Publish all characters (set is_published=True).
"""
import os
import asyncio
import sys
from pathlib import Path

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
from app.models.database import Character
from sqlalchemy import select, update

async def publish_characters():
    """Publish all characters."""
    print("📰 Publishing all characters...")
    
    try:
        session_gen = get_async_session()
        db = await session_gen.__anext__()
        
        try:
            # Update all characters to be published
            result = await db.execute(
                update(Character).values(is_published=True)
            )
            
            await db.commit()
            
            # Get count of published characters
            result = await db.execute(select(Character).where(Character.is_published == True))
            characters = result.scalars().all()
            
            print(f"✅ Published {len(characters)} characters:")
            for char in characters:
                print(f"  - {char.name} ({char.id})")
            
        finally:
            await db.close()
            
    except Exception as e:
        print(f"❌ Failed to publish characters: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(publish_characters())