import React, { useEffect, useState } from 'react';
import { getCategories, getAllContent } from '@/services/api';
import { Content, Category } from '@/types';
import ContentCarousel from '@/components/ContentCarousel';
import FeaturedBanner from '@/components/FeaturedBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdDisplay from '@/components/ads/AdDisplay';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [featuredContent, setFeaturedContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching homepage data...');
        
        // Get all content first
        const allContentData = await getAllContent();
        console.log(`Loaded ${allContentData.length} total content items`);
        setAllContent(allContentData);
        
        // Get all categories with their contents
        const categoriesData = await getCategories();
        
        // Create genre-based categories from all content
        const genreCategories = createGenreCategories(allContentData);
        
        if (!categoriesData || categoriesData.length === 0) {
          console.warn('No categories found, using genre-based categories');
          setCategories(genreCategories);
        } else {
          // Add uncategorized content to a separate category
          const categorizedContentIds = new Set();
          categoriesData.forEach(category => {
            if (category.contents) {
              category.contents.forEach(content => {
                categorizedContentIds.add(content.id);
              });
            }
          });
          
          const uncategorizedContent = allContentData.filter(content => 
            !categorizedContentIds.has(content.id)
          );
          
          let finalCategories = [...categoriesData];
          
          // If there's uncategorized content, add it to a "Latest Additions" category
          if (uncategorizedContent.length > 0) {
            console.log(`Found ${uncategorizedContent.length} uncategorized content items`);
            const latestCategory: Category = {
              id: 'latest-additions',
              name: 'Latest Additions',
              contents: uncategorizedContent
            };
            finalCategories.unshift(latestCategory); // Add at the beginning
          }
          
          // Add top-rated content category
          const topRatedContent = allContentData
            .filter(content => content.rating >= 7)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 20);
          
          if (topRatedContent.length > 0) {
            const topRatedCategory: Category = {
              id: 'top-rated',
              name: 'Top Rated',
              contents: topRatedContent
            };
            finalCategories.splice(1, 0, topRatedCategory); // Add after latest additions
          }
          
          // Add genre categories after regular categories
          finalCategories.push(...genreCategories);
          
          setCategories(finalCategories);
          console.log(`Loaded ${finalCategories.length} categories`);
        }
        
        // Select a random content for the featured banner from all available content
        if (allContentData.length > 0) {
          const randomIndex = Math.floor(Math.random() * allContentData.length);
          const selectedContent = allContentData[randomIndex];
          setFeaturedContent(selectedContent);
          console.log('Featured content selected:', selectedContent.title);
        } else {
          console.warn('No content found for featured banner');
          setFeaturedContent(null);
        }
        
      } catch (error) {
        console.error('Error fetching homepage data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load content';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper function to create genre-based categories
  const createGenreCategories = (content: Content[]): Category[] => {
    const genreMap = new Map<string, Content[]>();
    
    content.forEach(item => {
      item.genres.forEach(genre => {
        if (!genreMap.has(genre)) {
          genreMap.set(genre, []);
        }
        genreMap.get(genre)!.push(item);
      });
    });
    
    // Convert to categories, only include genres with at least 3 items
    const genreCategories: Category[] = [];
    genreMap.forEach((contents, genre) => {
      if (contents.length >= 3) {
        genreCategories.push({
          id: `genre-${genre.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${genre} ${contents.some(c => c.type === 'movie') && contents.some(c => c.type === 'tv') ? 'Collection' : contents[0].type === 'movie' ? 'Movies' : 'Shows'}`,
          contents: contents.sort((a, b) => b.rating - a.rating) // Sort by rating
        });
      }
    });
    
    // Sort genre categories by number of items (most popular first)
    return genreCategories.sort((a, b) => b.contents.length - a.contents.length);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-ott-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-ott-accent" />
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ott-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-ott-background">
      <Header />
      <AdDisplay placement="header" />
      
      <main>
        {/* Featured Banner */}
        {featuredContent && <FeaturedBanner content={featuredContent} />}
        
        <AdDisplay placement="before_content" />
        
        {/* Content Sections */}
        <div className="container mx-auto px-4 pb-16">
          {categories.length > 0 ? (
            categories.map((category, index) => {
              // Ensure category has valid contents array
              const validContents = category.contents?.filter(content => content && content.id) || [];
              
              if (validContents.length === 0) {
                return null; // Skip empty categories
              }
              
              return (
                <React.Fragment key={category.id}>
                  <ContentCarousel 
                    title={category.name} 
                    contents={validContents} 
                  />
                  {/* Add between_content ads after every 2nd category */}
                  {index > 0 && (index + 1) % 2 === 0 && (
                    <AdDisplay placement="between_content" />
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No content found. Add some content to get started!</p>
            </div>
          )}
          
          <AdDisplay placement="after_content" />
        </div>
      </main>
      
      <AdDisplay placement="footer" />
      <Footer />
    </div>
  );
};

export default HomePage;
