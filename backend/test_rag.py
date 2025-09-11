#!/usr/bin/env python3
"""
Test RAG service functionality.
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
from app.models.database import Character, CharacterSource
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

async def test_rag_service():
    """Test RAG service functionality."""
    print("🔄 Testing RAG Service...")
    
    try:
        # Health check
        print("🔍 Checking RAG service health...")
        health = await rag_service.health_check()
        print(f"✅ RAG Health: {health}")
        
        # Test text chunking
        print("\n🔄 Testing text chunking...")
        sample_text = """
        Mustafa Kemal Atatürk (1881-1938), Türkiye Cumhuriyeti'nin kurucusu ve ilk Cumhurbaşkanıdır. 
        
        Kurtuluş Savaşı'nın lideri olarak, işgal kuvvetlerine karşı mücadele etmiş ve modern Türkiye'yi kurmuştur. 
        
        Atatürk'ün en önemli reformları arasında kadın hakları, laiklik, ve eğitim alanındaki yenilikler yer alır.
        
        "Hayatta en hakiki mürşit ilimdir" sözü onun bilime verdiği önemi gösterir.
        """
        
        chunks = rag_service.chunk_text(sample_text.strip(), chunk_size=200, overlap=50)
        print(f"✅ Created {len(chunks)} chunks:")
        for i, chunk in enumerate(chunks):
            print(f"  Chunk {i}: {chunk[:100]}...")
        
        # Test embedding
        print("\n🔄 Testing text embedding...")
        embedding = await rag_service.embed_text("Atatürk eğitim reformları")
        print(f"✅ Generated embedding with {len(embedding)} dimensions")
        print(f"  Sample values: {embedding[:5]}...")
        
        # Test with database (if available)
        print("\n🔄 Testing database integration...")
        try:
            session_gen = get_async_session()
            db_session = await session_gen.__anext__()
            
            try:
                # Create test character
                test_character = Character(
                    id="test-ataturk",
                    name="Mustafa Kemal Atatürk (Test)",
                    category="leader",
                    is_published=False
                )
                
                # Create test source
                test_source = CharacterSource(
                    id=uuid.uuid4(),
                    character_id="test-ataturk",
                    title="Atatürk Test Makalesi",
                    content=sample_text.strip(),
                    source_type="text"
                )
                
                db_session.add(test_character)
                db_session.add(test_source)
                await db_session.commit()
                
                print(f"✅ Created test character and source")
                
                # Process the source
                print("🔄 Processing source for embeddings...")
                success = await rag_service.process_character_source(
                    character_id="test-ataturk",
                    source_id=test_source.id,
                    db_session=db_session
                )
                
                if success:
                    print("✅ Source processed successfully!")
                    
                    # Test retrieval
                    print("🔄 Testing context retrieval...")
                    results = await rag_service.retrieve_context(
                        character_id="test-ataturk",
                        query="Atatürk'ün eğitim hakkındaki görüşleri",
                        top_k=3
                    )
                    
                    print(f"✅ Retrieved {len(results)} relevant chunks:")
                    for i, result in enumerate(results):
                        print(f"  Result {i} (score: {result.score:.3f}): {result.content[:100]}...")
                    
                    # Get stats
                    print("🔄 Getting character stats...")
                    stats = await rag_service.get_character_stats("test-ataturk", db_session)
                    print(f"✅ Character stats: {stats}")
                    
                else:
                    print("❌ Failed to process source")
                
                # Cleanup
                await db_session.delete(test_character)
                await db_session.delete(test_source)
                await db_session.commit()
                print("🧹 Cleaned up test data")
                
            finally:
                await db_session.close()
                
        except Exception as e:
            print(f"⚠️ Database test skipped: {e}")
        
        print("\n🎉 RAG Service test completed successfully!")
        
    except Exception as e:
        print(f"❌ RAG Service test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_rag_service())
