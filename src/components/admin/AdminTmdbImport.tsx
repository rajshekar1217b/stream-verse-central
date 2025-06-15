import React, { useState } from 'react';
import { importFromTmdb, addContent } from '@/services/api';
import { Content } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Check, X, Film, Tv, Image, Settings, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface AdminTmdbImportProps {
  onImport: (content: Content) => void;
}

const AdminTmdbImport: React.FC<AdminTmdbImportProps> = ({ onImport }) => {
  const [tmdbId, setTmdbId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [importedContent, setImportedContent] = useState<Content | null>(null);
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [includePosters, setIncludePosters] = useState(true);
  const [includeBackdrops, setIncludeBackdrops] = useState(true);
  const [includeExtras, setIncludeExtras] = useState(true);
  const [autoFetchProviders, setAutoFetchProviders] = useState(true);

  const handleImport = async () => {
    if (!tmdbId.trim()) {
      toast.error('Please enter a TMDB ID');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Importing ${contentType} with ID: ${tmdbId.trim()}`);
      const content = await importFromTmdb(tmdbId.trim(), contentType);
      
      if (content) {
        // Process images from TMDB import - make sure they are properly structured
        let processedImages = [];
        
        // Ensure images is an array before filtering
        if (content.images && Array.isArray(content.images)) {
          processedImages = content.images
            .filter(img => img && typeof img === 'object' && img.path && img.type)
            .map(img => ({ 
              path: img.path,
              type: img.type === 'poster' ? 'poster' : 'backdrop'
            }));
        }
        
        // Always include poster and backdrop in images if they exist
        if (content.posterPath && !processedImages.some(img => img.path === content.posterPath)) {
          processedImages.push({
            path: content.posterPath,
            type: 'poster'
          });
        }
        
        if (content.backdropPath && !processedImages.some(img => img.path === content.backdropPath)) {
          processedImages.push({
            path: content.backdropPath,
            type: 'backdrop'
          });
        }
        
        // Apply filtering based on user preferences
        if (!includePosters) {
          processedImages = processedImages.filter(img => img.type !== 'poster');
        }
        if (!includeBackdrops) {
          processedImages = processedImages.filter(img => img.type !== 'backdrop');
        }
        
        // Ensure all images have correct structure 
        content.images = processedImages;
        
        console.log("Processed images for TMDB import:", processedImages.length, processedImages);
        
        // Remove extra data if option is turned off
        if (!includeExtras && content) {
          content.cast = [];
        }
        
        // Remove watch providers if auto-fetch is disabled
        if (!autoFetchProviders && content) {
          content.watchProviders = [];
        }
        
        setImportedContent(content);
        
        // Enhanced success message
        const providerMessage = content.watchProviders && content.watchProviders.length > 0 
          ? ` with ${content.watchProviders.length} streaming provider${content.watchProviders.length > 1 ? 's' : ''}`
          : '';
        
        const imageMessage = processedImages.length > 0 
          ? ` and ${processedImages.length} image${processedImages.length !== 1 ? 's' : ''}`
          : '';
        
        // Check if this is real TMDB data or mock data
        const isRealData = !content.title.includes('Sample') && !content.title.includes('Enhanced');
        const dataSource = isRealData ? 'TMDB API' : 'mock data (TMDB API key required for real data)';
        
        toast.success(`Successfully imported "${content.title}" from TMDB (${content.type === 'movie' ? 'Movie' : 'TV Show'})${providerMessage}${imageMessage}`);
      } else {
        toast.error('Failed to import content. Invalid TMDB ID or content not found.');
      }
    } catch (error) {
      console.error('Import error:', error);
      
      // Enhanced error handling
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred during import');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContent = async () => {
    if (!importedContent) return;
    
    setIsAdding(true);
    try {
      // Ensure images array is valid before saving
      let contentToSave = { ...importedContent };
      
      if (!contentToSave.images || !Array.isArray(contentToSave.images)) {
        contentToSave.images = [];
        
        if (contentToSave.posterPath) {
          contentToSave.images.push({
            path: contentToSave.posterPath,
            type: 'poster'
          });
        }
        if (contentToSave.backdropPath) {
          contentToSave.images.push({
            path: contentToSave.backdropPath,
            type: 'backdrop'
          });
        }
      }
      
      // Double-check each image in the array has the correct structure
      contentToSave.images = contentToSave.images.map(img => ({
        path: img.path,
        type: img.type === 'poster' ? 'poster' : 'backdrop'
      }));
      
      // Ensure watch providers are properly structured
      if (!contentToSave.watchProviders || !Array.isArray(contentToSave.watchProviders)) {
        contentToSave.watchProviders = [];
      }
      
      console.log("Saving content with images:", contentToSave.images.length);
      console.log("Saving content with watch providers:", contentToSave.watchProviders.length, contentToSave.watchProviders);
      
      const savedContent = await addContent(contentToSave);
      onImport(savedContent);
      setTmdbId('');
      setImportedContent(null);
      
      const providerCount = savedContent.watchProviders?.length || 0;
      const imageCount = savedContent.images?.length || 0;
      
      toast.success(
        `"${savedContent.title}" successfully added to library with ${providerCount} streaming provider${providerCount !== 1 ? 's' : ''} and ${imageCount} image${imageCount !== 1 ? 's' : ''}`
      );
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
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="bg-card p-6 rounded-lg mb-8 border border-border">
      <h2 className="text-xl font-bold mb-4">Import from TMDB</h2>
      
      {!importedContent ? (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Enter a TMDB ID to import content details directly from The Movie Database API.
            <br />
            <span className="text-xs">Examples: Movie IDs (550 for Fight Club, 238 for The Godfather), TV Show IDs (1399 for Game of Thrones, 2734 for The Matrix Reloaded)</span>
          </p>
          
          <Tabs value={contentType} onValueChange={(value) => setContentType(value as 'movie' | 'tv')} className="w-full mb-4">
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
              placeholder="Enter TMDB ID (e.g., 550, 238, 1399)"
              className="admin-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
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
          
          <div className="border border-border rounded-md p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Import Options</h3>
              </div>
            </div>
            
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-fetch-providers" className="flex items-center text-sm">
                  <Wifi className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  Auto-fetch Watch Providers
                </Label>
                <Switch 
                  id="auto-fetch-providers" 
                  checked={autoFetchProviders}
                  onCheckedChange={setAutoFetchProviders}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="include-posters" className="flex items-center text-sm">
                  <Image className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  Include Posters
                </Label>
                <Switch 
                  id="include-posters" 
                  checked={includePosters}
                  onCheckedChange={setIncludePosters}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="include-backdrops" className="flex items-center text-sm">
                  <Image className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  Include Backdrops
                </Label>
                <Switch 
                  id="include-backdrops" 
                  checked={includeBackdrops}
                  onCheckedChange={setIncludeBackdrops}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="include-extras" className="flex items-center text-sm">
                  <Film className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  Include Extra Info (Cast, Rating, etc.)
                </Label>
                <Switch 
                  id="include-extras" 
                  checked={includeExtras}
                  onCheckedChange={setIncludeExtras}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-36 shrink-0">
              <img 
                src={importedContent.posterPath} 
                alt={importedContent.title}
                className="w-full h-auto object-cover rounded"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">{importedContent.title}</h3>
                {importedContent.type === 'movie' ? (
                  <Film className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Tv className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              <div className="text-sm text-muted-foreground mb-2">
                {importedContent.type === 'movie' ? 'Movie' : 'TV Series'} • 
                {importedContent.type === 'movie' && importedContent.duration && ` ${importedContent.duration} • `}
                {formatDate(importedContent.releaseDate)}
              </div>
              
              <p className="text-sm text-foreground/80 line-clamp-3 mb-3">
                {importedContent.overview}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {importedContent.genres.map((genre, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 bg-secondary rounded-full text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              {importedContent.type === 'tv' && importedContent.seasons && (
                <div className="text-xs text-muted-foreground mt-1">
                  {importedContent.seasons.length} {importedContent.seasons.length === 1 ? 'Season' : 'Seasons'}
                </div>
              )}
              
              {importedContent.trailerUrl && (
                <div className="text-xs text-blue-400 mt-1">
                  Trailer available
                </div>
              )}
              
              {importedContent.images && Array.isArray(importedContent.images) && importedContent.images.length > 0 && (
                <div className="text-xs text-green-400 mt-1">
                  {importedContent.images.length} image{importedContent.images.length > 1 ? 's' : ''} imported
                </div>
              )}
              
              {importedContent.watchProviders && importedContent.watchProviders.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    Available on:
                  </span>
                  {importedContent.watchProviders.map((provider, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <img 
                        src={provider.logoPath}
                        alt={provider.name}
                        title={provider.name}
                        className="h-5 w-5 object-cover rounded-sm"
                      />
                      <span className="text-xs text-muted-foreground">{provider.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isAdding}
              className="border-border text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleAddContent}
              disabled={isAdding}
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
