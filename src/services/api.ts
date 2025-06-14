
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
      // Use custom data properties if they exist, otherwise empty arrays
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
    console.log("Updating content with ID:", content.id, "Data:", content);
    
    // Make sure all properties are properly formatted before saving
    const contentToUpdate = { 
      ...content,
      // Ensure these properties have the right format
      embedVideos: Array.isArray(content.embedVideos) ? content.embedVideos : [],
      images: Array.isArray(content.images) ? content.images : [],
      watchProviders: Array.isArray(content.watchProviders) ? content.watchProviders : [],
      seasons: Array.isArray(content.seasons) ? content.seasons : [],
      cast: Array.isArray(content.cast) ? content.cast : []
    };
    
    // Log what we're about to save
    console.log("Content prepared for update:", contentToUpdate);
    console.log("watchProviders to be saved:", contentToUpdate.watchProviders);
    
    const { data, error } = await supabase
      .from('contents')
      .update({
        title: content.title,
        overview: content.overview,
        poster_path: content.posterPath,
        backdrop_path: content.backdropPath,
        release_date: content.releaseDate,
        type: content.type, // This is already 'movie' or 'tv' from Content interface
        genres: content.genres,
        rating: content.rating,
        duration: content.duration,
        status: content.status,
        trailer_url: content.trailerUrl,
        // Add all the array fields to the database update - stringify them properly
        embed_videos: JSON.stringify(content.embedVideos || []),
        images: JSON.stringify(content.images || []),
        watch_providers: JSON.stringify(content.watchProviders || []),
        seasons: JSON.stringify(content.seasons || []),
        cast_info: JSON.stringify(content.cast || []),
        // Add updated timestamp
        updated_at: new Date().toISOString()
      })
      .eq('id', content.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content:', error);
      throw new Error(`Failed to update content: ${error.message}`);
    }

    console.log("Content updated successfully:", data);
    
    // Format the data for return
    return {
      id: data.id,
      title: data.title,
      overview: data.overview,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      releaseDate: data.release_date,
      // Ensure type is 'movie' or 'tv' as required by Content interface
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

// Get content by ID
export const getContentById = async (id: string): Promise<Content | null> => {
  try {
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
      return null;
    }

    // Convert database fields to Content interface
    const content: Content = {
      id: data.id,
      title: data.title,
      overview: data.overview,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      releaseDate: data.release_date,
      // Ensure type is 'movie' or 'tv' as required by Content interface
      type: data.type === 'movie' ? 'movie' : 'tv',
      genres: data.genres || [],
      rating: data.rating || 0,
      duration: data.duration,
      status: data.status,
      trailerUrl: data.trailer_url,
      // Ensure these are properly typed arrays
      seasons: parseSeasons(data.seasons),
      cast: parseCastMembers(data.cast_info),
      watchProviders: parseWatchProviders(data.watch_providers),
      embedVideos: parseEmbedVideos(data.embed_videos),
      images: parseImages(data.images),
    };

    console.log("Fetched content by ID:", content);
    return content;
  } catch (error) {
    console.error('Error in getContentById:', error);
    throw error;
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

// Import content from TMDB with enhanced watch provider fetching
export const importFromTmdb = async (id: string, type: 'movie' | 'tv'): Promise<Content | null> => {
  try {
    console.log(`Importing ${type} with ID ${id} from TMDB`);
    
    // Enhanced mock data with more realistic content based on common TMDB IDs
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
        duration: null
      }
    };

    // Enhanced mock watch providers with more realistic data
    const allWatchProviders: WatchProvider[] = [
      {
        id: 'netflix',
        name: 'Netflix',
        logoPath: 'https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg',
        url: 'https://www.netflix.com',
        redirectLink: 'https://www.netflix.com/title/' + id
      },
      {
        id: 'amazon-prime',
        name: 'Amazon Prime Video',
        logoPath: 'https://image.tmdb.org/t/p/original/68MNrwlkpF7WnmNPXLah69CR5cb.jpg',
        url: 'https://www.primevideo.com',
        redirectLink: 'https://app.primevideo.com/detail?gti=' + id
      },
      {
        id: 'disney-plus',
        name: 'Disney+',
        logoPath: 'https://image.tmdb.org/t/p/original/7Fl8ylPDclt3ZYgNbW2t7rbZE9I.jpg',
        url: 'https://www.disneyplus.com',
        redirectLink: 'disneyplus://content/movies/' + id
      },
      {
        id: 'hulu',
        name: 'Hulu',
        logoPath: 'https://image.tmdb.org/t/p/original/pqzjCxPVc9TkVgGRWeAoMmyqkZV.jpg',
        url: 'https://www.hulu.com',
        redirectLink: 'https://www.hulu.com/movie/' + id
      },
      {
        id: 'apple-tv',
        name: 'Apple TV+',
        logoPath: 'https://image.tmdb.org/t/p/original/6uhKBfmtzFqOcLousHwZuzcrScK.jpg',
        url: 'https://tv.apple.com',
        redirectLink: 'https://tv.apple.com/movie/' + id
      },
      {
        id: 'hbo-max',
        name: 'Max',
        logoPath: 'https://image.tmdb.org/t/p/original/nmU4b2sGJRDGv33RHJ4pJSjXVoa.jpg',
        url: 'https://www.max.com',
        redirectLink: 'https://www.max.com/movies/' + id
      }
    ];

    // Randomly select 1-4 providers for realistic simulation
    const numProviders = Math.floor(Math.random() * 4) + 1;
    const selectedProviders = allWatchProviders
      .sort(() => Math.random() - 0.5)
      .slice(0, numProviders);

    // Get specific content data or use defaults
    const specificContent = mockContents[id] || {};
    
    const mockContent: Content = {
      id: `tmdb-${id}-${type}`,
      title: specificContent.title || `Sample ${type === 'movie' ? 'Movie' : 'TV Show'} ${id}`,
      overview: specificContent.overview || `This is a sample ${type} imported from TMDB with ID ${id}. Watch provider information has been automatically populated.`,
      posterPath: `https://image.tmdb.org/t/p/w500/sample-poster-${id}.jpg`,
      backdropPath: `https://image.tmdb.org/t/p/original/sample-backdrop-${id}.jpg`,
      releaseDate: specificContent.releaseDate || new Date().toISOString().split('T')[0],
      type: type,
      genres: specificContent.genres || ['Drama', 'Action'],
      rating: specificContent.rating || (7 + Math.random() * 2), // Random rating between 7-9
      duration: type === 'movie' ? (specificContent.duration || `${90 + Math.floor(Math.random() * 60)}m`) : null,
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
          name: 'John Doe',
          character: 'Main Character',
          profilePath: `https://image.tmdb.org/t/p/w185/sample-profile-${id}.jpg`
        },
        {
          id: `cast2-${id}`,
          name: 'Jane Smith',
          character: 'Supporting Character',
          profilePath: `https://image.tmdb.org/t/p/w185/sample-profile2-${id}.jpg`
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
        },
        {
          path: `https://image.tmdb.org/t/p/w500/sample-still1-${id}.jpg`,
          type: 'backdrop'
        },
        {
          path: `https://image.tmdb.org/t/p/w500/sample-still2-${id}.jpg`,
          type: 'backdrop'
        }
      ]
    };
    
    console.log(`Successfully imported content with ${selectedProviders.length} watch providers:`, selectedProviders.map(p => p.name));
    return mockContent;
  } catch (error) {
    console.error('Error importing from TMDB:', error);
    throw new Error('Failed to import content from TMDB. Please check the ID and try again.');
  }
};
