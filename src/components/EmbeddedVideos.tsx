
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Film } from 'lucide-react';

interface EmbeddedVideosProps {
  videos: {
    url: string;
    title: string;
  }[];
}

const EmbeddedVideos: React.FC<EmbeddedVideosProps> = ({ videos }) => {
  const [activeVideo, setActiveVideo] = useState(0);
  
  if (!videos || videos.length === 0) {
    return null;
  }

  // Format video URL for embedding if needed
  const getEmbedUrl = (url: string) => {
    // Handle YouTube URLs
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle YouTube short URLs
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Handle Vimeo URLs
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url; // Return as is if not YouTube, Vimeo or already an embed URL
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        <Film className="h-4 w-4 mr-2 text-muted-foreground" />
        Videos ({videos.length})
      </h2>
      
      <div className="bg-muted/10 rounded-lg overflow-hidden">
        <div className="aspect-video w-full">
          <iframe
            src={getEmbedUrl(videos[activeVideo].url)}
            title={videos[activeVideo].title}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-medium">{videos[activeVideo].title}</h3>
        </div>
      </div>
      
      {videos.length > 1 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {videos.map((video, index) => (
            <button
              key={index}
              onClick={() => setActiveVideo(index)}
              className={`text-left p-2 rounded transition-colors ${
                index === activeVideo 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted/20 hover:bg-muted/30'
              }`}
            >
              <div className="text-sm font-medium truncate">{video.title}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmbeddedVideos;
