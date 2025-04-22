import re
import json
import sys
import os

# Fix for OpenMP runtime error
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

from docling.document_converter import DocumentConverter

def get_document_name(document_path):
    # Extract filename from path or URL
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

def ensure_directory_exists(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")

def chunk_document(document_path):
    # Get document name for file naming
    document_name = get_document_name(document_path)
    
    # Ensure folders exist
    ensure_directory_exists("markdown")
    ensure_directory_exists("chunks")
    
    # Use docling to convert the document to markdown
    converter = DocumentConverter()
    result = converter.convert(document_path)
    markdown_content = result.document.export_to_markdown()
    
    # Save the markdown content
    markdown_file_path = os.path.join("markdown", f"{document_name}.md")
    with open(markdown_file_path, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    print(f"Saved markdown to {markdown_file_path}")
    
    # Split the content by topic headings (##)
    chunks = []
    # Use regex to find all sections starting with ##
    all_sections = re.split(r'(?=^##\s+)', markdown_content, flags=re.MULTILINE)
    
    # Process all topics (skip empty first element if it exists)
    for section in [s for s in all_sections if s.strip()]:
        # Extract topic name and content
        topic_match = re.match(r'^##\s+(.*?)(?:\n|$)(.*)', section, re.DOTALL)
        if topic_match:
            topic_name = topic_match.group(1).strip()
            content = topic_match.group(2).strip()
            
            chunks.append({
                "topic_name": topic_name,
                "content": content
            })
    
    # Define chunks output path
    chunks_file_path = os.path.join("chunks", f"{document_name}.json")
    
    # Save chunks to JSON file
    with open(chunks_file_path, 'w', encoding='utf-8') as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(chunks)} chunks to {chunks_file_path}")
    
    return chunks, chunks_file_path

def main():
    if len(sys.argv) < 2:
        print("Usage: python markdown_chunker.py <input_document_path_or_url>")
        sys.exit(1)
    
    document_path = sys.argv[1]
    
    try:
        print(f"Converting document from {document_path} to markdown...")
        chunks, output_path = chunk_document(document_path)
        print(f"Successfully created {len(chunks)} chunks and saved to {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 