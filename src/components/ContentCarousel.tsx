
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
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white glow-text">{title}</h2>
        
        {/* Sort Dropdown with Web3 styling */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="web3-button gap-2">
              <Filter className="h-4 w-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card border-white/20">
            <DropdownMenuItem onClick={() => setSortBy('default')} className="text-white/90 hover:bg-white/10">
              Default Order
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('rating')} className="text-white/90 hover:bg-white/10">
              Highest Rated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('title')} className="text-white/90 hover:bg-white/10">
              A-Z
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('newest')} className="text-white/90 hover:bg-white/10">
              Newest First
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('oldest')} className="text-white/90 hover:bg-white/10">
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
          className="absolute left-4 top-1/2 -translate-y-1/2 backdrop-blur-xl bg-black/30 hover:bg-black/50 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 border border-white/20"
          aria-label="Scroll left"
        >
          <ChevronLeft className="text-white h-6 w-6" />
        </button>
        
        <button 
          onClick={() => scroll('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 backdrop-blur-xl bg-black/30 hover:bg-black/50 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 border border-white/20"
          aria-label="Scroll right"
        >
          <ChevronRight className="text-white h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default ContentCarousel;
