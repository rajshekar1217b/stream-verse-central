
import React from 'react';
import { Content } from '@/types';
import { Calendar, Clock, Star } from 'lucide-react';
import ViewCount from '@/components/ViewCount';
import AdDisplay from '@/components/ads/AdDisplay';

interface ContentDetailsProps {
  content: Content;
}

const ContentDetails: React.FC<ContentDetailsProps> = ({ content }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">{content.title}</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {content.releaseDate && (
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            <span>{new Date(content.releaseDate).getFullYear()}</span>
          </div>
        )}
        {content.duration && (
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            <span>{content.duration}</span>
          </div>
        )}
        <div className="flex items-center">
          <Star className="mr-1 h-4 w-4 text-yellow-500" />
          <span>{content.rating}/10</span>
        </div>
        <ViewCount contentId={content.id} />
        <div className="flex flex-wrap gap-2">
          {content.genres.map((genre, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-secondary rounded-full text-xs"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      <AdDisplay placement="before_content" />
      
      <div>
        <h2 className="text-lg font-medium mb-2">Overview</h2>
        <p className="text-muted-foreground">{content.overview}</p>
      </div>

      <AdDisplay placement="after_content" />
    </div>
  );
};

export default ContentDetails;
