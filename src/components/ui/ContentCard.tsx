
import React from 'react';
import { Link } from 'react-router-dom';
import { Content } from '@/types';
import { Star } from 'lucide-react';

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
    <Link to={`/content/${content.id}`} className="content-card">
      <div className={`relative ${sizeClasses[size]}`}>
        <img
          src={content.posterPath}
          alt={content.title}
          className="w-full h-full object-cover rounded-md"
          loading="lazy"
        />
        <div className="gradient-overlay flex flex-col justify-end p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium truncate pr-2">{content.title}</h3>
            <div className="flex items-center">
              <Star size={12} className="text-yellow-400 mr-1" />
              <span className="text-xs">{content.rating}</span>
            </div>
          </div>
          {content.releaseDate && (
            <p className="text-xs text-gray-300 mt-1">
              {new Date(content.releaseDate).getFullYear()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ContentCard;
