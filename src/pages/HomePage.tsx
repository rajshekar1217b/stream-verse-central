
import React, { useEffect, useState } from 'react';
import { getCategories } from '@/services/api';
import { mockContents } from '@/data/mockData';
import { Category } from '@/types';
import ContentCarousel from '@/components/ContentCarousel';
import FeaturedBanner from '@/components/FeaturedBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Select a random content for the featured banner
  const featuredContent = mockContents[Math.floor(Math.random() * mockContents.length)];
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-ott-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-36 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-ott-background">
      <Header />
      
      <main>
        {/* Featured Banner */}
        <FeaturedBanner content={featuredContent} />
        
        {/* Content Sections */}
        <div className="container mx-auto px-4 pb-16">
          {categories.map((category) => (
            <ContentCarousel 
              key={category.id} 
              title={category.name} 
              contents={category.contents} 
            />
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
