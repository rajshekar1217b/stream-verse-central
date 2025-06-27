
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Search, Loader2, Calendar, Clock, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Content } from '@/types';
import { importFromTmdb } from '@/services/api';

interface AdminTmdbImportProps {
  onImport: (content: Content) => void;
}

const AdminTmdbImport: React.FC<AdminTmdbImportProps> = ({ onImport }) => {
  const [tmdbId, setTmdbId] = useState('');
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<Content | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handlePreview = async () => {
    if (!tmdbId.trim()) {
      toast.error('Please enter a TMDB ID');
      return;
    }

    setIsImporting(true);
    setPreviewData(null);

    try {
      console.log('Previewing TMDB content:', { tmdbId: tmdbId.trim(), contentType });
      const content = await importFromTmdb(tmdbId.trim(), contentType);
      setPreviewData(content);
      setIsPreviewMode(true);
      toast.success('Preview loaded successfully');
    } catch (error) {
      console.error('Preview error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to preview content');
    } finally {
      setIsImporting(false);
    }
  };

  const handleImport = async () => {
    if (!previewData) {
      toast.error('No content to import');
      return;
    }

    setIsImporting(true);

    try {
      onImport(previewData);
      setTmdbId('');
      setPreviewData(null);
      setIsPreviewMode(false);
      toast.success(`"${previewData.title}" imported successfully`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import content');
    } finally {
      setIsImporting(false);
    }
  };

  const resetPreview = () => {
    setPreviewData(null);
    setIsPreviewMode(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          TMDB Import
        </CardTitle>
        <CardDescription>
          Import movies and TV shows from The Movie Database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isPreviewMode ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter TMDB ID (e.g., 550 for Fight Club)"
                value={tmdbId}
                onChange={(e) => setTmdbId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePreview()}
              />
            </div>
            <Select value={contentType} onValueChange={(value: 'movie' | 'tv') => setContentType(value)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="movie">Movie</SelectItem>
                <SelectItem value="tv">TV Show</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handlePreview}
              disabled={isImporting || !tmdbId.trim()}
            >
              {isImporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Preview
            </Button>
          </div>
        ) : (
          previewData && (
            <div className="space-y-6">
              {/* Header with poster and basic info */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-48 flex-shrink-0">
                  <img
                    src={previewData.posterPath || '/placeholder.svg'}
                    alt={previewData.title}
                    className="w-full rounded-lg shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{previewData.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {previewData.releaseDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(previewData.releaseDate).getFullYear()}
                        </div>
                      )}
                      {previewData.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {previewData.duration}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {previewData.rating?.toFixed(1)}/10
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {previewData.genres.map((genre, index) => (
                      <Badge key={index} variant="secondary">{genre}</Badge>
                    ))}
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {previewData.overview}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Additional details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                {previewData.watchProviders && previewData.watchProviders.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Watch Providers</div>
                    <div className="text-2xl font-bold text-primary">{previewData.watchProviders.length}</div>
                  </div>
                )}
                
                {previewData.cast && previewData.cast.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Cast Members</div>
                    <div className="text-2xl font-bold text-primary">{previewData.cast.length}</div>
                  </div>
                )}
                
                {previewData.images && previewData.images.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Images</div>
                    <div className="text-2xl font-bold text-primary">{previewData.images.length}</div>
                  </div>
                )}
                
                {previewData.embedVideos && previewData.embedVideos.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Videos</div>
                    <div className="text-2xl font-bold text-primary">{previewData.embedVideos.length}</div>
                  </div>
                )}
              </div>

              {/* TV Show specific info */}
              {previewData.type === 'tv' && previewData.seasons && previewData.seasons.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Seasons ({previewData.seasons.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {previewData.seasons.slice(0, 6).map((season) => (
                        <div key={season.id} className="text-sm bg-muted/50 p-2 rounded">
                          <div className="font-medium">{season.name}</div>
                          <div className="text-muted-foreground">
                            {season.episodeCount} episodes
                          </div>
                        </div>
                      ))}
                      {previewData.seasons.length > 6 && (
                        <div className="text-sm text-muted-foreground p-2">
                          +{previewData.seasons.length - 6} more seasons
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button 
                  onClick={handleImport}
                  disabled={isImporting}
                  className="flex-1"
                >
                  {isImporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Import to Library
                </Button>
                <Button 
                  onClick={resetPreview}
                  variant="outline"
                  disabled={isImporting}
                  className="flex-1 sm:flex-initial"
                >
                  Import Different Content
                </Button>
              </div>
            </div>
          )
        )}

        {/* Help text */}
        <div className="text-xs text-muted-foreground">
          <p>Find TMDB IDs by visiting TheMovieDB.org and looking at the URL. For example:</p>
          <p className="mt-1">
            • Movie: themoviedb.org/movie/<strong>550</strong> (Fight Club)
          </p>
          <p>
            • TV Show: themoviedb.org/tv/<strong>1396</strong> (Breaking Bad)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTmdbImport;
