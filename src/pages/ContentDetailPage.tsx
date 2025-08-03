
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getContentBySlug } from '@/services/api';
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
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const navigate = useNavigate();

  // Track page view when content loads
  useEffect(() => {
    const trackContentView = async (contentId: string) => {
      try {
        const { error } = await supabase
          .from('content_views')
          .insert({ content_id: contentId });
        
        if (error) {
          console.error('Error tracking content view:', error);
        } else {
          console.log('View tracked for content:', contentId);
        }
      } catch (error) {
        console.error('Error tracking content view:', error);
      }
    };

    if (content && content.id) {
      trackContentView(content.id);
    }
  }, [id, content]);

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
        
        console.log('Fetching content with slug/ID:', id);
        const contentData = await getContentBySlug(id);
        
        if (contentData) {
          console.log("Content data loaded successfully:", contentData.title);
          
          // Ensure all arrays are properly initialized
          if (!contentData.images || !Array.isArray(contentData.images)) {
            contentData.images = [];
            
            // Add poster and backdrop to images if they exist
            if (contentData.posterPath) {
              contentData.images.push({
                path: contentData.posterPath,
                type: 'poster'
              });
            }
            if (contentData.backdropPath) {
              contentData.images.push({
                path: contentData.backdropPath,
                type: 'backdrop'
              });
            }
          }
          
          if (!contentData.embedVideos || !Array.isArray(contentData.embedVideos)) {
            contentData.embedVideos = [];
            
            // If there's a trailer URL, add it to embed videos
            if (contentData.trailerUrl) {
              contentData.embedVideos.push({
                url: contentData.trailerUrl,
                title: 'Official Trailer'
              });
            }
          }
          
          if (!contentData.watchProviders || !Array.isArray(contentData.watchProviders)) {
            contentData.watchProviders = [];
          }
          
          if (!contentData.cast || !Array.isArray(contentData.cast)) {
            contentData.cast = [];
          }
          
          if (!contentData.seasons || !Array.isArray(contentData.seasons)) {
            contentData.seasons = [];
          }
          
          console.log("Final processed content:", {
            title: contentData.title,
            images: contentData.images?.length || 0,
            embedVideos: contentData.embedVideos?.length || 0,
            watchProviders: contentData.watchProviders?.length || 0,
            cast: contentData.cast?.length || 0
          });
          
          setContent(contentData);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading content...</p>
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
        <ContentBackdrop backdropPath={content?.backdropPath} />

        <div className="container mx-auto px-4 pb-16">
          <div className="flex flex-col md:flex-row md:gap-8">
            {/* Left Column - Poster and Watch Info */}
            <div className="md:w-1/4 mb-6 md:mb-0">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src={content?.posterPath || 'https://via.placeholder.com/500x750?text=No+Poster'}
                  alt={content?.title}
                  className="w-full h-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/500x750?text=No+Poster';
                  }}
                />
              </div>

              {/* Trailer Button */}
              {content?.trailerUrl && (
                <TrailerDialog 
                  title={content.title}
                  trailerUrl={content.trailerUrl}
                  open={trailerOpen}
                  onOpenChange={setTrailerOpen}
                />
              )}
              
              {/* Watch Providers */}
              <div className="mt-6">
                <WatchProviders providers={content?.watchProviders || []} />
              </div>
            </div>

            {/* Right Column - Content Details */}
            <div className="md:w-3/4">
              <ContentDetails content={content} />

              {/* Embedded Videos Section */}
              {content?.embedVideos && Array.isArray(content.embedVideos) && content.embedVideos.length > 0 && (
                <EmbeddedVideos videos={content.embedVideos} />
              )}

              {/* Image Gallery */}
              {content?.images && content.images.length > 0 && (
                <ImageGallery images={content.images} />
              )}

              {/* TV Show Seasons */}
              {content?.type === 'tv' && content.seasons && content.seasons.length > 0 && (
                <TVShowSeasons seasons={content.seasons} />
              )}

              {/* Cast Section */}
              {content?.cast && content.cast.length > 0 && (
                <CastSection cast={content.cast} />
              )}

              {/* Comments Section */}
              <CommentsSection contentId={content?.id} contentTitle={content?.title} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContentDetailPage;
