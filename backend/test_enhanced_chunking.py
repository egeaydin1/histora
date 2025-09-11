#!/usr/bin/env python3
"""
Test enhanced chunking system.
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

from app.services.enhanced_chunking import enhanced_chunker

def test_enhanced_chunking():
    """Test enhanced chunking functionality."""
    print("🧠 Testing Enhanced Chunking System...")
    
    # Test document with various structures
    test_document = """# Atatürk'ün Modernleşme Vizyonu

## Giriş

Mustafa Kemal Atatürk, Türkiye Cumhuriyeti'ni kurarken sadece politik bir devrim gerçekleştirmedi; aynı zamanda toplumsal, kültürel ve ekonomik alanlarında köklü dönüşümler başlattı.

## Laik Devlet Anlayışı

Atatürk'ün en önemli reformlarından biri laiklik ilkesi oldu. Bu konuda şunları söyledi:

> "Türkiye Cumhuriyeti laik bir devlettir. Din, devlet işlerinden ayrı tutulmalıdır."

### Laiklik Reformları

Laiklikle ilgili gerçekleştirilen başlıca reformlar şunlardır:

- Hilafetin kaldırılması (1924)
- Şer'iye mahkemelerinin kapatılması
- Medreselerin eğitim bakanlığına bağlanması
- Tekke ve zaviyelerin kapatılması

## Kadın Hakları

Atatürk, kadınların toplumsal hayatta eşit konuma gelmesi için büyük çaba sarf etti. Kadınlara siyasi haklar verildi, eğitim olanakları genişletildi.

"Milletimizin yarısını teşkil eden kadınlarımız, erkeklerimizle beraber ilim ve fende ilerlemeye çağrılmalıdır."

## Eğitim Devrimi

### Harf İnkılabı

Latin harflerinin kabulü (1928), eğitim alanındaki en önemli reformdu. Bu değişiklik:

1. Okuma yazma oranını artırdı
2. Batı bilim ve kültürüne açılım sağladı  
3. Modern eğitim sisteminin temelini attı

### Üniversite Reformu

İstanbul Darülfünunu kapatılarak yerine modern İstanbul Üniversitesi kuruldu. Yabancı profesörler davet edildi ve bilimsel çalışmalar desteklendi.

## Ekonomik Kalkınma

Atatürk döneminde ekonomik bağımsızlık hedefleniyordu. Milli iktisat politikası benimsenmiş, sanayileşme teşvik edilmişti.

Devletçilik ilkesi çerçevesinde kamu sektörü önemli role sahipti. Özel sektör de desteklenmişti.

## Sonuç

Atatürk'ün modernleşme projesi, sadece kurumsal değişiklikleri değil, toplumsal zihniyet dönüşümünü de hedefliyordu. Bu vizyon, Türkiye'yi çağdaş medeniyetler seviyesine çıkarmayı amaçlıyordu."""

    character_info = {
        'name': 'Mustafa Kemal Atatürk',
        'era': '1881-1938'
    }
    
    source_info = {
        'title': 'Atatürk\'ün Modernleşme Vizyonu',
        'type': 'historical_analysis'
    }
    
    print("📄 Processing test document...")
    print(f"   Original length: {len(test_document)} characters")
    print(f"   Word count: {len(test_document.split())} words")
    
    # Test with different chunk sizes
    test_sizes = [500, 800, 1200]
    
    for target_size in test_sizes:
        print(f"\n🔍 Testing with chunk size: {target_size}")
        
        try:
            chunks = enhanced_chunker.chunk_with_context(
                text=test_document,
                character_info=character_info,
                source_info=source_info,
                target_size=target_size,
                overlap_size=150
            )
            
            print(f"   ✅ Created {len(chunks)} chunks")
            
            for i, chunk in enumerate(chunks):
                print(f"   📦 Chunk {i+1}:")
                print(f"      Type: {chunk['type']}")
                print(f"      Words: {chunk['metadata']['word_count']}")
                print(f"      Quality: {chunk['metadata'].get('quality_score', 'N/A'):.2f}")
                print(f"      Has overlap: {chunk['metadata'].get('has_overlap', False)}")
                print(f"      Preview: {chunk['content'][:100]}...")
                print()
            
            # Calculate total coverage
            total_chars = sum(len(chunk['content']) for chunk in chunks)
            print(f"   📊 Coverage: {total_chars} chars ({total_chars/len(test_document)*100:.1f}%)")
            
        except Exception as e:
            print(f"   ❌ Failed with chunk size {target_size}: {e}")
            import traceback
            traceback.print_exc()
        
        print("-" * 60)
    
    # Test structure extraction
    print("\n🏗️ Testing structure extraction...")
    try:
        structure = enhanced_chunker.extract_structure(test_document)
        
        print(f"   📋 Found {len(structure['paragraphs'])} paragraphs")
        print(f"   📋 Found {len(structure['sentences'])} sentences")
        print(f"   📋 Found {len(structure['headers'])} headers")
        print(f"   📋 Found {len(structure['lists'])} list items")
        print(f"   📋 Found {len(structure['quotes'])} quotes")
        
        if structure['headers']:
            print("\n   🏷️ Headers found:")
            for header in structure['headers']:
                print(f"      H{header['level']}: {header['title']}")
        
        if structure['lists']:
            print("\n   📝 List items found:")
            for item in structure['lists'][:3]:  # Show first 3
                print(f"      • {item}")
            if len(structure['lists']) > 3:
                print(f"      ... and {len(structure['lists']) - 3} more")
        
        if structure['quotes']:
            print("\n   💬 Quotes found:")
            for quote in structure['quotes']:
                print(f"      {quote}")
        
    except Exception as e:
        print(f"   ❌ Structure extraction failed: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n🎉 Enhanced chunking test completed!")

if __name__ == "__main__":
    test_enhanced_chunking()
