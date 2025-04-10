
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContentById } from '@/services/api';
import { Content } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WatchProviders from '@/components/WatchProviders';
import TVShowSeasons from '@/components/TVShowSeasons';
import ImageGallery from '@/components/ImageGallery';
import { PlayCircle, Calendar, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const ContentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const fetchContent = async () => {
      try {
        const contentData = await getContentById(id);
        if (contentData) {
          setContent(contentData);
          console.log("Content data loaded:", contentData);
          if (contentData.watchProviders && contentData.watchProviders.length > 0) {
            console.log("Watch providers:", contentData.watchProviders);
          } else {
            console.log("No watch providers available");
          }
        } else {
          toast.error("Content not found");
          navigate('/not-found');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        toast.error("Failed to load content");
        navigate('/not-found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-36 bg-muted rounded mb-4"></div>
          <div className="h-4 w-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  const getEmbedUrl = (url: string | undefined) => {
    if (!url) return '';
    
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    
    return url;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        <div className="relative h-[60vh] w-full mb-6">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${content.backdropPath})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          <div className="flex flex-col md:flex-row md:gap-8">
            <div className="md:w-1/4 mb-6 md:mb-0">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src={content.posterPath}
                  alt={content.title}
                  className="w-full h-auto"
                />
              </div>

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
              
              <div className="mt-6">
                {content.watchProviders && content.watchProviders.length > 0 ? (
                  <WatchProviders providers={content.watchProviders} />
                ) : (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Where to Watch</h3>
                    <p className="text-muted-foreground text-sm">
                      No streaming options available at this time.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-3/4">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{content.title}</h1>

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
                  <span>{content.rating}/10</span>
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

              <div className="mb-8">
                <h2 className="text-lg font-medium mb-2">Overview</h2>
                <p className="text-muted-foreground">{content.overview}</p>
              </div>

              {content.images && content.images.length > 0 && (
                <ImageGallery images={content.images} />
              )}

              {content.type === 'tv' && content.seasons && content.seasons.length > 0 && (
                <TVShowSeasons seasons={content.seasons} />
              )}

              {content.cast && content.cast.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-medium mb-4">Cast</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {content.cast.map((person) => (
                      <div key={person.id} className="text-center">
                        <div className="w-full aspect-square rounded-full overflow-hidden mb-2">
                          <img
                            src={person.profilePath || 'https://via.placeholder.com/150'}
                            alt={person.name}
                            className="w-full h-full object-cover"
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
