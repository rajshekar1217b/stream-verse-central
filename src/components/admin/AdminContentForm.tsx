
import React, { useState, useEffect } from 'react';
import { Content, WatchProvider } from '@/types';
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
import { CheckCircle, XCircle, Plus, Trash2, Video } from 'lucide-react';

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
      embedVideos: [],
      images: []
    }
  );

  const [newGenre, setNewGenre] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [providerRedirectLink, setProviderRedirectLink] = useState<string>('');
  const [newEmbedVideoUrl, setNewEmbedVideoUrl] = useState('');
  const [newEmbedVideoTitle, setNewEmbedVideoTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageType, setNewImageType] = useState<'poster' | 'backdrop'>('backdrop');

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
        const newProvider = {
          ...provider,
          redirectLink: providerRedirectLink || provider.redirectLink || '',
        };
        setFormData({
          ...formData,
          watchProviders: [...(formData.watchProviders || []), newProvider],
        });
      }
      setSelectedProvider('');
      setProviderRedirectLink('');
    }
  };

  const handleRemoveProvider = (providerId: string) => {
    setFormData({
      ...formData,
      watchProviders: formData.watchProviders?.filter(p => p.id !== providerId),
    });
  };

  const handleUpdateProviderRedirectLink = (providerId: string, redirectLink: string) => {
    setFormData({
      ...formData,
      watchProviders: formData.watchProviders?.map(p => 
        p.id === providerId ? { ...p, redirectLink } : p
      ),
    });
  };

  // New function to handle adding embed video
  const handleAddEmbedVideo = () => {
    if (newEmbedVideoUrl.trim()) {
      setFormData({
        ...formData,
        embedVideos: [...(formData.embedVideos || []), {
          url: newEmbedVideoUrl.trim(),
          title: newEmbedVideoTitle.trim() || `Video ${(formData.embedVideos?.length || 0) + 1}`
        }],
      });
      setNewEmbedVideoUrl('');
      setNewEmbedVideoTitle('');
    }
  };

  // New function to handle removing embed video
  const handleRemoveEmbedVideo = (index: number) => {
    setFormData({
      ...formData,
      embedVideos: formData.embedVideos?.filter((_, idx) => idx !== index),
    });
  };

  // New function to handle adding image to gallery
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), {
          path: newImageUrl.trim(),
          type: newImageType
        }],
      });
      setNewImageUrl('');
    }
  };

  // New function to handle removing image from gallery
  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images?.filter((_, idx) => idx !== index),
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
      images: formData.images || [],
      embedVideos: formData.embedVideos || []
    } as Content;
    
    onSave(contentToSave);
  };

  // Initialize provider redirect link when selecting a provider
  useEffect(() => {
    if (selectedProvider) {
      const provider = watchProviders.find(p => p.id === selectedProvider);
      setProviderRedirectLink(provider?.redirectLink || '');
    }
  }, [selectedProvider]);

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

      {/* New Section: Embed Videos */}
      <div className="space-y-3 border border-gray-700 p-4 rounded-lg">
        <Label className="text-lg font-medium flex items-center gap-2">
          <Video size={18} />
          Embedded Videos
        </Label>
        
        {/* List of existing embed videos */}
        {formData.embedVideos && formData.embedVideos.length > 0 ? (
          <div className="space-y-3">
            {formData.embedVideos.map((video, index) => (
              <div key={index} className="flex flex-col bg-gray-800 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{video.title}</span>
                  <Button 
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEmbedVideo(index)}
                    className="text-red-500 h-8 px-2"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <div className="text-xs text-gray-400 break-all">{video.url}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No videos added yet.</p>
        )}
        
        {/* Form to add new embed video */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="embedVideoTitle" className="text-sm">Video Title</Label>
            <Input
              id="embedVideoTitle"
              value={newEmbedVideoTitle}
              onChange={(e) => setNewEmbedVideoTitle(e.target.value)}
              placeholder="Enter video title (optional)"
              className="admin-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="embedVideoUrl" className="text-sm">Video URL</Label>
            <div className="flex items-center gap-2">
              <Input
                id="embedVideoUrl"
                value={newEmbedVideoUrl}
                onChange={(e) => setNewEmbedVideoUrl(e.target.value)}
                placeholder="Enter YouTube or other embed URL"
                className="admin-input flex-1"
              />
              <Button 
                type="button"
                onClick={handleAddEmbedVideo}
                variant="outline"
                className="border-gray-700"
                disabled={!newEmbedVideoUrl.trim()}
              >
                <Plus size={16} />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Support for YouTube, Vimeo, and other embed URLs.
              Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
            </p>
          </div>
        </div>
      </div>

      {/* New Section: Image Gallery */}
      <div className="space-y-3 border border-gray-700 p-4 rounded-lg">
        <Label className="text-lg font-medium">Image Gallery</Label>
        
        {/* List of existing gallery images */}
        {formData.images && formData.images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img 
                  src={image.path}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                  }}
                />
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                  {image.type}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={() => handleRemoveImage(index)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No gallery images added yet.</p>
        )}
        
        {/* Form to add new gallery image */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="newImageUrl" className="text-sm">Image URL</Label>
            <div className="flex items-center gap-2">
              <Input
                id="newImageUrl"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="admin-input flex-1"
              />
              <Select 
                value={newImageType} 
                onValueChange={(value) => setNewImageType(value as 'poster' | 'backdrop')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backdrop">Backdrop</SelectItem>
                  <SelectItem value="poster">Poster</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                type="button"
                onClick={handleAddImage}
                variant="outline"
                className="border-gray-700"
                disabled={!newImageUrl.trim()}
              >
                <Plus size={16} />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Add at least 10-15 high-quality images for optimal gallery view.
            </p>
          </div>
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
              className="flex flex-col bg-gray-800 p-3 rounded-lg text-sm w-full"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img 
                    src={provider.logoPath} 
                    alt={provider.name} 
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium">{provider.name}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => handleRemoveProvider(provider.id)}
                  className="text-gray-400 hover:text-white"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`website-${provider.id}`} className="text-xs text-gray-400">Website URL</Label>
                <Input
                  id={`website-${provider.id}`}
                  value={provider.url}
                  readOnly
                  className="admin-input text-xs bg-gray-900"
                />
                
                <Label htmlFor={`redirect-${provider.id}`} className="text-xs text-gray-400">App Redirect Link</Label>
                <Input
                  id={`redirect-${provider.id}`}
                  value={provider.redirectLink || ''}
                  onChange={(e) => handleUpdateProviderRedirectLink(provider.id, e.target.value)}
                  placeholder="e.g., netflix://title/12345"
                  className="admin-input text-xs"
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 gap-4 border border-gray-700 p-4 rounded-lg">
          <Label className="text-sm font-medium mb-2">Add Watch Provider</Label>
          
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
          
          {selectedProvider && (
            <div className="space-y-2">
              <Label htmlFor="providerRedirectLink" className="text-xs text-gray-400">App Redirect Link</Label>
              <Input
                id="providerRedirectLink"
                value={providerRedirectLink}
                onChange={(e) => setProviderRedirectLink(e.target.value)}
                placeholder="e.g., netflix://title/12345"
                className="admin-input"
              />
              <p className="text-xs text-gray-500">
                This is the URL scheme that will open the content in the provider's native app.
                Example: netflix://title/81260280
              </p>
            </div>
          )}
          
          <Button 
            type="button"
            onClick={handleAddProvider}
            variant="outline"
            className="border-gray-700 w-full mt-2"
            disabled={!selectedProvider}
          >
            <Plus size={16} className="mr-2" /> Add Provider
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
