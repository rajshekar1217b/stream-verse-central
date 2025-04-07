
import React, { useEffect, useState } from 'react';
import { getContentByType } from '@/services/api';
import { Content } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentCard from '@/components/ui/ContentCard';

const TVShowsPage: React.FC = () => {
  const [tvShows, setTvShows] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTVShows = async () => {
      setIsLoading(true);
      try {
        const tvShowData = await getContentByType('tv');
        setTvShows(tvShowData);
      } catch (error) {
        console.error('Error fetching TV shows:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTVShows();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold mb-6">TV Shows</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-card rounded-md h-72 w-full"></div>
              </div>
            ))}
          </div>
        ) : tvShows.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tvShows.map((tvShow) => (
              <ContentCard key={tvShow.id} content={tvShow} size="medium" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400">
              No TV shows available
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TVShowsPage;
