
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContentById } from '@/services/api';
import { Content } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WatchProviders from '@/components/WatchProviders';
import TVShowSeasons from '@/components/TVShowSeasons';
import ImageGallery from '@/components/ImageGallery';
import ContentDetails from '@/components/ContentDetails';
import ContentBackdrop from '@/components/ContentBackdrop';
import CastSection from '@/components/CastSection';
import TrailerDialog from '@/components/TrailerDialog';
import CommentsSection from '@/components/CommentsSection';
import EmbeddedVideos from '@/components/EmbeddedVideos';
import { toast } from 'sonner';
import { supabase } from '@/types/supabase-extensions';

const ContentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const navigate = useNavigate();

  // Track page view when content loads
  useEffect(() => {
    const trackContentView = async (contentId: string) => {
      try {
        await supabase
          .from('content_views')
          .insert({ content_id: contentId });
        console.log('View tracked for content:', contentId);
      } catch (error) {
        console.error('Error tracking content view:', error);
      }
    };

    if (id && content) {
      trackContentView(id);
    }
  }, [id, content]);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const fetchContent = async () => {
      try {
        const contentData = await getContentById(id);
        if (contentData) {
          console.log("Content data loaded:", contentData);
          
          // Create placeholder images if none exist or if they're improperly formatted
          if (!contentData.images || !Array.isArray(contentData.images) || contentData.images.length === 0) {
            console.log("No images found, creating placeholders");
            // Create placeholder images array using poster and backdrop
            const placeholderImages = [];
            
            if (contentData.posterPath) {
              placeholderImages.push({
                path: contentData.posterPath,
                type: 'poster' as const
              });
            }
            
            if (contentData.backdropPath) {
              placeholderImages.push({
                path: contentData.backdropPath,
                type: 'backdrop' as const
              });
            }
            
            contentData.images = placeholderImages;
            console.log("Created placeholder images:", placeholderImages.length);
          } else {
            console.log("Content images:", contentData.images.length);
          }
          
          setContent(contentData);
          if (contentData.watchProviders && contentData.watchProviders.length > 0) {
            console.log("Watch providers:", contentData.watchProviders);
          } else {
            console.log("No watch providers available");
          }
          
          if (contentData.embedVideos && contentData.embedVideos.length > 0) {
            console.log("Embedded videos:", contentData.embedVideos.length);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        <ContentBackdrop backdropPath={content.backdropPath} />

        <div className="container mx-auto px-4 pb-16">
          <div className="flex flex-col md:flex-row md:gap-8">
            {/* Left Column - Poster and Watch Info */}
            <div className="md:w-1/4 mb-6 md:mb-0">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src={content.posterPath || 'https://via.placeholder.com/500x750?text=No+Poster'}
                  alt={content.title}
                  className="w-full h-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/500x750?text=No+Poster';
                  }}
                />
              </div>

              {/* Trailer Button */}
              {content.trailerUrl && (
                <TrailerDialog 
                  title={content.title}
                  trailerUrl={content.trailerUrl}
                  open={trailerOpen}
                  onOpenChange={setTrailerOpen}
                />
              )}
              
              {/* Watch Providers */}
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

            {/* Right Column - Content Details */}
            <div className="md:w-3/4">
              <ContentDetails content={content} />

              {/* Embedded Videos Section */}
              {content.embedVideos && content.embedVideos.length > 0 && (
                <EmbeddedVideos videos={content.embedVideos} />
              )}

              {/* Image Gallery */}
              {content.images && content.images.length > 0 && (
                <ImageGallery images={content.images} />
              )}

              {/* TV Show Seasons */}
              {content.type === 'tv' && content.seasons && content.seasons.length > 0 && (
                <TVShowSeasons seasons={content.seasons} />
              )}

              {/* Cast Section */}
              {content.cast && content.cast.length > 0 && (
                <CastSection cast={content.cast} />
              )}

              {/* Comments Section */}
              <CommentsSection contentId={content.id} contentTitle={content.title} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContentDetailPage;
