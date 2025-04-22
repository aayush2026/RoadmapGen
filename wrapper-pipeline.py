#!/usr/bin/env python
"""
Wrapper script for document_to_roadmap_pipeline.py with better error handling
"""
import os
import sys
import traceback
import subprocess
import glob

# Fix for OpenMP runtime error
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

def find_matching_document(partial_name):
    """Try to find a document that matches the partial name."""
    # Check current directory
    print(f"Searching for document matching '{partial_name}'")
    
    # Get the documents directory
    documents_dir = os.path.join(os.getcwd(), 'documents')
    if not os.path.exists(documents_dir):
        # Try parent directory
        documents_dir = os.path.join(os.getcwd(), '..', 'documents')
        if not os.path.exists(documents_dir):
            return None
    
    print(f"Looking in documents directory: {documents_dir}")
    
    # List all files in the documents directory
    try:
        for filename in os.listdir(documents_dir):
            if filename.lower().startswith(partial_name.lower()):
                # Found a potential match
                full_path = os.path.join(documents_dir, filename)
                print(f"Found matching document: {filename}")
                return full_path
    except Exception as e:
        print(f"Error listing documents directory: {e}")
    
    # Try with glob
    try:
        pattern = os.path.join(documents_dir, f"{partial_name}*")
        print(f"Trying glob pattern: {pattern}")
        matches = glob.glob(pattern)
        if matches:
            print(f"Found matches with glob: {matches}")
            return matches[0]
    except Exception as e:
        print(f"Error with glob: {e}")
    
    return None

def main():
    """Run the document_to_roadmap_pipeline with full error handling."""
    print("Starting document to roadmap pipeline wrapper...")
    
    # Check if OpenAI API key is set
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        print("ERROR: OPENAI_API_KEY environment variable is not set!")
        print("Please set it in your .env file or environment variables.")
        sys.exit(1)
    else:
        print(f"Found OpenAI API key: {api_key[:5]}...{api_key[-4:]}")
    
    # Check arguments
    if len(sys.argv) < 2:
        print("Usage: python wrapper-pipeline.py <document_path> [--batch-size <size>]")
        sys.exit(1)
    
    # Debug: Print all raw arguments
    print("DEBUG: All arguments received:")
    for i, arg in enumerate(sys.argv):
        print(f"  Arg {i}: '{arg}'")
    
    # Handle a path that might have been quoted by the caller
    document_path = sys.argv[1]
    if document_path.startswith('"') and document_path.endswith('"'):
        document_path = document_path[1:-1]
    
    # Check if this is a partial path due to spaces
    if not os.path.exists(document_path):
        # First, see if it's a filename without directory
        filename = os.path.basename(document_path)
        if ' ' in filename:
            print(f"Detected spaces in filename: '{filename}', this might be a partial name")
            
            # Try to find the full filename
            possible_match = find_matching_document(filename)
            if possible_match:
                document_path = possible_match
                print(f"Using matched document: {document_path}")
    
    print(f"Document path after processing: {document_path}")
    
    # Check if file exists
    if not os.path.exists(document_path):
        print(f"ERROR: Document does not exist: {document_path}")
        print(f"Working directory: {os.getcwd()}")
        print(f"File exists check: {os.path.isfile(document_path)}")
        # Try to list the directory contents to help debug
        try:
            parent_dir = os.path.dirname(document_path) or os.getcwd()
            if os.path.exists(parent_dir):
                print(f"Files in {parent_dir}:")
                for f in os.listdir(parent_dir):
                    print(f"  - {f}")
            else:
                print(f"Parent directory {parent_dir} does not exist")
        except Exception as e:
            print(f"Error listing directory: {e}")
        sys.exit(1)
    
    # Get the script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # The root directory is the same as the script's directory (not parent)
    root_dir = script_dir
    
    # Make sure all script paths are fully qualified
    pipeline_script = os.path.join(root_dir, "document_to_roadmap_pipeline.py")
    chunker_script = os.path.join(root_dir, "markdown_chunker.py")
    
    print(f"Root directory: {root_dir}")
    print(f"Pipeline script path: {pipeline_script}")
    print(f"Chunker script path: {chunker_script}")
    
    # Verify all scripts exist
    if not os.path.exists(pipeline_script):
        print(f"ERROR: Pipeline script not found: {pipeline_script}")
        sys.exit(1)
    
    if not os.path.exists(chunker_script):
        print(f"ERROR: Chunker script not found: {chunker_script}")
        sys.exit(1)
    
    # Build batch size argument if provided
    batch_size = "10" # Default changed to 10
    for i in range(len(sys.argv)):
        if sys.argv[i] == "--batch-size" and i+1 < len(sys.argv):
            batch_size = sys.argv[i+1]
            break
    
    # We'll use subprocess approach instead of importing, to avoid path issues
    try:
        print("\n=== RUNNING PIPELINE ===")
        
        # Import the required modules to check dependencies
        try:
            print("Checking dependencies...")
            import json
            import re
            import time
            import argparse
            from dotenv import load_dotenv
            print("Core dependencies available")
            
            # Try importing docling
            try:
                from docling.document_converter import DocumentConverter
                print("Docling is available")
            except ImportError:
                print("ERROR: Could not import docling. Installing...")
                subprocess.check_call([sys.executable, "-m", "pip", "install", 
                                     "git+https://github.com/agentydragon/docling.git"])
                print("Docling installed successfully")
            
            # Try importing openai
            try:
                import openai
                print(f"OpenAI SDK is available (version: {openai.__version__})")
            except ImportError:
                print("ERROR: Could not import openai. Installing...")
                subprocess.check_call([sys.executable, "-m", "pip", "install", "openai"])
                print("OpenAI SDK installed successfully")
        
        except ImportError as e:
            print(f"ERROR: Missing dependency: {e}")
            print("Installing required packages...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "python-dotenv", "openai"])
            print("Dependencies installed")
        
        # Run the pipeline as a subprocess to maintain the correct working directory
        # Use list form for subprocess to avoid shell quoting issues
        command = [sys.executable, pipeline_script]
        
        # Handle the document path correctly
        command.append(document_path)
        
        # Add batch size if provided
        if batch_size != "10":  # Only if not the default
            command.extend(["--batch-size", batch_size])
            
        print(f"Running command: {' '.join(command)}")
        
        # Change to the root directory before running the command
        original_dir = os.getcwd()
        os.chdir(root_dir)
        
        # Pass all environment variables
        env = os.environ.copy()
        
        try:
            # Use subprocess.run with full output capture
            result = subprocess.run(
                command, 
                check=True, 
                env=env,
                capture_output=True,
                text=True
            )
            # Print the output
            if result.stdout:
                print("=== Command Output ===")
                print(result.stdout)
            print("Pipeline completed successfully!")
            
            # Change back to the original directory
            os.chdir(original_dir)
            
        except subprocess.CalledProcessError as e:
            print(f"ERROR: Command failed with exit code {e.returncode}")
            if e.stdout:
                print("=== Command Output ===")
                print(e.stdout)
            if e.stderr:
                print("=== Error Output ===")
                print(e.stderr)
                
            # Change back to the original directory
            os.chdir(original_dir)
            sys.exit(e.returncode)
            
    except Exception as e:
        print(f"\nERROR: An exception occurred during pipeline execution:")
        print(f"Exception type: {type(e).__name__}")
        print(f"Exception message: {str(e)}")
        print("\nDetailed traceback:")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main() 