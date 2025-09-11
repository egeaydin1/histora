#!/usr/bin/env python3
"""
Test real file upload API endpoint.
"""
import os
import asyncio
import sys
from pathlib import Path
import json
import tempfile

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

import httpx

async def test_real_file_upload():
    """Test real file upload API endpoint."""
    print("📁 Testing Real File Upload API...")
    
    base_url = "http://localhost:8000"
    
    try:
        async with httpx.AsyncClient() as client:
            # Test health first
            print("🏥 Testing health endpoint...")
            health_response = await client.get(f"{base_url}/api/v1/health")
            if health_response.status_code != 200:
                print(f"❌ Backend not accessible: {health_response.status_code}")
                return
            print("✅ Backend is healthy!")
            
            # Get admin access token (mock for now)
            admin_token = "demo_admin_token_12345"
            headers = {"Authorization": f"Bearer {admin_token}"}
            
            # Create a test text file
            test_content = """Osmanlı Devleti'nde Modernleşme Çabaları

19. yüzyılda Osmanlı Devleti, Batı karşısında yaşadığı gerilemeden kurtulmak için köklü reformlara girişti. Bu modernleşme süreci, askeri alandaki yenilgilerle başlayıp, toplumsal ve kültürel dönüşümlerle devam etti.

Tanzimat Fermanı (1839) ile başlayan reform hareketleri, hukuk, eğitim, yönetim ve ekonomi alanlarında köklü değişiklikleri beraberinde getirdi. Osmanlı entelektüelleri, geleneksel yapıları koruyarak modern kurumları benimseme arayışına girdiler.

Namık Kemal, Ziya Paşa ve diğer Yeni Osmanlılar, anayasal monarşi fikrini savunurken, milliyetçilik düşüncesinin de temellerini attılar. Bu süreç, sonrasında Türk milliyetçiliğinin doğmasına zemin hazırladı."""
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
                f.write(test_content)
                temp_file_path = f.name
            
            try:
                # Test file upload
                print("📤 Testing file upload...")
                
                with open(temp_file_path, 'rb') as file_data:
                    files = {'file': ('test_modernization.txt', file_data, 'text/plain')}
                    data = {'title': 'Osmanlı Modernleşme Çabaları - Test Dokümanı'}
                    
                    upload_response = await client.post(
                        f"{base_url}/api/v1/admin/characters/ataturk-001/sources/upload",
                        files=files,
                        data=data,
                        headers=headers
                    )
                
                print(f"📊 Upload Response Status: {upload_response.status_code}")
                
                if upload_response.status_code == 200:
                    result = upload_response.json()
                    print("✅ File uploaded successfully!")
                    print(f"   📄 Source ID: {result['id']}")
                    print(f"   📁 File path: {result['file_path']}")
                    print(f"   📏 File size: {result['file_size']} bytes")
                    print(f"   🔄 Processing status: {result['processing_status']}")
                    print(f"   📦 Chunk count: {result['chunk_count']}")
                    
                    # Test source retrieval
                    print("\n📋 Testing source retrieval...")
                    source_response = await client.get(
                        f"{base_url}/api/v1/admin/characters/ataturk-001/sources",
                        headers=headers
                    )
                    
                    if source_response.status_code == 200:
                        sources = source_response.json()
                        print(f"✅ Retrieved {len(sources)} sources for character")
                        
                        # Find our uploaded source
                        uploaded_source = next((s for s in sources if s['id'] == result['id']), None)
                        if uploaded_source:
                            print(f"   📄 Found uploaded source: {uploaded_source['title']}")
                            print(f"   ✅ Is processed: {uploaded_source['is_processed']}")
                        else:
                            print("   ⚠️ Uploaded source not found in list")
                    else:
                        print(f"   ❌ Failed to retrieve sources: {source_response.status_code}")
                        print(f"   Error: {source_response.text}")
                    
                    # Clean up: delete the uploaded source
                    print("\n🗑️ Cleaning up...")
                    delete_response = await client.delete(
                        f"{base_url}/api/v1/admin/sources/{result['id']}",
                        headers=headers
                    )
                    
                    if delete_response.status_code == 200:
                        print("✅ Source deleted successfully")
                    else:
                        print(f"   ⚠️ Failed to delete source: {delete_response.status_code}")
                    
                else:
                    print(f"❌ File upload failed: {upload_response.status_code}")
                    print(f"Error: {upload_response.text}")
                
            finally:
                # Clean up temp file
                os.unlink(temp_file_path)
                
        print("\n🎉 File upload API test completed!")
        
    except Exception as e:
        print(f"❌ File upload API test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_real_file_upload())
