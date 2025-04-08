
import React, { useEffect, useState } from 'react';
import { getCategories } from '@/services/api';
import { Content, Category } from '@/types';
import ContentCarousel from '@/components/ContentCarousel';
import FeaturedBanner from '@/components/FeaturedBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredContent, setFeaturedContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all categories with their contents
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Select a random content for the featured banner
        const allContent: Content[] = [];
        categoriesData.forEach(category => {
          category.contents.forEach(content => {
            if (!allContent.some(c => c.id === content.id)) {
              allContent.push(content);
            }
          });
        });
        
        if (allContent.length > 0) {
          const randomIndex = Math.floor(Math.random() * allContent.length);
          setFeaturedContent(allContent[randomIndex]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
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
  
  return (
    <div className="min-h-screen bg-ott-background">
      <Header />
      
      <main>
        {/* Featured Banner */}
        {featuredContent && <FeaturedBanner content={featuredContent} />}
        
        {/* Content Sections */}
        <div className="container mx-auto px-4 pb-16">
          {categories.length > 0 ? (
            categories.map((category) => (
              <ContentCarousel 
                key={category.id} 
                title={category.name} 
                contents={category.contents} 
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No categories found. Add some content to get started!</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
