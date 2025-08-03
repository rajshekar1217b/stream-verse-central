
import React from 'react';
import { Link } from 'react-router-dom';
import { Content } from '@/types';
import { Star, Play } from 'lucide-react';
import ViewCount from '@/components/ViewCount';

interface ContentCardProps {
  content: Content;
  size?: 'small' | 'medium' | 'large';
}

const ContentCard: React.FC<ContentCardProps> = ({ content, size = 'medium' }) => {
  // Responsive sizing that works with CSS classes
  const sizeClasses = {
    small: 'h-44 sm:h-48 lg:h-52',
    medium: 'h-52 sm:h-64 lg:h-72',
    large: 'h-64 sm:h-80 lg:h-96',
  };

  return (
    <Link to={`/content/${content.slug || content.id}`} className="content-card group">
      <div className={`relative ${sizeClasses[size]} floating-element`}>
        <img
          src={content.posterPath}
          alt={content.title}
          className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
          loading="lazy"
        />
        
        {/* Glassmorphism overlay with enhanced gradient */}
        <div className="gradient-overlay rounded-xl sm:rounded-2xl flex flex-col justify-end p-2 sm:p-3 lg:p-4">
          {/* Play button overlay - appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="web3-button rounded-full p-2 sm:p-3 lg:p-4">
              <Play size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="currentColor" />
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h3 className="text-xs sm:text-sm font-semibold truncate pr-1 sm:pr-2 text-white glow-text">{content.title}</h3>
            <div className="flex items-center backdrop-blur-xl bg-white/10 rounded-full px-1 sm:px-2 py-0.5 sm:py-1 border border-white/20">
              <Star size={10} className="sm:w-3 sm:h-3 text-yellow-400 mr-0.5 sm:mr-1" fill="currentColor" />
              <span className="text-xs text-white font-medium">{content.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            {content.releaseDate && (
              <p className="text-xs text-white/80">
                {new Date(content.releaseDate).getFullYear()}
              </p>
            )}
            <ViewCount 
              contentId={content.id} 
              className="text-white/80 text-xs" 
              showIcon={false}
            />
          </div>
          
          {/* Genre badges */}
          {content.genres && content.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {content.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/20 text-white/90"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ContentCard;
