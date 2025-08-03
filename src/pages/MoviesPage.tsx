
import React, { useEffect, useState, useMemo } from 'react';
import { getContentByType } from '@/services/api';
import { Content } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentCard from '@/components/ui/ContentCard';
import ContentFilter from '@/components/ContentFilter';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import AdDisplay from '@/components/ads/AdDisplay';

const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('title');

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

  // Extract unique genres from all movies
  const allGenres = useMemo(() => {
    const genreSet = new Set<string>();
    movies.forEach(movie => {
      movie.genres.forEach(genre => genreSet.add(genre));
    });
    return Array.from(genreSet).sort();
  }, [movies]);

  // Filter and sort movies
  const filteredAndSortedMovies = useMemo(() => {
    let filtered = movies;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.overview.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply genre filter
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(movie =>
        selectedGenres.some(genre => movie.genres.includes(genre))
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'rating':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        case 'release-date':
          return new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime();
        case 'release-date-old':
          return new Date(a.releaseDate || 0).getTime() - new Date(b.releaseDate || 0).getTime();
        default:
          return 0;
      }
    });

    return sorted;
  }, [movies, searchQuery, selectedGenres, sortBy]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleClearFilters = () => {
    setSelectedGenres([]);
    setSearchQuery('');
    setSortBy('title');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdDisplay placement="header" />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <AdDisplay placement="before_content" />
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Movies</h1>
          <div className="text-sm text-muted-foreground">
            {filteredAndSortedMovies.length} of {movies.length} movies
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <ContentFilter
          genres={allGenres}
          selectedGenres={selectedGenres}
          onGenreToggle={handleGenreToggle}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearFilters={handleClearFilters}
        />

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-card rounded-md h-72 w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedMovies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredAndSortedMovies.map((movie) => (
              <ContentCard key={movie.id} content={movie} size="medium" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400">
              {searchQuery || selectedGenres.length > 0
                ? "No movies match your filters"
                : "No movies available"}
            </p>
            {(searchQuery || selectedGenres.length > 0) && (
              <button
                onClick={handleClearFilters}
                className="mt-4 text-primary hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
        
        <AdDisplay placement="after_content" />
      </main>

      <AdDisplay placement="footer" />
      <Footer />
    </div>
  );
};

export default MoviesPage;
