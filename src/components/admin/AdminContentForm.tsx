import React, { useState, useEffect } from 'react';
import { Content, WatchProvider, CastMember, Season, Episode } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface AdminContentFormProps {
  content?: Content;
  onSave: (content: Partial<Content>) => Promise<void>;
  onCancel: () => void;
}

interface ImageType {
  path: string;
  type: 'poster' | 'backdrop';
}

interface VideoType {
  url: string;
  title: string;
}

const AdminContentForm: React.FC<AdminContentFormProps> = ({ content, onSave, onCancel }) => {
  const [title, setTitle] = useState(content?.title || '');
  const [overview, setOverview] = useState(content?.overview || '');
  const [posterPath, setPosterPath] = useState(content?.posterPath || '');
  const [backdropPath, setBackdropPath] = useState(content?.backdropPath || '');
  const [releaseDate, setReleaseDate] = useState(content?.releaseDate || '');
  const [type, setType] = useState(content?.type || 'movie');
  const [genres, setGenres] = useState(content?.genres || []);
  const [rating, setRating] = useState(content?.rating?.toString() || '');
  const [trailerUrl, setTrailerUrl] = useState(content?.trailerUrl || '');
  const [duration, setDuration] = useState(content?.duration || '');
  const [status, setStatus] = useState(content?.status || '');
  const [watchProviders, setWatchProviders] = useState<WatchProvider[]>(content?.watchProviders || []);
  const [cast, setCast] = useState<CastMember[]>(content?.cast || []);
  const [seasons, setSeasons] = useState<Season[]>(content?.seasons || []);
  const [images, setImages] = useState<ImageType[]>(content?.images || []);
  const [embedVideos, setEmbedVideos] = useState<VideoType[]>(content?.embedVideos || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (content) {
      setTitle(content.title || '');
      setOverview(content.overview || '');
      setPosterPath(content.posterPath || '');
      setBackdropPath(content.backdropPath || '');
      setReleaseDate(content.releaseDate || '');
      setType(content.type || 'movie');
      setGenres(content.genres || []);
      setRating(content.rating?.toString() || '');
      setTrailerUrl(content.trailerUrl || '');
      setDuration(content.duration || '');
      setStatus(content.status || '');
      setWatchProviders(content.watchProviders || []);
      setCast(content.cast || []);
      setSeasons(content.seasons || []);
      setImages(content.images || []);
      setEmbedVideos(content.embedVideos || []);
    }
  }, [content]);

  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (genres.includes(value)) {
      setGenres(genres.filter(genre => genre !== value));
    } else {
      setGenres([...genres, value]);
    }
  };

  const handleWatchProviderChange = (index: number, field: keyof WatchProvider, value: string) => {
    const updatedProviders = [...watchProviders];
    updatedProviders[index] = { ...updatedProviders[index], [field]: value };
    setWatchProviders(updatedProviders);
  };

  const addWatchProvider = () => {
    setWatchProviders([...watchProviders, { id: crypto.randomUUID(), name: '', logoPath: '', url: '' }]);
  };

  const removeWatchProvider = (index: number) => {
    const updatedProviders = [...watchProviders];
    updatedProviders.splice(index, 1);
    setWatchProviders(updatedProviders);
  };

  const handleCastChange = (index: number, field: keyof CastMember, value: string) => {
    const updatedCast = [...cast];
    updatedCast[index] = { ...updatedCast[index], [field]: value };
    setCast(updatedCast);
  };

  const addCastMember = () => {
    setCast([...cast, { id: crypto.randomUUID(), name: '', character: '' }]);
  };

  const removeCastMember = (index: number) => {
    const updatedCast = [...cast];
    updatedCast.splice(index, 1);
    setCast(updatedCast);
  };

  const handleSeasonChange = (seasonIndex: number, field: keyof Season, value: any) => {
    const updatedSeasons = [...seasons];
    if (field === 'episodes') {
      // Ensure episodes are properly structured with all required fields
      const processedEpisodes = value.map((episode: any, index: number) => ({
        id: episode.id || `episode-${seasonIndex}-${index}`,
        title: episode.title || `Episode ${index + 1}`,
        overview: episode.overview || '',
        episodeNumber: episode.episodeNumber || index + 1,
        stillPath: episode.stillPath || '',
        airDate: episode.airDate || '',
        duration: episode.duration || '',
        rating: episode.rating || 0
      }));
      updatedSeasons[seasonIndex] = { 
        ...updatedSeasons[seasonIndex], 
        [field]: processedEpisodes 
      };
    } else {
      updatedSeasons[seasonIndex] = { ...updatedSeasons[seasonIndex], [field]: value };
    }
    setSeasons(updatedSeasons);
  };

  const handleEpisodeChange = (seasonIndex: number, episodeIndex: number, field: keyof Episode, value: any) => {
    const updatedSeasons = [...seasons];
    const updatedEpisodes = [...(updatedSeasons[seasonIndex].episodes || [])];
    
    // Ensure the episode object exists with all required fields
    if (!updatedEpisodes[episodeIndex]) {
      updatedEpisodes[episodeIndex] = {
        id: `episode-${seasonIndex}-${episodeIndex}`,
        title: '',
        overview: '',
        episodeNumber: episodeIndex + 1,
        stillPath: '',
        airDate: '',
        duration: '',
        rating: 0
      };
    }
    
    updatedEpisodes[episodeIndex] = { 
      ...updatedEpisodes[episodeIndex], 
      [field]: value 
    };
    updatedSeasons[seasonIndex] = { 
      ...updatedSeasons[seasonIndex], 
      episodes: updatedEpisodes 
    };
    setSeasons(updatedSeasons);
  };

  const addEpisode = (seasonIndex: number) => {
    const updatedSeasons = [...seasons];
    const currentEpisodes = updatedSeasons[seasonIndex].episodes || [];
    const newEpisode: Episode = {
      id: `episode-${seasonIndex}-${currentEpisodes.length}`,
      title: `Episode ${currentEpisodes.length + 1}`,
      overview: '',
      episodeNumber: currentEpisodes.length + 1,
      stillPath: '',
      airDate: '',
      duration: '',
      rating: 0
    };
    
    updatedSeasons[seasonIndex] = {
      ...updatedSeasons[seasonIndex],
      episodes: [...currentEpisodes, newEpisode]
    };
    setSeasons(updatedSeasons);
  };

  const removeEpisode = (seasonIndex: number, episodeIndex: number) => {
    const updatedSeasons = [...seasons];
    const updatedEpisodes = [...(updatedSeasons[seasonIndex].episodes || [])];
    updatedEpisodes.splice(episodeIndex, 1);
    updatedSeasons[seasonIndex] = { ...updatedSeasons[seasonIndex], episodes: updatedEpisodes };
    setSeasons(updatedSeasons);
  };

  const addSeason = () => {
    setSeasons([...seasons, { 
      id: crypto.randomUUID(), 
      name: `Season ${seasons.length + 1}`, 
      seasonNumber: seasons.length + 1,
      episodeCount: 0,
      episodes: []
    }]);
  };

  const removeSeason = (index: number) => {
    const updatedSeasons = [...seasons];
    updatedSeasons.splice(index, 1);
    setSeasons(updatedSeasons);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Process seasons data to ensure proper structure
      const processedSeasons = seasons.map((season, index) => ({
        ...season,
        id: season.id || `season-${index}`,
        episodes: (season.episodes || []).map((episode, episodeIndex) => ({
          id: episode.id || `episode-${index}-${episodeIndex}`,
          title: episode.title || `Episode ${episodeIndex + 1}`,
          overview: episode.overview || '',
          episodeNumber: episode.episodeNumber || episodeIndex + 1,
          stillPath: episode.stillPath || '',
          airDate: episode.airDate || '',
          duration: episode.duration || '',
          rating: episode.rating || 0
        }))
      }));

      const contentData: Partial<Content> = {
        id: content?.id || crypto.randomUUID(),
        title,
        overview,
        posterPath,
        backdropPath,
        releaseDate,
        type: type as 'movie' | 'tv',
        genres,
        rating: parseFloat(rating) || 0,
        trailerUrl,
        duration,
        status,
        watchProviders: watchProviders.map(provider => ({
          ...provider,
          id: provider.id || crypto.randomUUID()
        })),
        cast: cast.map(member => ({
          ...member,
          id: member.id || crypto.randomUUID()
        })),
        seasons: type === 'tv' ? processedSeasons : [],
        images: images.map(image => ({
          path: image.path,
          type: image.type
        })),
        embedVideos: embedVideos.map(video => ({
          url: video.url,
          title: video.title
        }))
      };

      console.log('Saving content with processed data:', {
        title: contentData.title,
        type: contentData.type,
        seasonsCount: contentData.seasons?.length || 0,
        episodesCount: contentData.seasons?.reduce((total, season) => total + (season.episodes?.length || 0), 0) || 0
      });

      await onSave(contentData);

      toast.success(content ? 'Content updated successfully!' : 'Content created successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{content ? 'Edit Content' : 'Create Content'}</CardTitle>
          <CardDescription>Enter the details for the content.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="overview">Overview</Label>
            <Textarea id="overview" value={overview} onChange={(e) => setOverview(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="posterPath">Poster Path</Label>
              <Input id="posterPath" value={posterPath} onChange={(e) => setPosterPath(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="backdropPath">Backdrop Path</Label>
              <Input id="backdropPath" value={backdropPath} onChange={(e) => setBackdropPath(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="releaseDate">Release Date</Label>
              <Input
                type="date"
                id="releaseDate"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="movie">Movie</SelectItem>
                  <SelectItem value="tv">TV Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                type="number"
                id="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trailerUrl">Trailer URL</Label>
            <Input id="trailerUrl" value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Input id="status" value={status} onChange={(e) => setStatus(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Genres</Label>
            <div className="flex flex-wrap gap-2">
              {['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Thriller', 'Romance'].map((genre) => (
                <div key={genre} className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    id={`genre-${genre}`}
                    value={genre}
                    checked={genres.includes(genre)}
                    onChange={handleGenreChange}
                  />
                  <Label htmlFor={`genre-${genre}`}>{genre}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Watch Providers</CardTitle>
          <CardDescription>Add or edit watch providers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {watchProviders.map((provider, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor={`provider-name-${index}`}>Name</Label>
                  <Input
                    id={`provider-name-${index}`}
                    value={provider.name}
                    onChange={(e) => handleWatchProviderChange(index, 'name', e.target.value)}
                  />
                </div>
                <div className="grid gap-2 flex-1">
                  <Label htmlFor={`provider-logo-${index}`}>Logo Path</Label>
                  <Input
                    id={`provider-logo-${index}`}
                    value={provider.logoPath}
                    onChange={(e) => handleWatchProviderChange(index, 'logoPath', e.target.value)}
                  />
                </div>
                <div className="grid gap-2 flex-1">
                  <Label htmlFor={`provider-url-${index}`}>URL</Label>
                  <Input
                    id={`provider-url-${index}`}
                    value={provider.url}
                    onChange={(e) => handleWatchProviderChange(index, 'url', e.target.value)}
                  />
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => removeWatchProvider(index)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addWatchProvider}>
              <Plus className="h-4 w-4 mr-2" />
              Add Watch Provider
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cast</CardTitle>
          <CardDescription>Add or edit cast members.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {cast.map((member, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor={`cast-name-${index}`}>Name</Label>
                  <Input
                    id={`cast-name-${index}`}
                    value={member.name}
                    onChange={(e) => handleCastChange(index, 'name', e.target.value)}
                  />
                </div>
                <div className="grid gap-2 flex-1">
                  <Label htmlFor={`cast-character-${index}`}>Character</Label>
                  <Input
                    id={`cast-character-${index}`}
                    value={member.character}
                    onChange={(e) => handleCastChange(index, 'character', e.target.value)}
                  />
                </div>
                <div className="grid gap-2 flex-1">
                  <Label htmlFor={`cast-profile-${index}`}>Profile Path</Label>
                  <Input
                    id={`cast-profile-${index}`}
                    value={member.profilePath || ''}
                    onChange={(e) => handleCastChange(index, 'profilePath', e.target.value)}
                  />
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => removeCastMember(index)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addCastMember}>
              <Plus className="h-4 w-4 mr-2" />
              Add Cast Member
            </Button>
          </div>
        </CardContent>
      </Card>

      {type === 'tv' && (
        <Card>
          <CardHeader>
            <CardTitle>Seasons</CardTitle>
            <CardDescription>Add or edit seasons and episodes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {seasons.map((season, seasonIndex) => (
                <div key={seasonIndex} className="border p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Season {seasonIndex + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="grid gap-2">
                      <Label htmlFor={`season-name-${seasonIndex}`}>Name</Label>
                      <Input
                        id={`season-name-${seasonIndex}`}
                        value={season.name}
                        onChange={(e) => handleSeasonChange(seasonIndex, 'name', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`season-episode-count-${seasonIndex}`}>Episode Count</Label>
                      <Input
                        type="number"
                        id={`season-episode-count-${seasonIndex}`}
                        value={season.episodeCount}
                        onChange={(e) => handleSeasonChange(seasonIndex, 'episodeCount', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`season-air-date-${seasonIndex}`}>Air Date</Label>
                      <Input
                        type="date"
                        id={`season-air-date-${seasonIndex}`}
                        value={season.airDate || ''}
                        onChange={(e) => handleSeasonChange(seasonIndex, 'airDate', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`season-poster-path-${seasonIndex}`}>Poster Path</Label>
                      <Input
                        id={`season-poster-path-${seasonIndex}`}
                        value={season.posterPath || ''}
                        onChange={(e) => handleSeasonChange(seasonIndex, 'posterPath', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 mb-4">
                    <Label htmlFor={`season-overview-${seasonIndex}`}>Overview</Label>
                    <Textarea
                      id={`season-overview-${seasonIndex}`}
                      value={season.overview || ''}
                      onChange={(e) => handleSeasonChange(seasonIndex, 'overview', e.target.value)}
                    />
                  </div>
                  <h4 className="text-md font-semibold mb-2">Episodes</h4>
                  <div className="space-y-2">
                    {(season.episodes || []).map((episode, episodeIndex) => (
                      <div key={episodeIndex} className="border p-2 rounded-md">
                        <h5 className="text-sm font-medium mb-1">Episode {episodeIndex + 1}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="grid gap-1">
                            <Label htmlFor={`episode-title-${seasonIndex}-${episodeIndex}`}>Title</Label>
                            <Input
                              id={`episode-title-${seasonIndex}-${episodeIndex}`}
                              value={episode.title}
                              onChange={(e) =>
                                handleEpisodeChange(seasonIndex, episodeIndex, 'title', e.target.value)
                              }
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label htmlFor={`episode-number-${seasonIndex}-${episodeIndex}`}>Episode Number</Label>
                            <Input
                              type="number"
                              id={`episode-number-${seasonIndex}-${episodeIndex}`}
                              value={episode.episodeNumber}
                              onChange={(e) =>
                                handleEpisodeChange(seasonIndex, episodeIndex, 'episodeNumber', parseInt(e.target.value))
                              }
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label htmlFor={`episode-air-date-${seasonIndex}-${episodeIndex}`}>Air Date</Label>
                            <Input
                              type="date"
                              id={`episode-air-date-${seasonIndex}-${episodeIndex}`}
                              value={episode.airDate || ''}
                              onChange={(e) =>
                                handleEpisodeChange(seasonIndex, episodeIndex, 'airDate', e.target.value)
                              }
                            />
                          </div>
                           <div className="grid gap-1">
                            <Label htmlFor={`episode-still-path-${seasonIndex}-${episodeIndex}`}>Still Path</Label>
                            <Input
                              id={`episode-still-path-${seasonIndex}-${episodeIndex}`}
                              value={episode.stillPath || ''}
                              onChange={(e) =>
                                handleEpisodeChange(seasonIndex, episodeIndex, 'stillPath', e.target.value)
                              }
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label htmlFor={`episode-duration-${seasonIndex}-${episodeIndex}`}>Duration</Label>
                            <Input
                              id={`episode-duration-${seasonIndex}-${episodeIndex}`}
                              value={episode.duration || ''}
                              onChange={(e) =>
                                handleEpisodeChange(seasonIndex, episodeIndex, 'duration', e.target.value)
                              }
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label htmlFor={`episode-rating-${seasonIndex}-${episodeIndex}`}>Rating</Label>
                            <Input
                              type="number"
                              id={`episode-rating-${seasonIndex}-${episodeIndex}`}
                              value={episode.rating}
                              onChange={(e) =>
                                handleEpisodeChange(seasonIndex, episodeIndex, 'rating', parseFloat(e.target.value))
                              }
                            />
                          </div>
                        </div>
                        <div className="grid gap-1">
                          <Label htmlFor={`episode-overview-${seasonIndex}-${episodeIndex}`}>Overview</Label>
                          <Textarea
                            id={`episode-overview-${seasonIndex}-${episodeIndex}`}
                            value={episode.overview}
                            onChange={(e) =>
                              handleEpisodeChange(seasonIndex, episodeIndex, 'overview', e.target.value)
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeEpisode(seasonIndex, episodeIndex)}
                        >
                          Remove Episode
                        </Button>
                      </div>
                    ))}
                    <Button type="button" size="sm" onClick={() => addEpisode(seasonIndex)}>
                      Add Episode
                    </Button>
                  </div>
                  <Button type="button" variant="destructive" onClick={() => removeSeason(seasonIndex)}>
                    Remove Season
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={addSeason}>
                Add Season
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default AdminContentForm;
