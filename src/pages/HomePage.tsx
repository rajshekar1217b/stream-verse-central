
import React, { useEffect, useState } from 'react';
import { getCategories, getAllContent } from '@/services/api';
import { Content, Category } from '@/types';
import ContentCarousel from '@/components/ContentCarousel';
import FeaturedBanner from '@/components/FeaturedBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
        
        if (!categoriesData || categoriesData.length === 0) {
          console.warn('No categories found, creating a default "All Content" category');
          // If no categories, create a default category with all content
          const defaultCategory: Category = {
            id: 'all-content',
            name: 'All Content',
            contents: allContentData
          };
          setCategories([defaultCategory]);
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
      
      <main>
        {/* Featured Banner */}
        {featuredContent && <FeaturedBanner content={featuredContent} />}
        
        {/* Content Sections */}
        <div className="container mx-auto px-4 pb-16">
          {categories.length > 0 ? (
            categories.map((category) => {
              // Ensure category has valid contents array
              const validContents = category.contents?.filter(content => content && content.id) || [];
              
              if (validContents.length === 0) {
                return null; // Skip empty categories
              }
              
              return (
                <ContentCarousel 
                  key={category.id} 
                  title={category.name} 
                  contents={validContents} 
                />
              );
            })
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No content found. Add some content to get started!</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
