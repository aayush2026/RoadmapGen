import axios from 'axios';


interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

// Debug logging
console.log('YouTube API Key:', YOUTUBE_API_KEY ? 'Configured' : 'Not configured');

export const searchYouTubeVideos = async (query: string): Promise<YouTubeVideo[]> => {
  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key is not configured. Please add VITE_YOUTUBE_API_KEY to your .env file');
    return [];
  }

  try {
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 1,
        key: YOUTUBE_API_KEY,
        relevanceLanguage: 'en',
      },
    });

    return response.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('YouTube API Error:', {
        status: error.response.status,
        message: error.response.data?.error?.message || 'Unknown error',
        code: error.response.data?.error?.code,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from YouTube API');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up YouTube API request:', error.message);
    }
    return [];
  }
}; 