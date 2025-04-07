
import React, { useState, useEffect } from 'react';
import { Content, WatchProvider, Genre } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { watchProviders } from '@/data/mockData';
import { CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';

interface AdminContentFormProps {
  initialContent?: Content;
  onSave: (content: Content) => void;
  onCancel: () => void;
}

const AdminContentForm: React.FC<AdminContentFormProps> = ({
  initialContent,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Content>>(
    initialContent || {
      id: '',
      title: '',
      overview: '',
      posterPath: '',
      backdropPath: '',
      releaseDate: '',
      type: 'movie',
      genres: [],
      rating: 0,
      watchProviders: [],
    }
  );

  const [newGenre, setNewGenre] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  const isEditMode = !!initialContent;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTypeChange = (value: string) => {
    setFormData({
      ...formData,
      type: value as 'movie' | 'tv',
    });
  };

  const handleAddGenre = () => {
    if (newGenre.trim() && !formData.genres?.includes(newGenre.trim())) {
      setFormData({
        ...formData,
        genres: [...(formData.genres || []), newGenre.trim()],
      });
      setNewGenre('');
    }
  };

  const handleRemoveGenre = (genre: string) => {
    setFormData({
      ...formData,
      genres: formData.genres?.filter(g => g !== genre),
    });
  };

  const handleAddProvider = () => {
    if (selectedProvider) {
      const provider = watchProviders.find(p => p.id === selectedProvider);
      if (provider && !formData.watchProviders?.some(p => p.id === provider.id)) {
        setFormData({
          ...formData,
          watchProviders: [...(formData.watchProviders || []), provider],
        });
      }
      setSelectedProvider('');
    }
  };

  const handleRemoveProvider = (providerId: string) => {
    setFormData({
      ...formData,
      watchProviders: formData.watchProviders?.filter(p => p.id !== providerId),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['title', 'overview', 'posterPath', 'type'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof Content]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in the required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Generate a placeholder ID if needed
    const contentToSave = {
      ...formData,
      id: formData.id || Date.now().toString(),
      genres: formData.genres || [],
      rating: Number(formData.rating) || 0,
    } as Content;
    
    onSave(contentToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-ott-card p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-6">
        {isEditMode ? 'Edit Content' : 'Add New Content'}
      </h2>
      
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title*</Label>
        <Input
          id="title"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          placeholder="Enter title"
          className="admin-input"
          required
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Type*</Label>
        <Select 
          value={formData.type} 
          onValueChange={handleTypeChange}
        >
          <SelectTrigger id="type" className="admin-input">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="movie">Movie</SelectItem>
            <SelectItem value="tv">TV Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview */}
      <div className="space-y-2">
        <Label htmlFor="overview">Overview*</Label>
        <Textarea
          id="overview"
          name="overview"
          value={formData.overview || ''}
          onChange={handleChange}
          placeholder="Enter overview"
          className="admin-input h-28"
          required
        />
      </div>

      {/* Poster & Backdrop URLs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="posterPath">Poster URL*</Label>
          <Input
            id="posterPath"
            name="posterPath"
            value={formData.posterPath || ''}
            onChange={handleChange}
            placeholder="Enter poster image URL"
            className="admin-input"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="backdropPath">Backdrop URL</Label>
          <Input
            id="backdropPath"
            name="backdropPath"
            value={formData.backdropPath || ''}
            onChange={handleChange}
            placeholder="Enter backdrop image URL"
            className="admin-input"
          />
        </div>
      </div>

      {/* Release Date & Rating */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="releaseDate">Release Date</Label>
          <Input
            id="releaseDate"
            name="releaseDate"
            type="date"
            value={formData.releaseDate || ''}
            onChange={handleChange}
            className="admin-input"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0-10)</Label>
          <Input
            id="rating"
            name="rating"
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={formData.rating || ''}
            onChange={handleChange}
            className="admin-input"
          />
        </div>
      </div>

      {/* Genres */}
      <div className="space-y-3">
        <Label>Genres</Label>
        <div className="flex flex-wrap gap-2">
          {formData.genres?.map((genre) => (
            <div 
              key={genre} 
              className="flex items-center bg-gray-800 px-3 py-1 rounded-full text-sm"
            >
              {genre}
              <button 
                type="button"
                onClick={() => handleRemoveGenre(genre)}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <XCircle size={14} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            value={newGenre}
            onChange={(e) => setNewGenre(e.target.value)}
            placeholder="Add a genre"
            className="admin-input"
          />
          <Button 
            type="button"
            onClick={handleAddGenre}
            variant="outline"
            className="border-gray-700"
            disabled={!newGenre.trim()}
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>

      {/* Watch Providers */}
      <div className="space-y-3">
        <Label>Watch Providers</Label>
        <div className="flex flex-wrap gap-2">
          {formData.watchProviders?.map((provider) => (
            <div 
              key={provider.id} 
              className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full text-sm"
            >
              <img 
                src={provider.logoPath} 
                alt={provider.name} 
                className="w-4 h-4 rounded-full"
              />
              {provider.name}
              <button 
                type="button"
                onClick={() => handleRemoveProvider(provider.id)}
                className="ml-2 text-gray-400 hover:text-white"
              >
                <XCircle size={14} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={selectedProvider} 
            onValueChange={setSelectedProvider}
          >
            <SelectTrigger className="admin-input">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {watchProviders.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  <div className="flex items-center gap-2">
                    <img 
                      src={provider.logoPath} 
                      alt={provider.name} 
                      className="w-4 h-4 rounded-full"
                    />
                    {provider.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            type="button"
            onClick={handleAddProvider}
            variant="outline"
            className="border-gray-700"
            disabled={!selectedProvider}
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end gap-4 mt-8">
        <Button type="button" variant="outline" onClick={onCancel} className="border-gray-700">
          Cancel
        </Button>
        <Button type="submit" className="bg-ott-accent hover:bg-ott-accent/80">
          {isEditMode ? 'Update Content' : 'Add Content'}
        </Button>
      </div>
    </form>
  );
};

export default AdminContentForm;
