
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

interface ContentFilterProps {
  genres: string[];
  selectedGenres: string[];
  onGenreToggle: (genre: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
}

const ContentFilter: React.FC<ContentFilterProps> = ({
  genres,
  selectedGenres,
  onGenreToggle,
  sortBy,
  onSortChange,
  onClearFilters
}) => {
  return (
    <div className="mb-8 space-y-6">
      {/* Glass container for filters */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        
        {/* Sort Options */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-400" />
            <span className="text-sm font-medium text-white/90">Sort by:</span>
          </div>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-48 web3-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/20">
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="title-desc">Title Z-A</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="rating-low">Lowest Rated</SelectItem>
              <SelectItem value="release-date">Newest First</SelectItem>
              <SelectItem value="release-date-old">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Genre Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/90">Filter by Genre:</span>
            {selectedGenres.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs text-white/70 hover:text-white hover:bg-white/10"
              >
                Clear All
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            {genres.map((genre) => (
              <Badge
                key={genre}
                variant={selectedGenres.includes(genre) ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedGenres.includes(genre) 
                    ? "web3-badge shadow-lg shadow-purple-500/25" 
                    : "web3-badge hover:shadow-md hover:shadow-blue-500/20"
                }`}
                onClick={() => onGenreToggle(genre)}
              >
                {genre}
                {selectedGenres.includes(genre) && (
                  <X className="ml-2 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {selectedGenres.length > 0 && (
          <div className="text-sm text-white/60 backdrop-blur-xl bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-purple-400 font-medium">Active:</span> {selectedGenres.length} genre filter{selectedGenres.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentFilter;
