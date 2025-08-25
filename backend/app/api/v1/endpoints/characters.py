"""
Character management endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Optional

from app.core.config import get_settings, Settings

router = APIRouter()


class CharacterResponse(BaseModel):
    """Character response model."""
    id: str
    name: str
    name_tr: Optional[str]
    name_en: Optional[str]
    category: str
    era: Optional[str]
    birth_year: Optional[int]
    death_year: Optional[int]
    birth_place: Optional[str]
    short_bio_tr: Optional[str]
    short_bio_en: Optional[str]
    personality_traits: List[str]
    avatar_url: Optional[str]
    status: str
    is_featured: bool
    view_count: int


class CategoryResponse(BaseModel):
    """Category response model."""
    id: str
    name: str
    name_tr: Optional[str]
    name_en: Optional[str]
    description_tr: Optional[str]
    description_en: Optional[str]
    icon: Optional[str]
    character_count: int


@router.get("/", response_model=List[CharacterResponse])
async def get_characters(
    category: Optional[str] = Query(None, description="Filter by category"),
    language: str = Query("tr", description="Response language"),
    featured_only: bool = Query(False, description="Show only featured characters"),
    limit: int = Query(50, le=100, description="Maximum number of characters"),
    offset: int = Query(0, description="Offset for pagination"),
    settings: Settings = Depends(get_settings)
):
    """Get list of published characters."""
    
    # TODO: Query database for characters
    # TODO: Apply filters (category, featured, language)
    # TODO: Apply pagination
    # TODO: Return character list
    
    # Placeholder data with MVP characters
    placeholder_characters = [
        {
            "id": "ataturk-001",
            "name": "Mustafa Kemal Atatürk",
            "name_tr": "Mustafa Kemal Atatürk",
            "name_en": "Mustafa Kemal Atatürk",
            "category": "leaders",
            "era": "Modern Turkey",
            "birth_year": 1881,
            "death_year": 1938,
            "birth_place": "Selanik",
            "short_bio_tr": "Türkiye Cumhuriyeti'nin kurucusu ve ilk Cumhurbaşkanı",
            "short_bio_en": "Founder and first President of the Republic of Turkey",
            "personality_traits": ["vizyoner", "kararlı", "modernist", "lider"],
            "avatar_url": "/avatars/ataturk.jpg",
            "status": "published",
            "is_featured": True,
            "view_count": 1250
        },
        {
            "id": "mevlana-001",
            "name": "Mevlana Celaleddin Rumi",
            "name_tr": "Mevlana Celaleddin Rumi",
            "name_en": "Jalal ad-Din Muhammad Rumi",
            "category": "philosophers",
            "era": "13th Century",
            "birth_year": 1207,
            "death_year": 1273,
            "birth_place": "Belh",
            "short_bio_tr": "Büyük mutasavvıf, şair ve filozof",
            "short_bio_en": "Great Sufi mystic, poet and philosopher",
            "personality_traits": ["sevgi dolu", "hoşgörülü", "bilge", "şair"],
            "avatar_url": "/avatars/mevlana.jpg",
            "status": "published",
            "is_featured": True,
            "view_count": 980
        },
        {
            "id": "konfucyus-001",
            "name": "Konfüçyüs",
            "name_tr": "Konfüçyüs",
            "name_en": "Confucius",
            "category": "philosophers",
            "era": "Spring and Autumn period",
            "birth_year": -551,
            "death_year": -479,
            "birth_place": "Lu State, China",
            "short_bio_tr": "Çin filozofu ve öğretmen",
            "short_bio_en": "Chinese philosopher and teacher",
            "personality_traits": ["bilge", "öğretici", "erdemli", "saygılı"],
            "avatar_url": "/avatars/confucius.jpg",
            "status": "published",
            "is_featured": True,
            "view_count": 750
        }
    ]
    
    return placeholder_characters


@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(
    language: str = Query("tr", description="Response language"),
    settings: Settings = Depends(get_settings)
):
    """Get list of character categories."""
    
    # TODO: Query database for categories
    # TODO: Count characters in each category
    # TODO: Return category list
    
    # Placeholder categories
    placeholder_categories = [
        {
            "id": "leaders",
            "name": "leaders",
            "name_tr": "Liderler",
            "name_en": "Leaders",
            "description_tr": "Tarihte iz bırakmış liderler",
            "description_en": "Historical leaders who left their mark",
            "icon": "crown",
            "character_count": 2
        },
        {
            "id": "philosophers",
            "name": "philosophers",
            "name_tr": "Filozoflar",
            "name_en": "Philosophers",
            "description_tr": "Düşünce dünyasını şekillendiren filozoflar",
            "description_en": "Philosophers who shaped the world of thought",
            "icon": "brain",
            "character_count": 3
        },
        {
            "id": "scientists",
            "name": "scientists",
            "name_tr": "Bilim İnsanları",
            "name_en": "Scientists",
            "description_tr": "Bilim dünyasına katkı yapmış isimler",
            "description_en": "Names who contributed to the world of science",
            "icon": "microscope",
            "character_count": 2
        }
    ]
    
    return placeholder_categories


@router.get("/{character_id}", response_model=CharacterResponse)
async def get_character(
    character_id: str,
    language: str = Query("tr", description="Response language"),
    settings: Settings = Depends(get_settings)
):
    """Get character details by ID."""
    
    # TODO: Query database for character
    # TODO: Increment view count
    # TODO: Return character details
    
    # Normalize character ID (handle both Turkish and ASCII versions)
    normalized_id = character_id.lower().replace("ü", "u").replace("ç", "c")
    
    # Character data mapping
    characters_map = {
        "ataturk-001": {
            "id": "ataturk-001",
            "name": "Mustafa Kemal Atatürk",
            "name_tr": "Mustafa Kemal Atatürk",
            "name_en": "Mustafa Kemal Atatürk",
            "category": "leaders",
            "era": "Modern Turkey",
            "birth_year": 1881,
            "death_year": 1938,
            "birth_place": "Selanik",
            "short_bio_tr": "Türkiye Cumhuriyeti'nin kurucusu ve ilk Cumhurbaşkanı",
            "short_bio_en": "Founder and first President of the Republic of Turkey",
            "personality_traits": ["vizyoner", "kararlı", "modernist", "lider"],
            "avatar_url": "/avatars/ataturk.jpg",
            "status": "published",
            "is_featured": True,
            "view_count": 1251
        },
        "mevlana-001": {
            "id": "mevlana-001",
            "name": "Mevlana Celaleddin Rumi",
            "name_tr": "Mevlana Celaleddin Rumi",
            "name_en": "Jalal ad-Din Muhammad Rumi",
            "category": "philosophers",
            "era": "13th Century",
            "birth_year": 1207,
            "death_year": 1273,
            "birth_place": "Belh",
            "short_bio_tr": "Büyük mutasavvıf, şair ve filozof",
            "short_bio_en": "Great Sufi mystic, poet and philosopher",
            "personality_traits": ["sevgi dolu", "hoşgörülü", "bilge", "şair"],
            "avatar_url": "/avatars/mevlana.jpg",
            "status": "published",
            "is_featured": True,
            "view_count": 981
        },
        "konfucyus-001": {
            "id": "konfucyus-001",
            "name": "Konfüçyüs",
            "name_tr": "Konfüçyüs",
            "name_en": "Confucius",
            "category": "philosophers",
            "era": "Spring and Autumn period",
            "birth_year": -551,
            "death_year": -479,
            "birth_place": "Lu State, China",
            "short_bio_tr": "Çin filozofu ve öğretmen",
            "short_bio_en": "Chinese philosopher and teacher",
            "personality_traits": ["bilge", "öğretici", "erdemli", "saygılı"],
            "avatar_url": "/avatars/confucius.jpg",
            "status": "published",
            "is_featured": True,
            "view_count": 751
        }
    }
    
    # Find character by normalized ID
    character_data = characters_map.get(normalized_id)
    
    if character_data:
        return character_data
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Character '{character_id}' not found"
    )
