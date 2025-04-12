
import React from 'react';
import { PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TrailerDialogProps {
  title: string;
  trailerUrl?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TrailerDialog: React.FC<TrailerDialogProps> = ({ title, trailerUrl, open, onOpenChange }) => {
  if (!trailerUrl) return null;

  // Format YouTube URL for embedding if it's a YouTube URL
  const getEmbedUrl = (url: string) => {
    try {
      // Handle YouTube URLs
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      
      // Handle YouTube short URLs
      if (url.includes('youtu.be')) {
        const videoId = url.split('/').pop();
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      
      return url;
    } catch (error) {
      console.error('Error parsing video URL:', error);
      return url; // Return original URL if parsing fails
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="w-full mt-4 bg-primary hover:bg-primary/80"
        >
          <PlayCircle className="mr-2 h-5 w-5" />
          Watch Trailer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title} - Official Trailer</DialogTitle>
        </DialogHeader>
        <div className="mt-4 aspect-video w-full">
          <iframe
            src={getEmbedUrl(trailerUrl)}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={`${title} Trailer`}
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrailerDialog;
