#!/usr/bin/env python3
"""
Test file upload functionality.
"""
import os
import asyncio
import sys
from pathlib import Path
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

from app.services.file_service import file_service
from app.core.database import get_async_session
import io

class MockUploadFile:
    """Mock UploadFile for testing."""
    def __init__(self, filename: str, content: bytes, content_type: str = "text/plain"):
        self.filename = filename
        self.content_type = content_type
        self.file = io.BytesIO(content)
        self.size = len(content)
    
    async def read(self) -> bytes:
        self.file.seek(0)
        return self.file.read()
    
    async def seek(self, offset: int) -> None:
        self.file.seek(offset)

async def test_file_upload():
    """Test file upload and text extraction."""
    print("📁 Testing File Upload System...")
    
    try:
        session_gen = get_async_session()
        db = await session_gen.__anext__()
        
        try:
            # Test files to upload
            test_files = [
                {
                    "filename": "test_document.txt",
                    "content": """Ataturk'un Egitim Hakkindaki Gorusleri

Egitim, milletimizin gelecegini insa eden en temel ve kutsal gorevdir. Benim icin egitim demek; "fikri hur, vicdani hur, irfani hur" nesiller yetistirmek demektir.

Hayatta en hakiki mursit ilimdir. Egitim, dogmalardan arinmis, bilimsel dusunceyi benimsetmeli. Genc dimaglar, aklin ve pozitif bilimin rehberliginde yetismeli.

Kiz-erkek ayrimi olmaksizin, tum vatandaslarimiz esit egitim hakkina sahiptir. Egitim kurumlari laik olmali, din istismarına asla izin vermemeli. Kadinlarimizin egitimi ise medeniyet yolundaki en buyuk kaldiracimizddir.

Egitim, milli kulturumuzle beslenmeli ancak cagin gerekliliklerine gore sekillenmeli. Tarih bilinci, dil sevgisi ve vatanperverlik, mufredatin temel taslari olmali.

Milletleri kurtaranlar yalniz ve ancak ogretmenlerdir. Ogretmenler, Cumhuriyet'in fedakar mimarlaridir. Onlara sosyal ve bilimsel donanimm saglamak, devletin en buyuk sorumlulugudur.""".encode('utf-8'),
                    "content_type": "text/plain",
                    "character_id": "ataturk-001",
                    "title": "Atatürk'ün Eğitim Görüşleri - Test Dokümanı"
                },
                {
                    "filename": "mevlana_teachings.md",
                    "content": """# Mevlana'nin Sevgi ve Tolerans Ogretileri

## Ask ve Sevgi

Ask, kainatin mayasidir. Her sey asktan var oldu ve aska donecektir. Kalbinizi sevgiyle doldurun, cunku sevgi, ruhu arindiran en guclu ilactir.

Hosgoru, buyuk kalplerin alameti farikasıdir. Insanlari din, dil, irk ayrimi yapmaksizin sevmek gerekir. Zira insan, hangi milletten, hangi dinden olursa olsun, Hakk'in bir tecelliaidir.

## Evrensel Mesaj

Gel, gel, ne olursan yine gel. Ister kafir, ister mecusi, ister puta tapan ol, yine gel. Bizim dergahimiz umitsizlik dergahi degildir. Yuz kere tovbeni bozmus olsan da yine gel.

Askin atesi, kalpteki tum kotullukleri yakar. Nefret ve kin, kalbi karartir; sevgi ise onu nurlandirir. Ask, insani insan yapan en guzel duygudur.

## Maneviyat ve Yolculuk

Her nefeste olup diriliriz. Bu dunya bir koprüdur, uzerinde saray kurma. Onemli olan, bu dunyada nasil gectigimiz degil, obur dunyaya nasil hazirlandigimizdir.""".encode('utf-8'),
                    "content_type": "text/markdown",
                    "character_id": "mevlana-001",
                    "title": "Mevlana'nın Sevgi ve Hoşgörü Öğretileri - Test"
                }
            ]
            
            for test_file in test_files:
                print(f"\n📄 Testing upload: {test_file['filename']}")
                
                # Create mock upload file
                mock_file = MockUploadFile(
                    filename=test_file['filename'],
                    content=test_file['content'],
                    content_type=test_file['content_type']
                )
                
                # Test file validation
                print("   🔍 Validating file...")
                validation_result = await file_service.validate_file(mock_file)
                print(f"   ✅ File validated: {validation_result['file_extension']}")
                
                # Test file saving
                print("   💾 Saving file...")
                file_info = await file_service.save_file(
                    file=mock_file,
                    character_id=test_file['character_id'],
                    source_title=test_file['title']
                )
                print(f"   📁 File saved: {file_info['relative_path']}")
                print(f"   📏 File size: {file_info['file_size']} bytes")
                
                # Test text extraction
                print("   📝 Extracting text...")
                text_info = await file_service.extract_text(file_info['file_path'])
                print(f"   📊 Text extracted:")
                print(f"      - Word count: {text_info['word_count']}")
                print(f"      - Char count: {text_info['char_count']}")
                print(f"      - Content preview: {text_info['content'][:100]}...")
                
                # Test file info retrieval
                print("   ℹ️ Getting file info...")
                info = await file_service.get_file_info(file_info['file_path'])
                print(f"   📋 File info: {info['filename']} ({info['file_size']} bytes)")
                
                # Clean up test file
                await file_service.delete_file(file_info['file_path'])
                print("   🗑️ Test file cleaned up")
                
                print("   ✅ File upload test completed!")
                print("-" * 60)
            
            print("\n🎉 All file upload tests completed successfully!")
            
        finally:
            await db.close()
            
    except Exception as e:
        print(f"❌ File upload test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_file_upload())