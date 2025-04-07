
import React, { useState } from 'react';
import { importFromImdb } from '@/services/api';
import { Content } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Check, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface AdminImdbImportProps {
  onImport: (content: Content) => void;
}

const AdminImdbImport: React.FC<AdminImdbImportProps> = ({ onImport }) => {
  const [imdbId, setImdbId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importedContent, setImportedContent] = useState<Content | null>(null);

  const handleImport = async () => {
    if (!imdbId.trim()) {
      toast.error('Please enter an IMDb ID');
      return;
    }

    setIsLoading(true);
    try {
      const content = await importFromImdb(imdbId);
      if (content) {
        setImportedContent(content);
        toast.success(`Successfully imported "${content.title}"`);
      } else {
        toast.error('Failed to import content. Invalid IMDb ID or content not found.');
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
      setImdbId('');
      setImportedContent(null);
      toast.success('Content added to library');
    }
  };

  const handleCancel = () => {
    setImportedContent(null);
    setImdbId('');
  };

  return (
    <div className="bg-ott-card p-6 rounded-lg mb-8">
      <h2 className="text-xl font-bold mb-4">Import from IMDb</h2>
      
      {!importedContent ? (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Enter an IMDb ID to import content details directly from IMDb.
          </p>
          
          <div className="flex gap-2">
            <Input
              type="text"
              value={imdbId}
              onChange={(e) => setImdbId(e.target.value)}
              placeholder="e.g. tt0111161"
              className="admin-input"
            />
            
            <Button 
              onClick={handleImport}
              disabled={isLoading || !imdbId.trim()}
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

export default AdminImdbImport;
