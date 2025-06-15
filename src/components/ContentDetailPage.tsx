
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContentById } from '@/services/api';
import { Content } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WatchProviders from '@/components/WatchProviders';
import TVShowSeasons from '@/components/TVShowSeasons';
import ImageGallery from '@/components/ImageGallery';
import { PlayCircle, Calendar, Clock, Star, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const ContentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      console.error('No content ID provided');
      navigate('/');
      return;
    }

    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching content with ID:', id);
        const contentData = await getContentById(id);
        
        if (contentData) {
          setContent(contentData);
          console.log("Content data loaded successfully:", contentData.title);
        } else {
          console.warn("No content found for ID:", id);
          setError("Content not found");
          toast.error("Content not found");
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load content";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [id, navigate]);

  // Format YouTube URL for embedding if it's a YouTube URL
  const getEmbedUrl = (url: string | undefined) => {
    if (!url) return '';
    
    try {
      // Handle YouTube URLs
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : '';
      }
      
      // Handle YouTube short URLs
      if (url.includes('youtu.be')) {
        const videoId = url.split('/').pop();
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : '';
      }
      
      return url; // Return as is if not YouTube or already an embed URL
    } catch (error) {
      console.error('Error processing video URL:', error);
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-36 bg-muted rounded mb-4 mx-auto"></div>
          <div className="h-4 w-48 bg-muted rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Content Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "The content you're looking for doesn't exist."}
            </p>
            <Button onClick={() => navigate('/')}>
              Go Back Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        {/* Backdrop Image */}
        {content.backdropPath && (
          <div className="relative h-[60vh] w-full mb-6">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${content.backdropPath})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 pb-16">
          <div className="flex flex-col md:flex-row md:gap-8">
            {/* Poster */}
            <div className="md:w-1/4 mb-6 md:mb-0">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src={content.posterPath || '/placeholder.svg'}
                  alt={content.title}
                  className="w-full h-auto"
                  onError={(e) => {
                    console.warn('Poster image failed to load:', content.posterPath);
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>

              {/* Watch Trailer Button with Dialog */}
              {content.trailerUrl && (
                <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
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
                      <DialogTitle>{content.title} - Official Trailer</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 aspect-video w-full">
                      <iframe
                        src={getEmbedUrl(content.trailerUrl)}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        title={`${content.title} Trailer`}
                      ></iframe>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {/* Watch Providers */}
              {content.watchProviders && content.watchProviders.length > 0 && (
                <div className="mt-6">
                  <WatchProviders providers={content.watchProviders} />
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="md:w-3/4">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{content.title}</h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                {content.releaseDate && (
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>{new Date(content.releaseDate).getFullYear()}</span>
                  </div>
                )}
                {content.duration && (
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{content.duration}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 text-yellow-500" />
                  <span>{Number(content.rating).toFixed(1)}/10</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {content.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-secondary rounded-full text-xs"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Overview */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-2">Overview</h2>
                <p className="text-muted-foreground">{content.overview}</p>
              </div>

              {/* Image Gallery */}
              {content.images && content.images.length > 0 && (
                <ImageGallery images={content.images} />
              )}

              {/* TV Show Seasons (only for TV shows) */}
              {content.type === 'tv' && content.seasons && content.seasons.length > 0 && (
                <TVShowSeasons seasons={content.seasons} />
              )}

              {/* Cast (if available) */}
              {content.cast && content.cast.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-medium mb-4">Cast</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {content.cast.map((person) => (
                      <div key={person.id} className="text-center">
                        <div className="w-full aspect-square rounded-full overflow-hidden mb-2">
                          <img
                            src={person.profilePath || '/placeholder.svg'}
                            alt={person.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <p className="font-medium text-sm">{person.name}</p>
                        {person.character && (
                          <p className="text-muted-foreground text-xs">{person.character}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContentDetailPage;
