"""
Admin panel endpoints for character and content management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.config import get_settings, Settings

router = APIRouter()


class CharacterCreate(BaseModel):
    """Character creation model."""
    name: str
    name_tr: Optional[str] = None
    name_en: Optional[str] = None
    category: str
    era: Optional[str] = None
    birth_year: Optional[int] = None
    death_year: Optional[int] = None
    birth_place: Optional[str] = None
    short_bio_tr: Optional[str] = None
    short_bio_en: Optional[str] = None
    personality_traits: List[str] = []
    speaking_style_tr: Optional[str] = None
    speaking_style_en: Optional[str] = None


class CharacterUpdate(BaseModel):
    """Character update model."""
    name: Optional[str] = None
    name_tr: Optional[str] = None
    name_en: Optional[str] = None
    category: Optional[str] = None
    era: Optional[str] = None
    birth_year: Optional[int] = None
    death_year: Optional[int] = None
    birth_place: Optional[str] = None
    short_bio_tr: Optional[str] = None
    short_bio_en: Optional[str] = None
    personality_traits: Optional[List[str]] = None
    speaking_style_tr: Optional[str] = None
    speaking_style_en: Optional[str] = None
    status: Optional[str] = None  # 'draft', 'published', 'archived'
    is_featured: Optional[bool] = None


class DocumentUpload(BaseModel):
    """Document upload response model."""
    id: str
    character_id: str
    title: str
    content_type: str
    language: str
    word_count: int
    created_at: datetime


class EmbeddingJob(BaseModel):
    """Embedding job model."""
    id: str
    character_id: str
    character_name: str
    total_documents: int
    processed_documents: int
    failed_documents: int
    status: str  # 'pending', 'processing', 'completed', 'failed'
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime


# TODO: Add admin authentication middleware
# @router.middleware("http")
# async def verify_admin(request: Request, call_next):
#     # Verify admin API key or Firebase admin role
#     pass


@router.post("/characters", response_model=dict)
async def create_character(
    character: CharacterCreate,
    settings: Settings = Depends(get_settings)
):
    """Create a new character."""
    
    # TODO: Validate admin permissions
    # TODO: Create character in database
    # TODO: Return character data
    
    character_id = str(uuid.uuid4())
    
    return {
        "id": character_id,
        "message": "Character created successfully",
        "status": "draft"
    }


@router.get("/characters", response_model=List[dict])
async def get_all_characters(
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    settings: Settings = Depends(get_settings)
):
    """Get all characters for admin panel (including drafts)."""
    
    # TODO: Validate admin permissions
    # TODO: Query database with filters
    # TODO: Return characters list
    
    return []


@router.put("/characters/{character_id}", response_model=dict)
async def update_character(
    character_id: str,
    character_update: CharacterUpdate,
    settings: Settings = Depends(get_settings)
):
    """Update an existing character."""
    
    # TODO: Validate admin permissions
    # TODO: Update character in database
    # TODO: Return updated character data
    
    return {
        "id": character_id,
        "message": "Character updated successfully"
    }


@router.delete("/characters/{character_id}")
async def delete_character(
    character_id: str,
    settings: Settings = Depends(get_settings)
):
    """Delete a character and all related data."""
    
    # TODO: Validate admin permissions
    # TODO: Delete character and documents from database
    # TODO: Delete embeddings from Chroma
    # TODO: Return success message
    
    return {"message": "Character deleted successfully"}


@router.post("/characters/{character_id}/documents", response_model=DocumentUpload)
async def upload_document(
    character_id: str,
    file: UploadFile = File(...),
    title: str = Form(...),
    content_type: str = Form("biography"),  # 'biography', 'works', 'quotes', 'historical_context'
    language: str = Form("tr"),
    settings: Settings = Depends(get_settings)
):
    """Upload a document for a character."""
    
    # TODO: Validate admin permissions
    # TODO: Validate file type and size
    # TODO: Extract text content from file
    # TODO: Save document to database
    # TODO: Save file to storage
    # TODO: Return document info
    
    # Validate file type
    if not any(file.filename.endswith(ext) for ext in settings.allowed_file_types):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {settings.allowed_file_types}"
        )
    
    # Validate file size
    if file.size > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.max_file_size_mb}MB"
        )
    
    document_id = str(uuid.uuid4())
    
    return DocumentUpload(
        id=document_id,
        character_id=character_id,
        title=title,
        content_type=content_type,
        language=language,
        word_count=1000,  # Placeholder
        created_at=datetime.now()
    )


@router.get("/characters/{character_id}/documents", response_model=List[DocumentUpload])
async def get_character_documents(
    character_id: str,
    settings: Settings = Depends(get_settings)
):
    """Get all documents for a character."""
    
    # TODO: Validate admin permissions
    # TODO: Query database for character documents
    # TODO: Return documents list
    
    return []


@router.post("/characters/{character_id}/embed", response_model=EmbeddingJob)
async def start_embedding_job(
    character_id: str,
    openai_api_key: str = Form(...),
    settings: Settings = Depends(get_settings)
):
    """Start embedding process for a character."""
    
    # TODO: Validate admin permissions
    # TODO: Validate OpenAI API key
    # TODO: Get character documents from database
    # TODO: Create embedding job in database
    # TODO: Start background embedding process
    # TODO: Return job info
    
    job_id = str(uuid.uuid4())
    
    return EmbeddingJob(
        id=job_id,
        character_id=character_id,
        character_name="Character Name",
        total_documents=5,
        processed_documents=0,
        failed_documents=0,
        status="pending",
        started_at=None,
        completed_at=None,
        created_at=datetime.now()
    )


@router.get("/embedding-jobs", response_model=List[EmbeddingJob])
async def get_embedding_jobs(
    character_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    settings: Settings = Depends(get_settings)
):
    """Get embedding jobs status."""
    
    # TODO: Validate admin permissions
    # TODO: Query database for embedding jobs
    # TODO: Return jobs list
    
    return []


@router.get("/embedding-jobs/{job_id}", response_model=EmbeddingJob)
async def get_embedding_job(
    job_id: str,
    settings: Settings = Depends(get_settings)
):
    """Get specific embedding job status."""
    
    # TODO: Validate admin permissions
    # TODO: Query database for job
    # TODO: Return job details
    
    return EmbeddingJob(
        id=job_id,
        character_id="character-id",
        character_name="Character Name",
        total_documents=5,
        processed_documents=3,
        failed_documents=0,
        status="processing",
        started_at=datetime.now(),
        completed_at=None,
        created_at=datetime.now()
    )


@router.post("/characters/{character_id}/publish")
async def publish_character(
    character_id: str,
    settings: Settings = Depends(get_settings)
):
    """Publish a character (make it visible to users)."""
    
    # TODO: Validate admin permissions
    # TODO: Check if character has embeddings
    # TODO: Update character status to 'published'
    # TODO: Return success message
    
    return {"message": "Character published successfully"}


@router.get("/stats", response_model=dict)
async def get_admin_stats(
    settings: Settings = Depends(get_settings)
):
    """Get admin dashboard statistics."""
    
    # TODO: Validate admin permissions
    # TODO: Query database for statistics
    # TODO: Return stats
    
    return {
        "total_characters": 10,
        "published_characters": 8,
        "draft_characters": 2,
        "total_documents": 45,
        "total_chat_sessions": 150,
        "total_messages": 1200,
        "active_users": 25
    }
