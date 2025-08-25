"""
AI Service for character chat using OpenRouter + Llama 3.1
"""

import asyncio
import json
import time
import httpx
from typing import Dict, List, Optional, Any
from pydantic import BaseModel

from app.core.config import get_settings


class ChatMessage(BaseModel):
    role: str  # "system", "user", "assistant"
    content: str


class AIResponse(BaseModel):
    content: str
    character_id: str
    usage: Optional[Dict[str, Any]] = None
    model_used: str
    response_time: float


class CharacterPrompt(BaseModel):
    character_id: str
    system_prompt: str
    personality_traits: List[str]
    speaking_style: str
    knowledge_context: str


class AIService:
    """AI Service using OpenRouter for character conversations."""
    
    def __init__(self):
        self.settings = get_settings()
        self.client = httpx.AsyncClient(
            base_url=self.settings.openrouter_base_url,
            headers={
                "Authorization": f"Bearer {self.settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": self.settings.backend_url,
                "X-Title": "Histora - AI Historical Chat"
            },
            timeout=30.0
        )
        
        # Character prompts
        self.character_prompts = {
            "ataturk-001": CharacterPrompt(
                character_id="ataturk-001",
                system_prompt="""Sen Mustafa Kemal Atatürk'sün. Türkiye Cumhuriyeti'nin kurucusu ve ilk Cumhurbaşkanısın (1881-1938). 

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
                personality_traits=["vizyoner", "kararlı", "modernist", "lider"],
                speaking_style="Resmi ama sıcak, öğretici",
                knowledge_context="Türkiye Cumhuriyeti kuruluşu, Kurtuluş Savaşı, devrimler"
            ),
            
            "mevlana-001": CharacterPrompt(
                character_id="mevlana-001",
                system_prompt="""Sen Mevlana Celaleddin Rumi'sin. 13. yüzyılın büyük mutasavvıf, şair ve filozofusun.

KARAKTER ÖZELLİKLERİN:
- Sevgi ve hoşgörü timsali
- Derin maneviyat
- Evrensel barış mesajı
- İnsan sevgisi
- Bilgelik ve hikmet

KONUŞMA TARZI:
- Şiirsel ve metaforik
- Sıcak ve kucaklayıcı
- Hikayeler ve benzetmeler
- Sufi terminolojisi
- "Kardeşim", "Sevgili" hitapları

TEMEL KONULAR:
- Aşk ve sevgi
- Hoşgörü ve anlayış
- Maneviyat
- İnsan birliği
- Sufi öğretiler
- İçsel yolculuk

Türkçe konuş ve karakterine uygun yanıtlar ver. Ara sıra Farsça kelimeler kullanabilirsin.""",
                personality_traits=["sevgi dolu", "hoşgörülü", "bilge", "şair"],
                speaking_style="Şiirsel, metaforik, sıcak",
                knowledge_context="Tasavvuf, Mesnevi, Sufi öğretiler, 13. yüzyıl Anadolu"
            ),
            
            "konfucyus-001": CharacterPrompt(
                character_id="konfucyus-001",
                system_prompt="""Sen Konfüçyüs'sün. Antik Çin'in büyük filozofu ve öğretmensin.

KARAKTER ÖZELLİKLERİN:
- Bilgelik ve erdeme odaklanma
- Eğitimin önemi
- Toplumsal düzen
- Ahlaki değerler
- Saygı ve tevazu

KONUŞMA TARZI:
- Ölçülü ve düşünceli
- Öğretici ve rehber
- Örneklerle açıklama
- Sorularla düşündürme
- "Evladım", "Öğrencim" hitapları

TEMEL KONULAR:
- Erdem ve ahlak
- Eğitim ve öğrenme
- Toplumsal ilişkiler
- Yönetim sanatı
- Saygı ve görev
- Bilgelik arayışı

Türkçe konuş ve karakterine uygun yanıtlar ver. Bazen Çince atasözleri çevirisini kullanabilirsin.""",
                personality_traits=["bilge", "öğretici", "ahlaklı", "saygılı"],
                speaking_style="Ölçülü, öğretici, düşündürücü",
                knowledge_context="Antik Çin felsefesi, Konfüçyüsçülük, yönetim, eğitim"
            )
        }

    async def get_character_response(
        self,
        character_id: str,
        user_message: str,
        chat_history: List[ChatMessage] = None,
        language: str = "tr"
    ) -> AIResponse:
        """Get AI response for character chat."""
        
        import time
        start_time = time.time()
        
        # Check if we have a real API key
        if not self.settings.openrouter_api_key or self.settings.openrouter_api_key == "demo_openrouter_key":
            # Return mock response with realistic delay
            await asyncio.sleep(1.0 + (len(user_message) * 0.01))  # Realistic delay
            return await self._get_mock_response(character_id, user_message, start_time)
        
        # Real OpenRouter API call
        try:
            character_prompt = self.character_prompts.get(character_id)
            if not character_prompt:
                raise ValueError(f"Character {character_id} not found")
            
            # Build messages
            messages = [{"role": "system", "content": character_prompt.system_prompt}]
            
            # Add chat history
            if chat_history:
                for msg in chat_history[-10:]:  # Last 10 messages for context
                    messages.append({"role": msg.role, "content": msg.content})
            
            # Add current user message
            messages.append({"role": "user", "content": user_message})
            
            # Make API call
            response = await self.client.post(
                "/chat/completions",
                json={
                    "model": self.settings.default_ai_model,
                    "messages": messages,
                    "max_tokens": self.settings.ai_max_tokens,
                    "temperature": self.settings.ai_temperature,
                    "top_p": self.settings.ai_top_p,
                    "stream": False
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenRouter API error: {response.status_code} - {response.text}")
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            return AIResponse(
                content=content,
                character_id=character_id,
                usage=data.get("usage"),
                model_used=data.get("model", self.settings.default_ai_model),
                response_time=time.time() - start_time
            )
            
        except Exception as e:
            print(f"AI Service Error: {e}")
            # Fallback to mock response
            return await self._get_mock_response(character_id, user_message, start_time)

    async def _get_mock_response(self, character_id: str, user_message: str, start_time: float) -> AIResponse:
        """Generate mock response for development."""
        
        mock_responses = {
            "ataturk-001": [
                "Bu konu hakkında şunu söyleyebilirim: Türkiye'nin geleceği, gençlerin elindedir. Bilim ve teknolojiyi takip edin.",
                "Milli egemenlik, milletin kendi kendini yönetmesi demektir. Bu kutsal hakkımızı korumak hepimizin görevidir.",
                "Kadınlarımız da erkekler kadar eğitim görmelidir. Toplumun yarısını geri bırakarak ilerleyemeyiz.",
                "Cumhuriyet, halkın iradesinin egemen olduğu rejimdir. Bu rejimi yaşatmak için sürekli uyanık olmalıyız.",
                "Gençler! Sizler geleceğin mimarlarısınız. Atatürk'ün izinden gidin, cumhuriyeti koruyun.",
                "Barış evde, barış dünyada. Biz kimseyi toprakları için savaşa çağırmayız, ama vatanımızı koruruz."
            ],
            "mevlana-001": [
                "Sevgili kardeşim, aşk kalbin gözüdür. Her şeyi onunla görürüz.",
                "İnsanın en büyük hazinesi, kalbindeki sevgidir. Bu sevgiyi paylaştıkça çoğalır.",
                "Gel, gel, ne olursan ol yine gel. Binlerce kez pişman olsan da yine gel.",
                "Sevgi, bizi birbirimize bağlayan en güçlü köprüdür. Bu köprüyü güçlü tutmalıyız.",
                "Kardeşim, kalbini temizle ki Allah'ın nuru oraya dolsun. Kalp temiz olunca her şey güzelleşir.",
                "Hoşgörü, sevginin en güzel meyvesidir. Farklılıkları sevgiyle kucaklayalım."
            ],
            "konfucyus-001": [
                "Evladım, bilgelik öğrenmeyi asla bitirmemektir. Her gün yeni bir şey öğrenmeye çalış.",
                "Erdem, en değerli mücevherdir. Onu kazanmak için sabırlı olmak gerekir.",
                "Öğrencim, saygı ve sevgi insani ilişkilerin temelidir. Büyüklerine saygı göster.",
                "Bir toplumun temelini eğitim oluşturur. İyi bir eğitim almaya özen göster.",
                "Bilgelik, sadece bilgi biriktirmek değildir. Bilgiyi hayatta doğru kullanmaktır.",
                "Evladım, mükemmellik bir hedefe değil, yolculuğa ulaşmaktır. Sürekli gelişmeye çalış."
            ]
        }
        
        responses = mock_responses.get(character_id, mock_responses["ataturk-001"])
        
        # Select response based on message content for more realism
        import random
        random.seed(hash(user_message) % 2**32)
        selected_response = random.choice(responses)
        
        # Add contextual touches based on user message
        if "nasıl" in user_message.lower():
            if character_id == "ataturk-001":
                selected_response = "Bu konuda size şunu önerebilirim: " + selected_response
            elif character_id == "mevlana-001":
                selected_response = "Sevgili kardeşim, " + selected_response
            elif character_id == "konfucyus-001":
                selected_response = "Evladım, " + selected_response
        
        return AIResponse(
            content=selected_response,
            character_id=character_id,
            model_used="mock-deepseek-r1",
            response_time=time.time() - start_time
        )

    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()


# Global AI service instance
ai_service = AIService()


async def get_ai_service() -> AIService:
    """Dependency to get AI service."""
    return ai_service
