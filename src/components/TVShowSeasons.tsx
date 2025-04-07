
import React, { useState } from 'react';
import { Season, Episode } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calendar, Clock, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TVShowSeasonsProps {
  seasons: Season[];
}

const TVShowSeasons: React.FC<TVShowSeasonsProps> = ({ seasons }) => {
  const [selectedSeason, setSelectedSeason] = useState<string>(seasons[0]?.id || '');

  if (!seasons || seasons.length === 0) {
    return <div className="text-muted-foreground mt-4">No seasons available</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium mb-4">Seasons & Episodes</h2>
      
      <Tabs defaultValue={seasons[0]?.id} onValueChange={setSelectedSeason} className="w-full">
        <TabsList className="w-full flex overflow-x-auto pb-1 mb-4">
          {seasons.map((season) => (
            <TabsTrigger 
              key={season.id} 
              value={season.id}
              className="flex-shrink-0"
            >
              {season.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {seasons.map((season) => (
          <TabsContent key={season.id} value={season.id} className="mt-2">
            <div className="bg-card rounded-lg p-4 shadow-md">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                {season.posterPath && (
                  <img 
                    src={season.posterPath} 
                    alt={season.name} 
                    className="w-32 h-auto rounded"
                  />
                )}
                <div>
                  <h3 className="text-xl font-medium">{season.name}</h3>
                  {season.airDate && (
                    <p className="text-sm text-muted-foreground flex items-center mt-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(season.airDate).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {season.episodeCount} Episodes
                  </p>
                  {season.overview && (
                    <p className="mt-2 text-sm">{season.overview}</p>
                  )}
                </div>
              </div>
              
              {season.episodes && season.episodes.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                  {season.episodes.map((episode) => (
                    <EpisodeItem key={episode.id} episode={episode} />
                  ))}
                </Accordion>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

interface EpisodeItemProps {
  episode: Episode;
}

const EpisodeItem: React.FC<EpisodeItemProps> = ({ episode }) => {
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
                <img 
                  src={episode.stillPath} 
                  alt={episode.title} 
                  className="w-full h-32 object-cover rounded-md"
                />
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

export default TVShowSeasons;
