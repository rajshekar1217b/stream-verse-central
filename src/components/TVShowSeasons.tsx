
import React, { useState } from 'react';
import { Season, Episode } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calendar, Clock, Star, Play, Film, List, Video } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, HorizontalScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface TVShowSeasonsProps {
  seasons: Season[];
}

const TVShowSeasons: React.FC<TVShowSeasonsProps> = ({ seasons }) => {
  const [selectedSeason, setSelectedSeason] = useState<string>(seasons[0]?.id || '');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  if (!seasons || seasons.length === 0) {
    return <div className="text-muted-foreground mt-4">No seasons available</div>;
  }

  // Find the currently selected season object
  const currentSeason = seasons.find(s => s.id === selectedSeason) || seasons[0];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Seasons & Episodes</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-muted' : ''}`}
            aria-label="List view"
          >
            <List size={16} />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-muted' : ''}`}
            aria-label="Grid view"
          >
            <Video size={16} />
          </button>
        </div>
      </div>
      
      {/* Mobile Season Selector (for small screens) */}
      <div className="md:hidden mb-4">
        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Season" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((season) => (
              <SelectItem key={season.id} value={season.id}>
                {season.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:block">
        <Tabs defaultValue={seasons[0]?.id} onValueChange={setSelectedSeason} className="w-full">
          <div className="relative">
            <ScrollArea className="w-full overflow-auto pb-1" orientation="horizontal">
              <TabsList className="w-max inline-flex flex-nowrap mb-4">
                {seasons.map((season) => (
                  <TabsTrigger 
                    key={season.id} 
                    value={season.id}
                    className="flex-shrink-0 whitespace-nowrap"
                  >
                    {season.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
      
      {/* Season Content - shown for both mobile and desktop */}
      <div className="bg-card rounded-lg p-4 shadow-md">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {currentSeason.posterPath && (
            <img 
              src={currentSeason.posterPath} 
              alt={currentSeason.name} 
              className="w-32 h-auto rounded shadow-md"
            />
          )}
          <div className="flex-1">
            <h3 className="text-xl font-medium">{currentSeason.name}</h3>
            <div className="flex flex-wrap gap-3 mt-2 mb-2">
              {currentSeason.airDate && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(currentSeason.airDate).getFullYear()}
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <Film className="h-3 w-3" />
                {currentSeason.episodeCount} Episodes
              </Badge>
            </div>
            {currentSeason.overview && (
              <p className="mt-2 text-sm text-muted-foreground">{currentSeason.overview}</p>
            )}
          </div>
        </div>
        
        {currentSeason.episodes && currentSeason.episodes.length > 0 && (
          viewMode === 'list' ? (
            <Accordion type="single" collapsible className="w-full">
              {currentSeason.episodes.map((episode) => (
                <EpisodeListItem key={episode.id} episode={episode} />
              ))}
            </Accordion>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {currentSeason.episodes.map((episode) => (
                <EpisodeGridItem key={episode.id} episode={episode} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

interface EpisodeItemProps {
  episode: Episode;
}

const EpisodeListItem: React.FC<EpisodeItemProps> = ({ episode }) => {
  return (
    <AccordionItem value={episode.id} className="border-b border-border">
      <AccordionTrigger className="hover:no-underline py-3">
        <div className="flex w-full justify-between items-center pr-4">
          <div className="flex items-center">
            <span className="w-8 text-center font-medium">{episode.episodeNumber}</span>
            <span className="ml-2">{episode.title}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            {episode.duration && (
              <span className="flex items-center mr-3">
                <Clock className="h-3 w-3 mr-1" />
                {episode.duration}
              </span>
            )}
            {episode.rating && (
              <span className="flex items-center">
                <Star className="h-3 w-3 mr-1 text-yellow-500" />
                {episode.rating}
              </span>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-10 pr-4">
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex mb-2 cursor-pointer">
              {episode.stillPath && (
                <div className="relative group">
                  <img 
                    src={episode.stillPath} 
                    alt={episode.title} 
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-10 w-10 text-white" />
                  </div>
                </div>
              )}
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {episode.episodeNumber}. {episode.title}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {episode.stillPath && (
                <img 
                  src={episode.stillPath} 
                  alt={episode.title} 
                  className="w-full h-auto max-h-60 object-cover rounded-md mb-4"
                />
              )}
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                {episode.airDate && (
                  <span className="flex items-center mr-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(episode.airDate).toLocaleDateString()}
                  </span>
                )}
                {episode.duration && (
                  <span className="flex items-center mr-4">
                    <Clock className="h-4 w-4 mr-1" />
                    {episode.duration}
                  </span>
                )}
                {episode.rating && (
                  <span className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {episode.rating}
                  </span>
                )}
              </div>
              <p>{episode.overview}</p>
            </div>
          </DialogContent>
        </Dialog>
        <p className="text-sm mb-2">{episode.overview}</p>
        {episode.airDate && (
          <p className="text-xs text-muted-foreground">
            Air date: {new Date(episode.airDate).toLocaleDateString()}
          </p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

const EpisodeGridItem: React.FC<EpisodeItemProps> = ({ episode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <div className="relative aspect-video">
            <img 
              src={episode.stillPath || 'https://via.placeholder.com/500x281?text=No+Image'} 
              alt={episode.title} 
              className="w-full h-full object-cover rounded-t-lg"
            />
            <div className="absolute top-2 left-2">
              <Badge className="bg-primary/80 hover:bg-primary">E{episode.episodeNumber}</Badge>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
              <Play className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardContent className="p-3">
            <h4 className="font-medium line-clamp-1">{episode.title}</h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {episode.duration && (
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {episode.duration}
                </span>
              )}
              {episode.rating && (
                <span className="flex items-center">
                  <Star className="h-3 w-3 mr-1 text-yellow-500" />
                  {episode.rating}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {episode.episodeNumber}. {episode.title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {episode.stillPath && (
            <img 
              src={episode.stillPath} 
              alt={episode.title} 
              className="w-full h-auto max-h-60 object-cover rounded-md mb-4"
            />
          )}
          <div className="flex items-center text-sm text-muted-foreground mb-3">
            {episode.airDate && (
              <span className="flex items-center mr-4">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(episode.airDate).toLocaleDateString()}
              </span>
            )}
            {episode.duration && (
              <span className="flex items-center mr-4">
                <Clock className="h-4 w-4 mr-1" />
                {episode.duration}
              </span>
            )}
            {episode.rating && (
              <span className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                {episode.rating}
              </span>
            )}
          </div>
          <p>{episode.overview}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TVShowSeasons;
