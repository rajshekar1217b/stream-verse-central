import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getContentByType, getAllContent } from '@/services/api';
import { Content } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContentCard from '@/components/ui/ContentCard';

const CategoryPage: React.FC = () => {
  const { type } = useParams<{ type: 'movie' | 'tv' | undefined }>();
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const pageTitle = type === 'movie' ? 'Movies' : type === 'tv' ? 'TV Shows' : 'All Categories';

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        let contentData: Content[];
        if (type === 'movie' || type === 'tv') {
          contentData = await getContentByType(type);
        } else {
          // Handle "all" case by getting all content
          contentData = await getAllContent();
        }
        setContents(contentData);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [type]);

  return (
    <div className="min-h-screen bg-ott-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-ott-card rounded-md h-72 w-full"></div>
              </div>
            ))}
          </div>
        ) : contents.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {contents.map((content) => (
              <ContentCard key={content.id} content={content} size="medium" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400">
              No content available in this category
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
