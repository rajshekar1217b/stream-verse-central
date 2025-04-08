
import React, { useState } from 'react';
import { importFromTmdb } from '@/services/api';
import { Content } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Check, X, Film, Tv } from 'lucide-react';
import { toast } from 'sonner';

interface AdminTmdbImportProps {
  onImport: (content: Content) => void;
}

const AdminTmdbImport: React.FC<AdminTmdbImportProps> = ({ onImport }) => {
  const [tmdbId, setTmdbId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importedContent, setImportedContent] = useState<Content | null>(null);

  const handleImport = async () => {
    if (!tmdbId.trim()) {
      toast.error('Please enter a TMDB ID');
      return;
    }

    setIsLoading(true);
    try {
      const content = await importFromTmdb(tmdbId);
      if (content) {
        setImportedContent(content);
        toast.success(`Successfully imported "${content.title}"`);
      } else {
        toast.error('Failed to import content. Invalid TMDB ID or content not found.');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('An error occurred during import');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContent = () => {
    if (importedContent) {
      onImport(importedContent);
      setTmdbId('');
      setImportedContent(null);
      toast.success('Content added to library');
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
    <div className="bg-ott-card p-6 rounded-lg mb-8">
      <h2 className="text-xl font-bold mb-4">Import from TMDB</h2>
      
      {!importedContent ? (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Enter a TMDB ID to import content details directly from The Movie Database API.
          </p>
          
          <div className="flex gap-2">
            <Input
              type="text"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              placeholder="e.g. 550 (Fight Club), 1399 (Game of Thrones)"
              className="admin-input"
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
                  <Film className="h-4 w-4 text-gray-400" />
                ) : (
                  <Tv className="h-4 w-4 text-gray-400" />
                )}
              </div>
              
              <div className="text-sm text-gray-400 mb-2">
                {importedContent.type === 'movie' ? 'Movie' : 'TV Series'} • 
                {importedContent.type === 'movie' && importedContent.duration && ` ${importedContent.duration} • `}
                {formatDate(importedContent.releaseDate)}
              </div>
              
              <p className="text-sm text-gray-300 line-clamp-3 mb-3">
                {importedContent.overview}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {importedContent.genres.map((genre, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 bg-gray-800 rounded-full text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              {importedContent.type === 'tv' && importedContent.seasons && (
                <div className="text-xs text-gray-400 mt-1">
                  {importedContent.seasons.length} {importedContent.seasons.length === 1 ? 'Season' : 'Seasons'}
                </div>
              )}
              
              {importedContent.trailerUrl && (
                <div className="text-xs text-blue-400 mt-1">
                  Trailer available
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleAddContent}>
              <Check className="h-4 w-4 mr-2" />
              Add to Library
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTmdbImport;
