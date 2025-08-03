
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
  const sizeClasses = {
    small: 'w-36 h-52',
    medium: 'w-48 h-72',
    large: 'w-64 h-96',
  };

  return (
    <Link to={`/content/${content.slug || content.id}`} className="content-card group">
      <div className={`relative ${sizeClasses[size]} floating-element`}>
        <img
          src={content.posterPath}
          alt={content.title}
          className="w-full h-full object-cover rounded-2xl"
          loading="lazy"
        />
        
        {/* Glassmorphism overlay with enhanced gradient */}
        <div className="gradient-overlay rounded-2xl flex flex-col justify-end p-4">
          {/* Play button overlay - appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="web3-button rounded-full p-4">
              <Play size={24} fill="currentColor" />
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold truncate pr-2 text-white glow-text">{content.title}</h3>
            <div className="flex items-center backdrop-blur-xl bg-white/10 rounded-full px-2 py-1 border border-white/20">
              <Star size={12} className="text-yellow-400 mr-1" fill="currentColor" />
              <span className="text-xs text-white font-medium">{content.rating}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            {content.releaseDate && (
              <p className="text-xs text-white/80">
                {new Date(content.releaseDate).getFullYear()}
              </p>
            )}
            <ViewCount 
              contentId={content.id} 
              className="text-white/80" 
              showIcon={false}
            />
          </div>
          
          {/* Genre badges */}
          {content.genres && content.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {content.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="text-xs px-2 py-1 rounded-full backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/20 text-white/90"
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
