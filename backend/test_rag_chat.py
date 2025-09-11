#!/usr/bin/env python3
"""
Test RAG integration in chat.
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

from app.services.rag_service import rag_service
from app.core.database import get_async_session

async def test_rag_chat():
    """Test RAG integration with chat."""
    print("🧠 Testing RAG Chat Integration...")
    
    try:
        session_gen = get_async_session()
        db = await session_gen.__anext__()
        
        try:
            # Test different queries for different characters
            test_queries = [
                ("ataturk-001", "Eğitim hakkında ne düşünüyorsun?"),
                ("mevlana-001", "Aşk nedir?"),
                ("konfucyus-001", "Ahlak hakkında ne öğretirsin?")
            ]
            
            for character_id, query in test_queries:
                print(f"\n📋 Character: {character_id}")
                print(f"🔍 Query: {query}")
                
                # Test context retrieval
                context_results = await rag_service.retrieve_context(
                    character_id=character_id,
                    query=query,
                    top_k=3
                )
                
                print(f"📄 Found {len(context_results)} relevant chunks:")
                for i, result in enumerate(context_results):
                    print(f"  {i+1}. Source: {result.source_title}")
                    print(f"     Content: {result.content[:150]}...")
                    print(f"     Score: {result.score:.3f}")
                
                # Test character stats
                stats = await rag_service.get_character_stats(character_id, db)
                print(f"📊 Character Stats:")
                print(f"   - Sources: {stats.get('total_sources', 0)}")
                print(f"   - Chunks: {stats.get('total_chunks', 0)}")
                print(f"   - Ready: {stats.get('ready_for_chat', False)}")
                
                print("-" * 60)
            
        finally:
            await db.close()
            
    except Exception as e:
        print(f"❌ RAG Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_rag_chat())