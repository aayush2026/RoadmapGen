import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Loader2, AlertCircle } from 'lucide-react';
import { searchYouTubeVideos } from '@/services/youtubeService';
import { generateSearchQuery } from '@/services/queryGenerator';

interface YouTubeRecommendationsProps {
  topic: string;
  summary: string;
}

const YouTubeRecommendations: React.FC<YouTubeRecommendationsProps> = ({ topic, summary }) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);

      try {
        // First, generate an optimized search query
        const queryResponse = await generateSearchQuery(topic, summary);
        
        if (!queryResponse.shouldSearch) {
          setError(queryResponse.reason || 'No relevant videos found for this topic');
          setLoading(false);
          return;
        }

        // If we have a good query, search for videos
        const results = await searchYouTubeVideos(queryResponse.query!);
        setVideos(results);
      } catch (err) {
        setError('Failed to fetch video recommendations');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [topic, summary]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Recommended Videos</h3>
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
          <p className="text-sm text-gray-500">Finding relevant videos...</p>
          <div className="w-full space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 p-2">
                <div className="w-32 h-20 bg-gray-100 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Recommended Videos</h3>
        <div className="flex items-center justify-center py-8 space-x-2 text-gray-500">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Recommended Videos</h3>
      <div className="space-y-3">
        {videos.map((video) => (
          <motion.a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="relative flex-shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-32 h-20 rounded object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {video.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">{video.channelTitle}</p>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default YouTubeRecommendations; 