
import React, { useEffect, useState } from 'react';
import { getContentByType } from '@/services/api';
import { Content } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentCard from '@/components/ui/ContentCard';

const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        const movieData = await getContentByType('movie');
        setMovies(movieData);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold mb-6">Movies</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-card rounded-md h-72 w-full"></div>
              </div>
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <ContentCard key={movie.id} content={movie} size="medium" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400">
              No movies available
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MoviesPage;
