"""
Embedding Store for Document Chunks
This module handles the process of embedding document chunks and storing them in Qdrant
"""
import os
import json
import time
import numpy as np
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models

# Load environment variables
load_dotenv()

# Check OpenAI version and import accordingly
try:
    # Try new-style import (OpenAI Python SDK v1.0.0+)
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    USING_NEW_OPENAI = True
    print("Using OpenAI API v1.0.0+")
except ImportError:
    # Fall back to old-style import
    import openai
    openai.api_key = os.getenv("OPENAI_API_KEY")
    USING_NEW_OPENAI = False
    print("Using OpenAI API legacy version")

# Configure Qdrant client
qdrant_host = "https://2d41acea-8f1b-438d-a9cf-f1d23f36520b.europe-west3-0.gcp.cloud.qdrant.io"
qdrant_api_key = os.getenv("QDRANT_API_KEY")

if not qdrant_api_key:
    raise ValueError("QDRANT_API_KEY not found in environment variables")

qdrant_client = QdrantClient(
    url=qdrant_host,
    api_key=qdrant_api_key,
)

# Define embedding model
EMBEDDING_MODEL = "text-embedding-3-small"  # OpenAI's latest embedding model
EMBEDDING_DIMENSIONS = 1536  # Dimensions for text-embedding-3-small

def get_embedding(text):
    """
    Get embedding for a text using OpenAI's embedding model.
    
    Args:
        text (str): The text to embed
        
    Returns:
        list: Embedding vector
    """
    if not text.strip():
        return [0] * EMBEDDING_DIMENSIONS
    
    try:
        if USING_NEW_OPENAI:
            # New OpenAI SDK style
            response = client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=text,
                encoding_format="float"
            )
            embedding = response.data[0].embedding
        else:
            # Old OpenAI SDK style
            response = openai.Embedding.create(
                model=EMBEDDING_MODEL,
                input=text
            )
            embedding = response["data"][0]["embedding"]
            
        return embedding
    except Exception as e:
        print(f"Error getting embedding: {e}")
        # Return zero vector if embedding fails
        return [0] * EMBEDDING_DIMENSIONS

def create_collection_if_not_exists(collection_name):
    """
    Create a collection in Qdrant if it doesn't exist
    
    Args:
        collection_name (str): Name of the collection
    """
    try:
        # Check if collection exists
        collections = qdrant_client.get_collections().collections
        collection_names = [collection.name for collection in collections]
        
        if collection_name not in collection_names:
            print(f"Creating collection '{collection_name}'")
            qdrant_client.create_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(
                    size=EMBEDDING_DIMENSIONS,
                    distance=models.Distance.COSINE
                ),
                optimizers_config=models.OptimizersConfigDiff(
                    indexing_threshold=0  # Index immediately for small collections
                )
            )
            print(f"Collection '{collection_name}' created successfully")
        else:
            print(f"Collection '{collection_name}' already exists")
            
    except Exception as e:
        print(f"Error creating collection: {e}")
        raise

def store_chunk_embeddings(chunks, document_name):
    """
    Store document chunks in Qdrant with their embeddings
    
    Args:
        chunks (list): List of chunk objects with 'topic_name' and 'content' fields
        document_name (str): Name of the document (used for collection name)
    
    Returns:
        int: Number of chunks stored successfully
    """
    collection_name = f"document_{document_name.replace('.', '_').replace(' ', '_').lower()}"
    create_collection_if_not_exists(collection_name)
    
    print(f"Storing {len(chunks)} chunks for document '{document_name}' in collection '{collection_name}'")
    
    # Process chunks in batches of 10
    batch_size = 10
    total_chunks = len(chunks)
    successful_chunks = 0
    
    for i in range(0, total_chunks, batch_size):
        batch = chunks[i:i+batch_size]
        print(f"Processing batch {i//batch_size + 1}/{(total_chunks + batch_size - 1)//batch_size}")
        
        points = []
        
        for idx, chunk in enumerate(batch):
            chunk_id = i + idx
            
            # Combine topic name and content for embedding
            text_to_embed = f"{chunk.get('topic_name', '')}\n\n{chunk.get('content', '')}"
            
            # Get embedding
            embedding = get_embedding(text_to_embed)
            
            # Create point
            point = models.PointStruct(
                id=chunk_id,
                vector=embedding,
                payload={
                    "topic_name": chunk.get("topic_name", ""),
                    "content": chunk.get("content", ""),
                    "chunk_id": chunk_id,
                    "document": document_name
                }
            )
            
            points.append(point)
        
        try:
            # Upload batch to Qdrant
            qdrant_client.upsert(
                collection_name=collection_name,
                points=points
            )
            successful_chunks += len(batch)
            print(f"Stored {len(batch)} chunks successfully")
            
            # Small delay to avoid rate limiting
            time.sleep(0.5)
            
        except Exception as e:
            print(f"Error uploading batch to Qdrant: {e}")
    
    print(f"Completed storing {successful_chunks}/{total_chunks} chunks in Qdrant")
    return successful_chunks

def search_similar_chunks(query_text, document_name, limit=5):
    """
    Search for chunks similar to the query text
    
    Args:
        query_text (str): The query text
        document_name (str): Name of the document to search in
        limit (int): Maximum number of results to return
        
    Returns:
        list: List of similar chunks with scores
    """
    collection_name = f"document_{document_name.replace('.', '_').replace(' ', '_').lower()}"
    
    try:
        # Get query embedding
        query_embedding = get_embedding(query_text)
        
        # Search in Qdrant
        search_results = qdrant_client.search(
            collection_name=collection_name,
            query_vector=query_embedding,
            limit=limit
        )
        
        # Format results
        results = []
        for result in search_results:
            results.append({
                "score": result.score,
                "topic_name": result.payload.get("topic_name", ""),
                "content": result.payload.get("content", ""),
                "chunk_id": result.payload.get("chunk_id")
            })
        
        return results
    
    except Exception as e:
        print(f"Error searching similar chunks: {e}")
        return []

def list_collections():
    """
    List all collections in Qdrant
    
    Returns:
        list: List of collection names
    """
    try:
        collections = qdrant_client.get_collections().collections
        return [collection.name for collection in collections]
    except Exception as e:
        print(f"Error listing collections: {e}")
        return []

def delete_collection(collection_name):
    """
    Delete a collection from Qdrant
    
    Args:
        collection_name (str): Name of the collection to delete
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        qdrant_client.delete_collection(collection_name=collection_name)
        print(f"Collection '{collection_name}' deleted successfully")
        return True
    except Exception as e:
        print(f"Error deleting collection: {e}")
        return False 