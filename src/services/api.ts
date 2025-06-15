import { supabase } from '@/types/supabase-extensions';
import { Content, Category, Season, CastMember, WatchProvider } from '@/types';

// Helper function to safely parse JSON data to typed arrays
const parseJsonArray = <T>(data: any, fallback: T[] = []): T[] => {
  if (!data) return fallback;
  if (Array.isArray(data)) return data as T[];
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

// Helper function to safely parse embed videos
const parseEmbedVideos = (data: any): { url: string; title: string; }[] => {
  return parseJsonArray<{ url: string; title: string; }>(data, []);
};

// Helper function to safely parse images
const parseImages = (data: any): { path: string; type: 'poster' | 'backdrop'; }[] => {
  return parseJsonArray<{ path: string; type: 'poster' | 'backdrop'; }>(data, []);
};

// Helper function to safely parse watch providers
const parseWatchProviders = (data: any): WatchProvider[] => {
  return parseJsonArray<WatchProvider>(data, []);
};

// Helper function to safely parse seasons
const parseSeasons = (data: any): Season[] => {
  return parseJsonArray<Season>(data, []);
};

// Helper function to safely parse cast members
const parseCastMembers = (data: any): CastMember[] => {
  return parseJsonArray<CastMember>(data, []);
};

// Get all content
export const getAllContent = async (): Promise<Content[]> => {
  try {
    const { data, error } = await supabase
      .from('contents')
      .select('*');

    if (error) {
      console.error('Error fetching content:', error);
      throw new Error(`Failed to fetch content: ${error.message}`);
    }

    if (!data) return [];

    // Convert database fields to Content interface
    const contents: Content[] = data.map(item => ({
      id: item.id,
      title: item.title || 'Untitled',
      overview: item.overview || 'No overview available',
      posterPath: item.poster_path || '',
      backdropPath: item.backdrop_path,
      releaseDate: item.release_date,
      type: item.type === 'movie' ? 'movie' : 'tv',
      genres: Array.isArray(item.genres) ? item.genres : [],
      rating: Number(item.rating) || 0,
      duration: item.duration,
      status: item.status || 'Unknown',
      trailerUrl: item.trailer_url,
      watchProviders: parseWatchProviders(item.watch_providers),
      seasons: parseSeasons(item.seasons),
      cast: parseCastMembers(item.cast_info),
      embedVideos: parseEmbedVideos(item.embed_videos),
      images: parseImages(item.images),
    }));

    return contents;
  } catch (error) {
    console.error('Error in getAllContent:', error);
    throw error;
  }
};

// Add a new content item
export const addContent = async (content: Content): Promise<Content> => {
  try {
    const { data, error } = await supabase
      .from('contents')
      .insert({
        id: content.id,
        title: content.title,
        overview: content.overview,
        poster_path: content.posterPath,
        backdrop_path: content.backdropPath,
        release_date: content.releaseDate,
        type: content.type,
        genres: content.genres,
        rating: content.rating,
        duration: content.duration,
        status: content.status,
        trailer_url: content.trailerUrl,
        embed_videos: JSON.stringify(content.embedVideos || []),
        images: JSON.stringify(content.images || []),
        watch_providers: JSON.stringify(content.watchProviders || []),
        seasons: JSON.stringify(content.seasons || []),
        cast_info: JSON.stringify(content.cast || []),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding content:', error);
      throw new Error(`Failed to add content: ${error.message}`);
    }

    // Convert database fields to Content interface
    return {
      id: data.id,
      title: data.title,
      overview: data.overview,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      releaseDate: data.release_date,
      type: data.type === 'movie' ? 'movie' : 'tv',
      genres: data.genres || [],
      rating: data.rating || 0,
      duration: data.duration,
      status: data.status,
      trailerUrl: data.trailer_url,
      watchProviders: parseWatchProviders(data.watch_providers),
      seasons: parseSeasons(data.seasons),
      cast: parseCastMembers(data.cast_info),
      embedVideos: parseEmbedVideos(data.embed_videos),
      images: parseImages(data.images),
    };
  } catch (error) {
    console.error('Error in addContent:', error);
    throw error;
  }
};

// Update a content item
export const updateContent = async (content: Content): Promise<Content> => {
  try {
    console.log("Updating content with ID:", content.id, "Watch providers:", content.watchProviders);
    
    const { data, error } = await supabase
      .from('contents')
      .update({
        title: content.title,
        overview: content.overview,
        poster_path: content.posterPath,
        backdrop_path: content.backdropPath,
        release_date: content.releaseDate,
        type: content.type,
        genres: content.genres,
        rating: content.rating,
        duration: content.duration,
        status: content.status,
        trailer_url: content.trailerUrl,
        embed_videos: JSON.stringify(content.embedVideos || []),
        images: JSON.stringify(content.images || []),
        watch_providers: JSON.stringify(content.watchProviders || []),
        seasons: JSON.stringify(content.seasons || []),
        cast_info: JSON.stringify(content.cast || []),
        updated_at: new Date().toISOString()
      })
      .eq('id', content.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content:', error);
      throw new Error(`Failed to update content: ${error.message}`);
    }

    console.log("Content updated successfully in database");
    
    // Format the data for return
    return {
      id: data.id,
      title: data.title,
      overview: data.overview,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      releaseDate: data.release_date,
      type: data.type === 'movie' ? 'movie' : 'tv',
      genres: data.genres || [],
      rating: data.rating || 0,
      duration: data.duration,
      status: data.status,
      trailerUrl: data.trailer_url,
      watchProviders: parseWatchProviders(data.watch_providers),
      embedVideos: parseEmbedVideos(data.embed_videos),
      images: parseImages(data.images),
      seasons: parseSeasons(data.seasons),
      cast: parseCastMembers(data.cast_info),
    };
  } catch (error) {
    console.error('Error in updateContent:', error);
    throw error;
  }
};

// Delete a content item
export const deleteContent = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('contents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting content:', error);
      throw new Error(`Failed to delete content: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteContent:', error);
    throw error;
  }
};

// Get content by ID with improved error handling
export const getContentById = async (id: string): Promise<Content | null> => {
  try {
    if (!id || typeof id !== 'string') {
      console.error('Invalid content ID provided:', id);
      return null;
    }

    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching content by ID:', error);
      return null;
    }

    if (!data) {
      console.warn('No content found with ID:', id);
      return null;
    }

    // Convert database fields to Content interface with validation
    const content: Content = {
      id: data.id,
      title: data.title || 'Untitled',
      overview: data.overview || 'No overview available',
      posterPath: data.poster_path || '',
      backdropPath: data.backdrop_path,
      releaseDate: data.release_date,
      type: data.type === 'movie' ? 'movie' : 'tv',
      genres: Array.isArray(data.genres) ? data.genres : [],
      rating: Number(data.rating) || 0,
      duration: data.duration,
      status: data.status || 'Unknown',
      trailerUrl: data.trailer_url,
      seasons: parseSeasons(data.seasons),
      cast: parseCastMembers(data.cast_info),
      watchProviders: parseWatchProviders(data.watch_providers),
      embedVideos: parseEmbedVideos(data.embed_videos),
      images: parseImages(data.images),
    };

    console.log("Successfully fetched content by ID:", content.title);
    return content;
  } catch (error) {
    console.error('Error in getContentById:', error);
    return null;
  }
};

// Get content by type (movie, tv, or all)
export const getContentByType = async (type: 'movie' | 'tv' | 'all'): Promise<Content[]> => {
  try {
    let query = supabase.from('contents').select('*');
    
    // Filter by type if not 'all'
    if (type !== 'all') {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching ${type} content:`, error);
      throw error;
    }

    // Convert database fields to Content interface
    const contents: Content[] = data.map(item => ({
      id: item.id,
      title: item.title,
      overview: item.overview,
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      releaseDate: item.release_date,
      // Ensure type is 'movie' or 'tv' as required by Content interface
      type: item.type === 'movie' ? 'movie' : 'tv',
      genres: item.genres || [],
      rating: item.rating || 0,
      duration: item.duration,
      status: item.status,
      trailerUrl: item.trailer_url,
      watchProviders: parseWatchProviders(item.watch_providers),
      seasons: parseSeasons(item.seasons),
      cast: parseCastMembers(item.cast_info),
      embedVideos: parseEmbedVideos(item.embed_videos),
      images: parseImages(item.images),
    }));

    return contents;
  } catch (error) {
    console.error(`Error in getContentByType:`, error);
    throw error;
  }
};

// Get categories with their content
export const getCategories = async (): Promise<Category[]> => {
  try {
    // First, get all categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw categoriesError;
    }

    // Then, get category_contents join table
    const { data: categoryContentsData, error: categoryContentsError } = await supabase
      .from('category_contents')
      .select('*');

    if (categoryContentsError) {
      console.error('Error fetching category contents:', categoryContentsError);
      throw categoryContentsError;
    }

    // Finally, get all content
    const contents = await getAllContent();

    // Now map categories with their content
    const categories: Category[] = categoriesData.map(category => {
      // Find all content IDs for this category
      const contentIds = categoryContentsData
        .filter(cc => cc.category_id === category.id)
        .map(cc => cc.content_id);
      
      // Find the actual content items
      const categoryContents = contents.filter(content => contentIds.includes(content.id));
      
      return {
        id: category.id,
        name: category.name,
        contents: categoryContents
      };
    });

    return categories;
  } catch (error) {
    console.error('Error in getCategories:', error);
    throw error;
  }
};

// Search content by query
export const searchContent = async (query: string): Promise<Content[]> => {
  try {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .or(`title.ilike.%${query}%,overview.ilike.%${query}%`);

    if (error) {
      console.error('Error searching content:', error);
      throw error;
    }

    // Convert database fields to Content interface
    const contents: Content[] = data.map(item => ({
      id: item.id,
      title: item.title,
      overview: item.overview,
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      releaseDate: item.release_date,
      // Ensure type is 'movie' or 'tv' as required by Content interface
      type: item.type === 'movie' ? 'movie' : 'tv',
      genres: item.genres || [],
      rating: item.rating || 0,
      duration: item.duration,
      status: item.status,
      trailerUrl: item.trailer_url,
      watchProviders: parseWatchProviders(item.watch_providers),
      seasons: parseSeasons(item.seasons),
      cast: parseCastMembers(item.cast_info),
      embedVideos: parseEmbedVideos(item.embed_videos),
      images: parseImages(item.images),
    }));

    return contents;
  } catch (error) {
    console.error('Error in searchContent:', error);
    throw error;
  }
};

// TMDB API configuration
const TMDB_API_KEY = 'bc7e2dc86a85f194da52360ed092f9cc'; // Your actual TMDB API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

// Enhanced TMDB import with real API integration
export const importFromTmdb = async (id: string, type: 'movie' | 'tv'): Promise<Content | null> => {
  try {
    if (!id || !id.trim()) {
      throw new Error('TMDB ID is required');
    }

    if (type !== 'movie' && type !== 'tv') {
      throw new Error('Content type must be either "movie" or "tv"');
    }

    console.log(`Importing ${type} with ID ${id} from TMDB`);
    
    // Try real TMDB API call
    try {
      const detailsResponse = await fetch(
        `${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,images,watch/providers`
      );
      
      if (detailsResponse.ok) {
        const realApiData = await detailsResponse.json();
        
        if (realApiData && !realApiData.success === false) {
          console.log('Successfully fetched from real TMDB API');
          
          // Process real TMDB data
          const genres = realApiData.genres?.map((g: any) => g.name) || [];
          
          const cast: CastMember[] = realApiData.credits?.cast?.slice(0, 10).map((person: any) => ({
            id: person.id.toString(),
            name: person.name,
            character: person.character,
            profilePath: person.profile_path ? `${IMAGE_BASE_URL}${person.profile_path}` : undefined
          })) || [];
          
          const images: { path: string; type: 'poster' | 'backdrop' }[] = [];
          
          if (realApiData.poster_path) {
            images.push({
              path: `${IMAGE_BASE_URL}${realApiData.poster_path}`,
              type: 'poster'
            });
          }
          
          if (realApiData.backdrop_path) {
            images.push({
              path: `${BACKDROP_BASE_URL}${realApiData.backdrop_path}`,
              type: 'backdrop'
            });
          }
          
          // Process watch providers
          const watchProviders: WatchProvider[] = [];
          const providers = realApiData['watch/providers']?.results?.US;
          
          if (providers?.flatrate) {
            providers.flatrate.forEach((provider: any) => {
              watchProviders.push({
                id: provider.provider_id.toString(),
                name: provider.provider_name,
                logoPath: `${IMAGE_BASE_URL}${provider.logo_path}`,
                url: `https://www.${provider.provider_name.toLowerCase().replace(/\s+/g, '')}.com`,
                redirectLink: generateDeepLink(provider.provider_name, id, type)
              });
            });
          }
          
          const trailer = realApiData.videos?.results?.find((video: any) => 
            video.type === 'Trailer' && video.site === 'YouTube'
          );
          const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined;
          
          const seasons: Season[] = [];
          if (type === 'tv' && realApiData.seasons) {
            realApiData.seasons.forEach((season: any) => {
              if (season.season_number > 0) {
                seasons.push({
                  id: `${id}-s${season.season_number}`,
                  name: season.name,
                  seasonNumber: season.season_number,
                  episodeCount: season.episode_count,
                  posterPath: season.poster_path ? `${IMAGE_BASE_URL}${season.poster_path}` : undefined,
                  airDate: season.air_date,
                  overview: season.overview,
                  episodes: []
                });
              }
            });
          }
          
          const releaseDate = type === 'movie' ? realApiData.release_date : realApiData.first_air_date;
          
          let duration: string | undefined;
          if (type === 'movie' && realApiData.runtime) {
            const hours = Math.floor(realApiData.runtime / 60);
            const minutes = realApiData.runtime % 60;
            duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
          }
          
          const content: Content = {
            id: `tmdb-${id}-${type}`,
            title: type === 'movie' ? realApiData.title : realApiData.name,
            overview: realApiData.overview || 'No overview available.',
            posterPath: realApiData.poster_path ? `${IMAGE_BASE_URL}${realApiData.poster_path}` : '',
            backdropPath: realApiData.backdrop_path ? `${BACKDROP_BASE_URL}${realApiData.backdrop_path}` : undefined,
            releaseDate: releaseDate,
            type: type,
            genres: genres,
            rating: Number(realApiData.vote_average) || 0,
            duration: duration,
            status: realApiData.status || 'Released',
            trailerUrl: trailerUrl,
            watchProviders: watchProviders,
            seasons: seasons,
            cast: cast,
            embedVideos: trailer ? [{
              url: trailerUrl!,
              title: 'Official Trailer'
            }] : [],
            images: images
          };
          
          console.log(`Successfully imported real data for "${content.title}" with ${watchProviders.length} watch providers`);
          return content;
        }
      }
    } catch (apiError) {
      console.log('TMDB API call failed:', apiError);
    }
    
    // Fallback to enhanced mock data only if real API fails
    console.log('Using enhanced mock data for TMDB import');
    
    const mockContents: Record<string, Partial<Content>> = {
      '550': {
        title: 'Fight Club',
        overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
        rating: 8.4,
        genres: ['Drama', 'Thriller'],
        releaseDate: '1999-10-15',
        duration: '2h 19m'
      },
      '238': {
        title: 'The Godfather',
        overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.',
        rating: 9.2,
        genres: ['Crime', 'Drama'],
        releaseDate: '1972-03-14',
        duration: '2h 55m'
      },
      '1399': {
        title: 'Game of Thrones',
        overview: 'Seven noble families fight for control of the mythical land of Westeros.',
        rating: 9.3,
        genres: ['Drama', 'Fantasy', 'Action & Adventure'],
        releaseDate: '2011-04-17',
        duration: undefined
      },
      '2734': {
        title: 'The Matrix Reloaded',
        overview: 'Neo and his allies race against time before the machines discover the city of Zion and destroy it.',
        rating: 7.2,
        genres: ['Action', 'Science Fiction'],
        releaseDate: '2003-05-15',
        duration: '2h 18m'
      }
    };

    const allWatchProviders: WatchProvider[] = [
      {
        id: 'netflix',
        name: 'Netflix',
        logoPath: 'https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg',
        url: 'https://www.netflix.com',
        redirectLink: `netflix://title/${id}`
      },
      {
        id: 'amazon-prime',
        name: 'Amazon Prime Video',
        logoPath: 'https://image.tmdb.org/t/p/original/68MNrwlkpF7WnmNPXLah69CR5cb.jpg',
        url: 'https://www.primevideo.com',
        redirectLink: `https://app.primevideo.com/detail?gti=${id}`
      },
      {
        id: 'hulu',
        name: 'Hulu',
        logoPath: 'https://image.tmdb.org/t/p/original/pqzjCxPVc9TkVgGRWeAoMmyqkZV.jpg',
        url: 'https://www.hulu.com',
        redirectLink: `https://www.hulu.com/movie/${id}`
      },
      {
        id: 'disney-plus',
        name: 'Disney+',
        logoPath: 'https://image.tmdb.org/t/p/original/7Fl8ylPDclt3ZYgNbW2t7rbZE9I.jpg',
        url: 'https://www.disneyplus.com',
        redirectLink: `https://www.disneyplus.com/movies/${id}`
      }
    ];

    const numProviders = Math.floor(Math.random() * 3) + 1;
    const selectedProviders = allWatchProviders
      .sort(() => Math.random() - 0.5)
      .slice(0, numProviders);

    const specificContent = mockContents[id] || {};
    
    const mockContent: Content = {
      id: `tmdb-${id}-${type}`,
      title: specificContent.title || `Enhanced ${type === 'movie' ? 'Movie' : 'TV Show'} ${id}`,
      overview: specificContent.overview || `This is enhanced mock data for ${type} with ID ${id}. To get real content data, please configure a valid TMDB API key.`,
      posterPath: `https://image.tmdb.org/t/p/w500/sample-poster-${id}.jpg`,
      backdropPath: `https://image.tmdb.org/t/p/original/sample-backdrop-${id}.jpg`,
      releaseDate: specificContent.releaseDate || new Date().toISOString().split('T')[0],
      type: type,
      genres: specificContent.genres || ['Drama', 'Action'],
      rating: specificContent.rating || (7 + Math.random() * 2),
      duration: type === 'movie' ? (specificContent.duration || `${90 + Math.floor(Math.random() * 60)}m`) : undefined,
      status: 'Released',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      watchProviders: selectedProviders,
      seasons: type === 'tv' ? [
        {
          id: `s1-${id}`,
          name: 'Season 1',
          seasonNumber: 1,
          episodeCount: 10,
          overview: 'First season overview',
          episodes: []
        }
      ] : [],
      cast: [
        {
          id: `cast1-${id}`,
          name: 'Enhanced Actor',
          character: 'Main Character',
          profilePath: `https://image.tmdb.org/t/p/w185/sample-profile-${id}.jpg`
        }
      ],
      embedVideos: [
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          title: 'Official Trailer'
        }
      ],
      images: [
        {
          path: `https://image.tmdb.org/t/p/w500/sample-poster-${id}.jpg`,
          type: 'poster'
        },
        {
          path: `https://image.tmdb.org/t/p/original/sample-backdrop-${id}.jpg`,
          type: 'backdrop'
        }
      ]
    };
    
    return mockContent;
    
  } catch (error) {
    console.error('Error importing from TMDB:', error);
    throw new Error(`Failed to import content from TMDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function to generate deep links for streaming services
function generateDeepLink(providerName: string, contentId: string, type: 'movie' | 'tv'): string {
  const provider = providerName.toLowerCase();
  
  switch (provider) {
    case 'netflix':
      return `netflix://title/${contentId}`;
    case 'amazon prime video':
    case 'prime video':
      return `https://app.primevideo.com/detail?gti=${contentId}`;
    case 'disney+':
    case 'disney plus':
      return `disneyplus://content/${type}s/${contentId}`;
    case 'hulu':
      return `https://www.hulu.com/${type}/${contentId}`;
    case 'hbo max':
    case 'max':
      return `https://www.max.com/${type}s/${contentId}`;
    case 'apple tv+':
      return `https://tv.apple.com/${type}/${contentId}`;
    default:
      return `https://www.${provider.replace(/\s+/g, '')}.com`;
  }
}
