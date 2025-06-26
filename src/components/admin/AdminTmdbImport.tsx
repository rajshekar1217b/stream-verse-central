
import React, { useState } from 'react';
import { importFromTmdb, addContent } from '@/services/api';
import { Content } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Check, X, Film, Tv, Image, Settings, Wifi, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminTmdbImportProps {
  onImport: (content: Content) => void;
}

const AdminTmdbImport: React.FC<AdminTmdbImportProps> = ({ onImport }) => {
  const [tmdbId, setTmdbId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [importedContent, setImportedContent] = useState<Content | null>(null);
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!tmdbId.trim()) {
      toast.error('Please enter a TMDB ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Importing ${contentType} with ID: ${tmdbId.trim()}`);
      const content = await importFromTmdb(tmdbId.trim(), contentType);
      
      setImportedContent(content);
      
      const providerCount = content.watchProviders?.length || 0;
      const imageCount = content.images?.length || 0;
      const seasonCount = content.seasons?.length || 0;
      
      let successMessage = `Successfully imported "${content.title}" from TMDB`;
      
      if (content.type === 'tv' && seasonCount > 0) {
        successMessage += ` with ${seasonCount} season${seasonCount !== 1 ? 's' : ''}`;
      }
      
      if (providerCount > 0) {
        successMessage += ` and ${providerCount} streaming provider${providerCount !== 1 ? 's' : ''}`;
      }
      
      toast.success(successMessage);
      
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import content';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContent = async () => {
    if (!importedContent) return;
    
    setIsAdding(true);
    try {
      const savedContent = await addContent(importedContent);
      onImport(savedContent);
      setTmdbId('');
      setImportedContent(null);
      setError(null);
      
      toast.success(`"${savedContent.title}" successfully added to your library`);
    } catch (error) {
      console.error('Error adding imported content:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save content to library');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setImportedContent(null);
    setTmdbId('');
    setError(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg mb-8 border border-border">
      <h2 className="text-xl font-bold mb-4">Import from TMDB</h2>
      
      {!importedContent ? (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Enter a TMDB ID to import content details directly from The Movie Database API.
              <br />
              <strong>Examples:</strong> Movies (550 for Fight Club, 238 for The Godfather), TV Shows (1399 for Game of Thrones, 94605 for Arcane)
            </AlertDescription>
          </Alert>
          
          <Tabs value={contentType} onValueChange={(value) => setContentType(value as 'movie' | 'tv')} className="w-full">
            <TabsList>
              <TabsTrigger value="movie" className="flex items-center gap-2">
                <Film className="h-4 w-4" />
                Movie
              </TabsTrigger>
              <TabsTrigger value="tv" className="flex items-center gap-2">
                <Tv className="h-4 w-4" />
                TV Show
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2">
            <Input
              type="text"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              placeholder={`Enter TMDB ${contentType === 'movie' ? 'Movie' : 'TV Show'} ID`}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleImport();
                }
              }}
            />
            
            <Button 
              onClick={handleImport}
              disabled={isLoading || !tmdbId.trim()}
              className="min-w-24"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-32 shrink-0">
              {importedContent.posterPath ? (
                <img 
                  src={importedContent.posterPath} 
                  alt={importedContent.title}
                  className="w-full h-auto object-cover rounded"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted rounded flex items-center justify-center">
                  <Image className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg truncate">{importedContent.title}</h3>
                {importedContent.type === 'movie' ? (
                  <Film className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <Tv className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
              
              <div className="text-sm text-muted-foreground mb-3">
                <span className="font-medium">
                  {importedContent.type === 'movie' ? 'Movie' : 'TV Series'}
                </span>
                {importedContent.rating > 0 && (
                  <span> • ⭐ {importedContent.rating.toFixed(1)}/10</span>
                )}
                {importedContent.releaseDate && (
                  <span> • {formatDate(importedContent.releaseDate)}</span>
                )}
                {importedContent.duration && (
                  <span> • {importedContent.duration}</span>
                )}
              </div>
              
              {importedContent.overview && (
                <p className="text-sm text-foreground/80 line-clamp-3 mb-3">
                  {importedContent.overview}
                </p>
              )}
              
              {importedContent.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {importedContent.genres.slice(0, 5).map((genre, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-1 bg-secondary rounded-full text-xs font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                {importedContent.type === 'tv' && importedContent.seasons && importedContent.seasons.length > 0 && (
                  <div className="text-green-600">
                    📺 {importedContent.seasons.length} Season{importedContent.seasons.length !== 1 ? 's' : ''}
                  </div>
                )}
                
                {importedContent.trailerUrl && (
                  <div className="text-blue-600">
                    🎬 Trailer Available
                  </div>
                )}
                
                {importedContent.images && importedContent.images.length > 0 && (
                  <div className="text-purple-600">
                    🖼️ {importedContent.images.length} Image{importedContent.images.length > 1 ? 's' : ''}
                  </div>
                )}
                
                {importedContent.watchProviders && importedContent.watchProviders.length > 0 && (
                  <div className="text-orange-600">
                    📱 {importedContent.watchProviders.length} Provider{importedContent.watchProviders.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isAdding}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleAddContent}
              disabled={isAdding}
              className="bg-primary hover:bg-primary/90"
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Add to Library
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTmdbImport;
