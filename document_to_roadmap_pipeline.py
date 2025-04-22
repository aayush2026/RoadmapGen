import os
import sys
import json
import re
import time
import subprocess
import argparse
from dotenv import load_dotenv

# Fix for OpenMP runtime error
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

# Load environment variables for API keys
load_dotenv()

def ensure_directory_exists(directory):
    """Create directory if it doesn't exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")

def get_document_name(document_path):
    """Extract document name from path or URL."""
    if "://" in document_path:  # It's a URL
        # Get the last part of the URL
        filename = document_path.split("/")[-1]
        # Remove query parameters if any
        filename = filename.split("?")[0]
    else:  # It's a local path
        filename = os.path.basename(document_path)
    
    # Remove extension if any
    base_name = os.path.splitext(filename)[0]
    return base_name

def run_process(command, description):
    """Run a subprocess with proper error handling."""
    print(f"Starting {description}...")
    try:
        result = subprocess.run(
            command, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        print(f"Successfully completed {description}")
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error during {description}:")
        print(f"Exit code: {e.returncode}")
        print(f"Error output: {e.stderr}")
        return False

def process_document(document_path, batch_size=5, store_embeddings=False):
    """Process a document through the entire pipeline."""
    # Get document name for file naming
    document_name = get_document_name(document_path)
    
    # Ensure all necessary directories exist
    ensure_directory_exists("markdown")
    ensure_directory_exists("chunks")
    ensure_directory_exists("summary")
    ensure_directory_exists("roadmap")
    
    # Define expected output files
    chunks_file = os.path.join("chunks", f"{document_name}.json")
    summary_file = os.path.join("summary", f"{document_name}.json")
    roadmap_file = os.path.join("roadmap", f"{document_name}.json")
    
    # Step 1: Convert document to chunks
    print("\n===== STEP 1: DOCUMENT CHUNKING =====")
    chunking_command = ["python", "markdown_chunker.py", document_path]
    
    # Add store embeddings flag if needed
    if store_embeddings:
        chunking_command.append("--store-embeddings")
        print("Embeddings will be stored in Qdrant")
    
    chunking_success = run_process(
        chunking_command,
        "document chunking"
    )
    
    if not chunking_success or not os.path.exists(chunks_file):
        print(f"Error: Chunking failed or output file {chunks_file} was not created.")
        return False
    
    # Step 2: Summarize chunks
    print("\n===== STEP 2: CHUNK SUMMARIZATION =====")
    summarization_success = run_process(
        ["python", "summarize_chunks.py", chunks_file, str(batch_size)],
        "chunk summarization"
    )
    
    if not summarization_success or not os.path.exists(summary_file):
        print(f"Error: Summarization failed or output file {summary_file} was not created.")
        return False
    
    # Step 3: Generate roadmap
    print("\n===== STEP 3: ROADMAP GENERATION =====")
    roadmap_success = run_process(
        ["python", "generate_roadmap.py", summary_file],
        "roadmap generation"
    )
    
    if not roadmap_success or not os.path.exists(roadmap_file):
        print(f"Error: Roadmap generation failed or output file {roadmap_file} was not created.")
        return False
    
    print(f"\n===== PIPELINE COMPLETED SUCCESSFULLY =====")
    print(f"Document: {document_path}")
    print(f"Chunks: {chunks_file}")
    print(f"Summary: {summary_file}")
    print(f"Roadmap: {roadmap_file}")
    
    return True

def main():
    parser = argparse.ArgumentParser(description="Process a document through the entire pipeline: chunking, summarization, and roadmap generation.")
    parser.add_argument("document_path", help="Path or URL to the document to process")
    parser.add_argument("--batch-size", type=int, default=10, help="Batch size for processing chunks (default: 5)")
    parser.add_argument("--store-embeddings", action="store_true", help="Store embeddings in Qdrant")
    
    args = parser.parse_args()
    
    # Validate OpenAI API key
    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY environment variable is not set.")
        print("Please add it to your .env file or set it in your environment.")
        sys.exit(1)
    
    # Run the pipeline
    success = process_document(args.document_path, args.batch_size, args.store_embeddings)
    
    if not success:
        print("\nPipeline failed. Please check the error messages above.")
        sys.exit(1)
    else:
        print("\nPipeline completed successfully!")

if __name__ == "__main__":
    main() 