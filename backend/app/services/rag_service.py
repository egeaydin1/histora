"""
RAG (Retrieval-Augmented Generation) service for character knowledge retrieval.
"""
import os
import asyncio
import time
import hashlib
from typing import List, Dict, Optional, Any, Tuple
from uuid import uuid4
import httpx
import chromadb
from chromadb.config import Settings as ChromaSettings
import openai
from pydantic import BaseModel
import structlog

from app.core.config import get_settings
from app.core.database import get_async_session
from app.models.database import Character, CharacterSource, EmbeddingChunk
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

logger = structlog.get_logger(__name__)

class TextChunk(BaseModel):
    """Text chunk with metadata for embedding."""
    content: str
    chunk_index: int
    source_id: str
    character_id: str
    token_count: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class RetrievalResult(BaseModel):
    """Result from RAG retrieval."""
    content: str
    score: float
    source_title: str
    chunk_index: int
    metadata: Optional[Dict[str, Any]] = None

class RAGService:
    """RAG service for embedding and retrieving character knowledge."""
    
    def __init__(self):
        self.settings = get_settings()
        self.openai_client = None
        self.chroma_client = None
        self.collection = None
        self._init_clients()
    
    def _init_clients(self):
        """Initialize OpenAI and Chroma clients."""
        try:
            # Initialize OpenAI client
            if self.settings.openai_api_key and self.settings.openai_api_key != "your_openai_api_key_here":
                self.openai_client = openai.OpenAI(api_key=self.settings.openai_api_key)
                logger.info("OpenAI client initialized successfully")
            else:
                logger.warning("OpenAI API key not configured, embedding will be mocked")
            
            # Initialize Chroma client (use persistent client for development)
            if self.settings.environment == "development":
                # Use persistent client for development
                self.chroma_client = chromadb.PersistentClient(
                    path=self.settings.chroma_persist_directory,
                    settings=ChromaSettings(anonymized_telemetry=False)
                )
                logger.info("Using Chroma persistent client for development")
            else:
                # Use HTTP client for production
                self.chroma_client = chromadb.HttpClient(
                    host=self.settings.chroma_host,
                    port=self.settings.chroma_port,
                    settings=ChromaSettings(anonymized_telemetry=False)
                )
                logger.info("Using Chroma HTTP client")
            
            # Get or create collection
            try:
                self.collection = self.chroma_client.get_collection(
                    name=self.settings.chroma_collection_name
                )
                logger.info(f"Connected to existing Chroma collection: {self.settings.chroma_collection_name}")
            except Exception:
                self.collection = self.chroma_client.create_collection(
                    name=self.settings.chroma_collection_name,
                    metadata={"description": "Histora character embeddings"}
                )
                logger.info(f"Created new Chroma collection: {self.settings.chroma_collection_name}")
                
        except Exception as e:
            logger.error("Failed to initialize RAG service clients", error=str(e))
            raise
    
    async def embed_text(self, text: str) -> List[float]:
        """Generate embedding for text using OpenAI."""
        if not self.openai_client:
            # Mock embedding for development
            logger.warning("Using mock embedding (OpenAI not configured)")
            # Generate a consistent fake embedding based on text hash
            text_hash = hashlib.md5(text.encode()).hexdigest()
            # Convert hex to float values between -1 and 1
            mock_embedding = []
            for i in range(0, min(len(text_hash), 32), 2):  # Use first 16 hex pairs
                hex_pair = text_hash[i:i+2]
                float_val = (int(hex_pair, 16) - 128) / 128.0  # Normalize to [-1, 1]
                mock_embedding.append(float_val)
            
            # Pad or truncate to embedding_dimensions
            target_dim = self.settings.embedding_dimensions
            while len(mock_embedding) < target_dim:
                mock_embedding.extend(mock_embedding[:min(16, target_dim - len(mock_embedding))])
            
            return mock_embedding[:target_dim]
        
        try:
            response = self.openai_client.embeddings.create(
                input=text,
                model=self.settings.openai_embedding_model
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error("Failed to generate embedding", error=str(e))
            raise
    
    def chunk_text(self, text: str, chunk_size: int = 800, overlap: int = 200) -> List[str]:
        """Split text into overlapping chunks."""
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # Try to end at a sentence boundary
            if end < len(text):
                # Look for sentence ending within last 100 characters
                sentence_ends = ['.', '!', '?', '\n\n']
                best_end = end
                
                for i in range(max(end - 100, start), end):
                    if text[i] in sentence_ends and i < len(text) - 1:
                        if text[i + 1] in [' ', '\n', '\t']:
                            best_end = i + 1
                            break
                
                end = best_end
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # Move start position with overlap
            start = max(start + chunk_size - overlap, end)
            
            if start >= len(text):
                break
        
        return chunks
    
    async def process_character_source(
        self, 
        character_id: str, 
        source_id: str,
        db_session: AsyncSession
    ) -> bool:
        """Process a character source and create embeddings."""
        try:
            # Get source from database
            result = await db_session.execute(
                select(CharacterSource).where(CharacterSource.id == source_id)
            )
            source = result.scalar_one_or_none()
            
            if not source:
                logger.error(f"Source not found: {source_id}")
                return False
            
            if not source.content:
                logger.error(f"Source has no content: {source_id}")
                return False
            
            logger.info(f"Processing source: {source.title} for character: {character_id}")
            
            # Update processing status
            source.processing_status = "processing"
            await db_session.commit()
            
            # Chunk the text
            chunks = self.chunk_text(source.content)
            logger.info(f"Created {len(chunks)} chunks for source: {source.title}")
            
            # Process each chunk
            embeddings_data = []
            chunk_records = []
            
            for i, chunk_content in enumerate(chunks):
                # Generate embedding
                embedding = await self.embed_text(chunk_content)
                
                # Create unique ID for this chunk
                chunk_id = f"{character_id}_{source_id}_{i}"
                
                # Prepare data for Chroma
                embeddings_data.append({
                    "id": chunk_id,
                    "embedding": embedding,
                    "document": chunk_content,
                    "metadata": {
                        "character_id": character_id,
                        "source_id": str(source_id),
                        "source_title": source.title,
                        "chunk_index": i,
                        "token_count": len(chunk_content.split())
                    }
                })
                
                # Create database record
                chunk_record = EmbeddingChunk(
                    source_id=source_id,
                    character_id=character_id,
                    content=chunk_content,
                    chunk_index=i,
                    token_count=len(chunk_content.split()),
                    embedding_model=self.settings.openai_embedding_model,
                    embedding_id=chunk_id,
                    chunk_metadata={
                        "source_title": source.title,
                        "processed_at": time.time()
                    }
                )
                chunk_records.append(chunk_record)
            
            # Add to Chroma
            if embeddings_data:
                self.collection.add(
                    ids=[item["id"] for item in embeddings_data],
                    embeddings=[item["embedding"] for item in embeddings_data],
                    documents=[item["document"] for item in embeddings_data],
                    metadatas=[item["metadata"] for item in embeddings_data]
                )
                logger.info(f"Added {len(embeddings_data)} chunks to Chroma")
            
            # Add to database
            db_session.add_all(chunk_records)
            
            # Update source status
            source.is_processed = True
            source.processing_status = "completed"
            source.chunk_count = len(chunks)
            source.error_message = None
            
            await db_session.commit()
            
            logger.info(f"Successfully processed source: {source.title}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to process source {source_id}", error=str(e))
            
            # Update error status
            try:
                source.processing_status = "failed"
                source.error_message = str(e)
                await db_session.commit()
            except:
                pass
            
            return False
    
    async def retrieve_context(
        self, 
        character_id: str, 
        query: str, 
        top_k: int = 5
    ) -> List[RetrievalResult]:
        """Retrieve relevant context for a query."""
        try:
            # Generate query embedding
            query_embedding = await self.embed_text(query)
            
            # Search in Chroma
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where={"character_id": character_id}
            )
            
            # Format results
            retrieval_results = []
            
            if results["documents"] and results["documents"][0]:
                for i, (doc, metadata, distance) in enumerate(zip(
                    results["documents"][0],
                    results["metadatas"][0],
                    results["distances"][0]
                )):
                    result = RetrievalResult(
                        content=doc,
                        score=1.0 - distance,  # Convert distance to similarity score
                        source_title=metadata.get("source_title", "Unknown"),
                        chunk_index=metadata.get("chunk_index", 0),
                        metadata=metadata
                    )
                    retrieval_results.append(result)
            
            logger.info(f"Retrieved {len(retrieval_results)} relevant chunks for character: {character_id}")
            return retrieval_results
            
        except Exception as e:
            logger.error(f"Failed to retrieve context for character {character_id}", error=str(e))
            return []
    
    async def get_character_stats(self, character_id: str, db_session: AsyncSession) -> Dict[str, Any]:
        """Get processing statistics for a character."""
        try:
            # Get source count
            sources_result = await db_session.execute(
                select(CharacterSource).where(CharacterSource.character_id == character_id)
            )
            sources = sources_result.scalars().all()
            
            # Get chunk count
            chunks_result = await db_session.execute(
                select(EmbeddingChunk).where(EmbeddingChunk.character_id == character_id)
            )
            chunks = chunks_result.scalars().all()
            
            # Calculate stats
            total_sources = len(sources)
            processed_sources = len([s for s in sources if s.is_processed])
            total_chunks = len(chunks)
            
            processing_statuses = {}
            for source in sources:
                status = source.processing_status
                processing_statuses[status] = processing_statuses.get(status, 0) + 1
            
            return {
                "character_id": character_id,
                "total_sources": total_sources,
                "processed_sources": processed_sources,
                "total_chunks": total_chunks,
                "processing_statuses": processing_statuses,
                "ready_for_chat": processed_sources > 0
            }
            
        except Exception as e:
            logger.error(f"Failed to get stats for character {character_id}", error=str(e))
            return {}
    
    async def health_check(self) -> Dict[str, Any]:
        """Check RAG service health."""
        health = {
            "status": "healthy",
            "openai_configured": self.openai_client is not None,
            "chroma_connected": False,
            "collection_name": self.settings.chroma_collection_name,
            "collection_count": 0
        }
        
        try:
            # Test Chroma connection
            collection_count = self.collection.count()
            health["chroma_connected"] = True
            health["collection_count"] = collection_count
        except Exception as e:
            health["status"] = "degraded"
            health["chroma_error"] = str(e)
        
        return health

# Global RAG service instance
rag_service = RAGService()
