
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

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
    <div className="mb-6 space-y-4">
      {/* Sort Options */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Sort by:</span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Filter by Genre:</span>
          {selectedGenres.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Badge
              key={genre}
              variant={selectedGenres.includes(genre) ? "default" : "outline"}
              className="cursor-pointer hover:bg-accent"
              onClick={() => onGenreToggle(genre)}
            >
              {genre}
              {selectedGenres.includes(genre) && (
                <X className="ml-1 h-3 w-3" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {selectedGenres.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {selectedGenres.length} genre filter{selectedGenres.length > 1 ? 's' : ''} active
        </div>
      )}
    </div>
  );
};

export default ContentFilter;
