
import React from 'react';
import { Play, Info } from 'lucide-react';
import { Content } from '@/types';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FeaturedBannerProps {
  content: Content;
}

const FeaturedBanner: React.FC<FeaturedBannerProps> = ({ content }) => {
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate(`/content/${content.slug || content.id}`);
  };

  const handleMore = () => {
    navigate(`/content/${content.slug || content.id}`);
  };

  // Use backdrop if available, otherwise fall back to poster
  const backgroundImage = content.backdropPath || content.posterPath;

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] mb-4 sm:mb-8">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ott-background via-transparent to-transparent" />
      </div>
      
      <div className="relative h-full flex items-end pb-8 sm:pb-12 lg:pb-20 px-4 sm:px-8 md:px-16">
        <div className="max-w-2xl animate-fade-in w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-2 sm:mb-3 leading-tight">{content.title}</h1>
          
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm mb-3 sm:mb-4">
            {content.releaseDate && <span>{new Date(content.releaseDate).getFullYear()}</span>}
            {content.duration && <span>{content.duration}</span>}
            <span className="flex items-center">
              <span className="bg-yellow-500 text-black px-1 mr-1 sm:mr-2 font-semibold rounded text-xs">
                IMDb
              </span>
              {content.rating}
            </span>
          </div>
          
          <p className="text-gray-300 mb-4 sm:mb-6 lg:mb-8 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base">{content.overview}</p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button 
              onClick={handlePlay}
              className="bg-white hover:bg-gray-200 text-black font-medium px-4 sm:px-6 py-2 sm:py-3 rounded flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Play size={16} className="sm:w-5 sm:h-5 fill-black" />
              Play
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleMore}
              className="border-gray-400 text-white hover:bg-white/10 flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
            >
              <Info size={16} className="sm:w-5 sm:h-5" />
              More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBanner;
