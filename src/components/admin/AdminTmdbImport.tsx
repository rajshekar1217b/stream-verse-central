
import React, { useState } from 'react';
import { importFromTmdb } from '@/services/api';
import { Content } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Check, X } from 'lucide-react';
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

  return (
    <div className="bg-ott-card p-6 rounded-lg mb-8">
      <h2 className="text-xl font-bold mb-4">Import from TMDB</h2>
      
      {!importedContent ? (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Enter a TMDB ID to import content details directly from The Movie Database.
          </p>
          
          <div className="flex gap-2">
            <Input
              type="text"
              value={tmdbId}
              onChange={(e) => setTmdbId(e.target.value)}
              placeholder="e.g. 550 (Fight Club)"
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
            <img 
              src={importedContent.posterPath} 
              alt={importedContent.title}
              className="w-20 h-30 object-cover rounded"
            />
            
            <div className="flex-1">
              <h3 className="font-bold">{importedContent.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {importedContent.overview}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {importedContent.genres.map((genre, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 bg-gray-800 rounded-full text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
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
