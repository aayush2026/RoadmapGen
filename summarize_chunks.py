import json
import os
import sys
import time
import openai
from dotenv import load_dotenv

# Load environment variables from .env file (for API key)
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def load_chunks(json_file_path):
    """Load chunks from JSON file."""
    with open(json_file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def summarize_batch(batch, max_words=20):
    """Summarize a batch of chunks using OpenAI API."""
    summaries = []

    for item in batch:
        topic = item["topic_name"]
        content = item["content"]

        try:
            # Call OpenAI API to summarize content
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": f"Summarize the following text in maximum {max_words} words while preserving key technical terms and concepts:"
                    },
                    {
                        "role": "user",
                        "content": content
                    }
                ],
                max_tokens=100,
                temperature=0.3,
            )

            # Get the summary
            summary = response.choices[0].message['content'].strip()

            # Add to results
            summaries.append({
                "topic_name": topic,
                "summary": summary
            })

            time.sleep(1)  # Avoid rate limits

        except Exception as e:
            print(f"Error summarizing {topic}: {str(e)}")
            summaries.append({
                "topic_name": topic,
                "summary": f"Error: {str(e)}"
            })

    return summaries

def ensure_directory_exists(directory):
    """Create directory if it doesn't exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")

def process_chunks_in_batches(chunks, input_file, batch_size=5):
    """Process chunks in batches and save results."""
    all_summaries = []
    total_chunks = len(chunks)
    
    # Create summary directory if it doesn't exist
    ensure_directory_exists("summary")
    
    # Get the output filename based on input filename
    input_filename = os.path.basename(input_file)
    input_basename = os.path.splitext(input_filename)[0]
    output_file = os.path.join("summary", f"{input_basename}.json")
    
    print(f"Summaries will be saved to: {output_file}")
    
    for i in range(0, total_chunks, batch_size):
        batch = chunks[i:min(i+batch_size, total_chunks)]
        print(f"Processing batch {i//batch_size + 1}/{(total_chunks-1)//batch_size + 1} ({len(batch)} items)")

        batch_summaries = summarize_batch(batch)
        all_summaries.extend(batch_summaries)

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_summaries, f, indent=2, ensure_ascii=False)

        print(f"Processed {len(all_summaries)}/{total_chunks} chunks")
    
    return all_summaries, output_file

def main():
    if len(sys.argv) < 2:
        print("Usage: python summarize_chunks.py <input_json_file> [batch_size=5]")
        sys.exit(1)

    input_file = sys.argv[1]
    batch_size = int(sys.argv[2]) if len(sys.argv) > 2 else 5

    if not openai.api_key:
        print("Error: OPENAI_API_KEY environment variable is not set.")
        sys.exit(1)

    try:
        print(f"Loading chunks from {input_file}...")
        chunks = load_chunks(input_file)
        print(f"Loaded {len(chunks)} chunks.")

        print(f"Processing chunks in batches of {batch_size}...")
        summaries, output_file = process_chunks_in_batches(chunks, input_file, batch_size)

        print(f"Summarization complete. Results saved to {output_file}")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
