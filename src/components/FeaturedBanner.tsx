
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
    if (content.trailerUrl) {
      window.open(content.trailerUrl, '_blank');
    } else {
      navigate(`/content/${content.id}`);
    }
  };

  const handleMore = () => {
    navigate(`/content/${content.id}`);
  };

  return (
    <div className="relative w-full h-[70vh] mb-8">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${content.backdropPath})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ott-background via-transparent to-transparent" />
      </div>
      
      <div className="relative h-full flex items-end pb-20 px-8 md:px-16">
        <div className="max-w-2xl animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-3">{content.title}</h1>
          
          <div className="flex items-center gap-4 text-sm mb-4">
            {content.releaseDate && <span>{new Date(content.releaseDate).getFullYear()}</span>}
            {content.duration && <span>{content.duration}</span>}
            <span className="flex items-center">
              <span className="bg-yellow-500 text-black px-1 mr-2 font-semibold rounded">
                IMDb
              </span>
              {content.rating}
            </span>
          </div>
          
          <p className="text-gray-300 mb-8 line-clamp-3">{content.overview}</p>
          
          <div className="flex gap-4">
            <Button 
              onClick={handlePlay}
              className="bg-white hover:bg-gray-200 text-black font-medium px-6 py-2 rounded flex items-center gap-2"
            >
              <Play size={20} className="fill-black" />
              Play
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleMore}
              className="border-gray-400 text-white hover:bg-white/10 flex items-center gap-2"
            >
              <Info size={20} />
              More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBanner;
