#!/usr/bin/env python
"""
Semantic Search script for retrieving relevant content chunks
"""
import sys
import json
import argparse
from embedding_store import search_similar_chunks

def main():
    """Run semantic search to find relevant chunks."""
    parser = argparse.ArgumentParser(description="Search for relevant content chunks")
    parser.add_argument("--query", required=True, help="Search query text")
    parser.add_argument("--document", required=True, help="Document name to search in")
    parser.add_argument("--limit", type=int, default=5, help="Maximum number of results to return")
    
    # Print arguments for debugging
    print(f"Arguments: {sys.argv}", file=sys.stderr)
    
    try:
        args = parser.parse_args()
        
        # If the query is quoted, remove the quotes
        query = args.query
        if query.startswith('"') and query.endswith('"'):
            query = query[1:-1]
            
        print(f"Parsed arguments: query='{query}', document='{args.document}', limit={args.limit}", file=sys.stderr)
        
        # Normalize document name to remove file extension if present
        document_name = args.document
        if document_name.endswith('.pdf'):
            document_name = document_name[:-4]
        
        if document_name.endswith('.json'):
            document_name = document_name[:-5]
            
        print(f"Normalized document name: '{document_name}'", file=sys.stderr)
            
        # Search for similar chunks
        print(f"Calling search_similar_chunks with query='{query}', document_name='{document_name}', limit={args.limit}", file=sys.stderr)
        results = search_similar_chunks(query, document_name, args.limit)
        
        # Check if results are valid
        if results is None:
            print("No results returned from search_similar_chunks", file=sys.stderr)
            results = []
        
        print(f"Got {len(results)} results from search", file=sys.stderr)
        
        # Output as JSON to stdout
        json_results = json.dumps(results)
        print(json_results)
        
    except Exception as e:
        print(f"Error performing semantic search: {str(e)}", file=sys.stderr)
        # Return empty array as JSON to avoid parsing errors
        print("[]")
        sys.exit(1)

if __name__ == "__main__":
    main() 