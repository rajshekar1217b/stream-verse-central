
import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import ContentCard from './ui/ContentCard';
import { Content } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContentCarouselProps {
  title: string;
  contents: Content[];
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({ title, contents }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = useState<string>('default');

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;

    const scrollAmount = direction === 'left' ? -400 : 400;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Sort contents based on selected option
  const sortedContents = React.useMemo(() => {
    if (sortBy === 'default') return contents;
    
    const sorted = [...contents].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
          return new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime();
        case 'oldest':
          return new Date(a.releaseDate || 0).getTime() - new Date(b.releaseDate || 0).getTime();
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [contents, sortBy]);

  if (!contents.length) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        
        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy('default')}>
              Default Order
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('rating')}>
              Highest Rated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('title')}>
              A-Z
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('newest')}>
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('oldest')}>
              Oldest First
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="relative group">
        <div 
          ref={carouselRef}
          className="content-carousel overflow-x-auto scrollbar-none"
        >
          <div className="content-carousel-track">
            {sortedContents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        </div>
        
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Scroll left"
        >
          <ChevronLeft className="text-white h-6 w-6" />
        </button>
        
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Scroll right"
        >
          <ChevronRight className="text-white h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default ContentCarousel;
