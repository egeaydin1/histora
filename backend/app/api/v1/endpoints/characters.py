"""
Character management endpoints — served from the seed catalogue.
"""

from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Optional

from app.data.characters_seed import (
    CHARACTERS,
    get_categories_with_counts,
    get_character as lookup_character,
)

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
):
    """Get list of published characters."""
    result = CHARACTERS
    if category:
        result = [c for c in result if c["category"] == category]
    if featured_only:
        result = [c for c in result if c["is_featured"]]
    return result[offset:offset + limit]


@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(
    language: str = Query("tr", description="Response language"),
):
    """Get list of character categories with counts."""
    return get_categories_with_counts()


@router.get("/{character_id}", response_model=CharacterResponse)
async def get_character(
    character_id: str,
    language: str = Query("tr", description="Response language"),
):
    """Get character details by ID."""
    character = lookup_character(character_id)
    if character:
        return character
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Character '{character_id}' not found",
    )
