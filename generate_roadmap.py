import json
import os
import sys
import re
import openai
from dotenv import load_dotenv

# Load environment variables from .env file (for API key)
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def load_file(file_path):
    """Load JSON or text file content."""
    with open(file_path, 'r', encoding='utf-8') as f:
        if file_path.endswith('.json'):
            return json.load(f)
        else:
            return f.read()

def ensure_directory_exists(directory):
    """Create directory if it doesn't exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")

def fix_json(json_str):
    """Attempt to fix incomplete or malformed JSON."""
    # Count opening and closing braces
    open_braces = json_str.count('{')
    close_braces = json_str.count('}')
    
    # Fix missing closing braces
    if open_braces > close_braces:
        json_str += '}' * (open_braces - close_braces)
    
    # Check for unclosed strings (basic check)
    quote_count = json_str.count('"')
    if quote_count % 2 != 0:
        json_str += '"'  # Add a closing quote
    
    return json_str

def organize_topics_into_roadmap(summaries, prompt):
    """Use OpenAI to organize the topics into a structured roadmap."""
    # Format the summaries for the prompt
    topics_text = ""
    for item in summaries:
        topics_text += f"Topic: {item['topic_name']}\nSummary: {item['summary']}\n\n"
    
    try:
        # Call OpenAI API to organize the topics
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": prompt + "\n\nIMPORTANT: Your response must be a valid, complete JSON object without any truncation."
                },
                {
                    "role": "user",
                    "content": topics_text
                }
            ],
            max_tokens=4000,  # Increased from 2000 to 4000
            temperature=0.2,  # Lower temperature for more consistent output
        )
        
        # Get the response content
        roadmap_text = response.choices[0].message['content'].strip()
        
        # Try to parse the result as JSON
        # First, try to extract JSON if it's wrapped in markdown code blocks
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', roadmap_text)
        if json_match:
            roadmap_text = json_match.group(1).strip()
        
        try:
            # Try to parse as is
            roadmap = json.loads(roadmap_text)
            return roadmap
        except json.JSONDecodeError as e:
            print(f"Error parsing the generated roadmap as JSON: {e}")
            print("Attempting to fix incomplete JSON...")
            
            # Try to fix the JSON
            fixed_json = fix_json(roadmap_text)
            try:
                roadmap = json.loads(fixed_json)
                print("Successfully fixed and parsed JSON")
                return roadmap
            except json.JSONDecodeError as e2:
                print(f"Could not fix JSON: {e2}")
                # Return the text as a fallback
                return {
                    "error": "Could not parse as JSON", 
                    "raw_response": roadmap_text,
                    "attempted_fix": fixed_json
                }
        
    except Exception as e:
        print(f"Error generating roadmap: {str(e)}")
        return {"error": str(e)}

def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_roadmap.py <summary_json_file>")
        sys.exit(1)
    
    # Parse command line arguments
    summary_file = sys.argv[1]
    
    # Ensure the summary file exists
    if not os.path.exists(summary_file):
        print(f"Error: Summary file {summary_file} does not exist.")
        sys.exit(1)
        
    # Load the prompt text
    prompt_file = "prompt.txt"
    if not os.path.exists(prompt_file):
        print(f"Error: Prompt file {prompt_file} does not exist.")
        sys.exit(1)
    
    try:
        # Load summaries and prompt
        print(f"Loading summaries from {summary_file}...")
        summaries = load_file(summary_file)
        print(f"Loaded {len(summaries)} topic summaries.")
        
        print(f"Loading prompt from {prompt_file}...")
        prompt = load_file(prompt_file)
        
        # Create roadmap directory if it doesn't exist
        ensure_directory_exists("roadmap")
        
        # Get the output filename based on input filename
        input_filename = os.path.basename(summary_file)
        input_basename = os.path.splitext(input_filename)[0]
        output_file = os.path.join("roadmap", f"{input_basename}.json")
        
        print(f"Generating roadmap using the prompt...")
        roadmap = organize_topics_into_roadmap(summaries, prompt)
        
        # Save the roadmap
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(roadmap, f, indent=2, ensure_ascii=False)
        
        print(f"Roadmap generated and saved to {output_file}")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 