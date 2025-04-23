import axios from 'axios';

interface QueryResponse {
  shouldSearch: boolean;
  query?: string;
  reason?: string;
}

// Get the API key from environment variables
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Debug logging for environment variables
console.log('Environment Variables:', {
  VITE_OPENAI_API_KEY: OPENAI_API_KEY ? 'Present' : 'Missing',
  OPENAI_API_KEY: import.meta.env.OPENAI_API_KEY ? 'Present' : 'Missing'
});

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const generateSearchQuery = async (topic: string, summary: string): Promise<QueryResponse> => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key is not configured. Please ensure VITE_OPENAI_API_KEY is set in your .env file');
    return { shouldSearch: false, reason: 'API key not configured' };
  }

  try {
    const prompt = `Given a topic and its summary, determine if it's meaningful enough to search for YouTube videos and generate an optimized search query if appropriate.

Topic: ${topic}
Summary: ${summary}

Rules:
1. If the topic is too vague, generic, or meaningless (like "module3", "section2", etc.), return "no search"
2. If the topic is meaningful and educational, generate a focused search query
3. The query should be specific and educational-focused
4. Include key terms from both topic and summary
5. Keep the query concise (max 10 words)

Return ONLY a valid JSON object with these fields:
- shouldSearch: boolean
- query: string (if shouldSearch is true)
- reason: string (if shouldSearch is false)

Do not include any markdown formatting or additional text.`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates optimized search queries for educational YouTube videos. Always return valid JSON without any additional formatting or text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 150,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Clean the response content
    let content = response.data.choices[0].message.content;
    
    // Remove any markdown formatting if present
    content = content.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse LLM response:', content);
      return { shouldSearch: false, reason: 'Error processing response' };
    }
  } catch (error: any) {
    console.error('Error generating search query:', error);
    return { shouldSearch: false, reason: 'Error generating query' };
  }
}; 