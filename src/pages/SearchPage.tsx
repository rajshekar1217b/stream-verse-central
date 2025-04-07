
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchContent } from '@/services/api';
import { Content } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentCard from '@/components/ui/ContentCard';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const searchResults = await searchContent(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Error performing search:', error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-ott-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold mb-6">
          Search Results for: <span className="text-ott-accent">{query}</span>
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-ott-card rounded-md h-72 w-full"></div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {results.map((content) => (
              <ContentCard key={content.id} content={content} size="medium" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400 mb-4">
              No results found for "{query}"
            </p>
            <p className="text-gray-500">
              Try adjusting your search term or explore our categories instead.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
