#!/usr/bin/env python3
"""
Test real chat with RAG integration.
"""
import os
import asyncio
import sys
from pathlib import Path
import json

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
    "OPENROUTER_API_KEY": "demo_openrouter_key",  # Mock key for testing
    "ENVIRONMENT": "development",
    "DEBUG": "true"
})

import httpx

async def test_real_chat():
    """Test real chat endpoint with RAG."""
    print("💬 Testing Real Chat with RAG...")
    
    base_url = "http://localhost:8000/api/v1"
    
    # Test messages for different characters
    test_cases = [
        {
            "character_id": "ataturk-001",
            "message": "Eğitim sistemi hakkında ne düşünüyorsunuz?",
            "expected_keywords": ["eğitim", "öğretmen", "hür", "bilim"]
        },
        {
            "character_id": "mevlana-001", 
            "message": "Aşk nedir ve nasıl tanımlarsınız?",
            "expected_keywords": ["aşk", "sevgi", "kalp", "ruh"]
        },
        {
            "character_id": "konfucyus-001",
            "message": "Erdemli bir yaşam için ne önerirsiniz?",
            "expected_keywords": ["erdem", "ahlak", "saygı", "adalet"]
        }
    ]
    
    async with httpx.AsyncClient() as client:
        
        for test_case in test_cases:
            print(f"\n🎭 Testing chat with {test_case['character_id']}")
            print(f"💬 User message: {test_case['message']}")
            
            try:
                # Send chat request
                response = await client.post(
                    f"{base_url}/chat/send",
                    json={
                        "character_id": test_case["character_id"],
                        "message": test_case["message"],
                        "language": "tr",
                        "mode": "chat"
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    print(f"🤖 AI Response: {data['response']}")
                    print(f"⚡ Response time: {data['response_time']:.2f}s")
                    print(f"🧠 Model used: {data['model_used']}")
                    
                    # Check if RAG context is being used
                    response_text = data['response'].lower()
                    context_found = any(keyword in response_text for keyword in test_case['expected_keywords'])
                    
                    if context_found:
                        print("✅ RAG context seems to be working (keywords found)")
                    else:
                        print("⚠️ RAG context might not be working (no expected keywords)")
                    
                    if data.get('usage'):
                        print(f"📊 Token usage: {data['usage']}")
                    
                else:
                    print(f"❌ Chat failed: {response.status_code}")
                    print(f"Error: {response.text}")
                
            except Exception as e:
                print(f"❌ Chat error: {e}")
            
            print("-" * 80)

if __name__ == "__main__":
    asyncio.run(test_real_chat())
