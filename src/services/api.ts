import { supabase } from '@/types/supabase-extensions';
import { Content, CastMember, WatchProvider, Episode, Category } from '@/types';

// Helper function to safely parse JSON arrays from the database
function parseJsonArray<T>(jsonValue: any): T[] {
  if (!jsonValue) {
    return [];
  }
  try {
    // Handle case where jsonValue is already an array
    if (Array.isArray(jsonValue)) {
      return jsonValue as T[];
    }
    // Handle case where jsonValue is already an object (but not array)
    if (typeof jsonValue === 'object' && jsonValue !== null) {
      return [];
    }
    // Handle string case - parse JSON
    if (typeof jsonValue === 'string') {
      return JSON.parse(jsonValue) as T[];
    }
    // For other types (number, boolean), return empty array
    return [];
  } catch (e) {
    console.error('Error parsing JSON array:', e);
    return [];
  }
}

// Helper function to safely convert Json to string
function jsonToString(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return String(value);
}

export const getContentById = async (id: string): Promise<Content | null> => {
  try {
    console.log('Fetching content by ID:', id);
    
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching content:', error);
      return null;
    }

    if (!data) {
      console.log('No content found for ID:', id);
      return null;
    }

    console.log('Raw content data from DB:', data);

    // Parse the content data
    const content: Content = {
      id: data.id,
      title: data.title,
      overview: data.overview || '',
      posterPath: jsonToString(data.poster_path),
      backdropPath: jsonToString(data.backdrop_path),
      releaseDate: jsonToString(data.release_date),
      rating: Number(data.rating) || 0,
      duration: jsonToString(data.duration),
      type: data.type as 'movie' | 'tv',
      genres: Array.isArray(data.genres) ? data.genres : 
              typeof data.genres === 'string' ? JSON.parse(data.genres) : [],
      trailerUrl: jsonToString(data.trailer_url),
      watchProviders: parseJsonArray(data.watch_providers) as WatchProvider[],
      cast: parseJsonArray(data.cast_info) as CastMember[],
      images: parseJsonArray(data.images) as { path: string; type: 'poster' | 'backdrop' }[],
      embedVideos: parseJsonArray(data.embed_videos) as { url: string; title: string }[],
      seasons: []
    };

    // For TV shows, fetch and parse seasons with episodes
    if (content.type === 'tv' && data.seasons) {
      console.log('Processing TV show seasons:', data.seasons);
      
      const seasonsData = parseJsonArray(data.seasons);
      console.log('Parsed seasons data:', seasonsData);

      content.seasons = seasonsData.map((season: any) => {
        console.log('Processing season:', season);
        
        // Parse episodes if they exist
        let episodes: Episode[] = [];
        if (season.episodes) {
          episodes = parseJsonArray(season.episodes);
        }

        console.log(`Season ${season.seasonNumber} episodes:`, episodes);

        return {
          id: season.id,
          name: season.name,
          seasonNumber: season.seasonNumber,
          episodeCount: season.episodeCount || episodes?.length || 0,
          posterPath: season.posterPath,
          airDate: season.airDate,
          overview: season.overview,
          episodes: episodes.map((episode: any) => ({
            id: episode.id,
            title: episode.title || episode.name,
            episodeNumber: episode.episodeNumber || episode.episode_number,
            overview: episode.overview,
            airDate: episode.airDate || episode.air_date,
            duration: episode.duration || episode.runtime ? `${episode.runtime}min` : undefined,
            rating: episode.rating || episode.vote_average,
            stillPath: episode.stillPath || episode.still_path
          }))
        };
      });
    }

    console.log('Final processed content with seasons:', {
      title: content.title,
      type: content.type,
      seasonsCount: content.seasons?.length || 0,
      firstSeasonEpisodes: content.seasons?.[0]?.episodes?.length || 0
    });

    return content;
  } catch (error) {
    console.error('Error in getContentById:', error);
    return null;
  }
};

export const getTrendingContent = async (type: 'movie' | 'tv', timeWindow: 'day' | 'week' = 'day'): Promise<Content[]> => {
  try {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('type', type)
      .limit(50);

    if (error) {
      console.error('Error fetching trending content:', error);
      return [];
    }

    const contentList: Content[] = data.map((item) => ({
      id: item.id,
      title: item.title,
      overview: item.overview || '',
      posterPath: jsonToString(item.poster_path),
      backdropPath: jsonToString(item.backdrop_path),
      releaseDate: jsonToString(item.release_date),
      rating: Number(item.rating) || 0,
      duration: jsonToString(item.duration),
      type: item.type as 'movie' | 'tv',
      genres: Array.isArray(item.genres) ? item.genres : [],
      trailerUrl: jsonToString(item.trailer_url),
      watchProviders: parseJsonArray(jsonToString(item.watch_providers)) as WatchProvider[],
      cast: parseJsonArray(jsonToString(item.cast_info)) as CastMember[],
      images: parseJsonArray(jsonToString(item.images)) as { path: string; type: 'poster' | 'backdrop' }[],
      embedVideos: parseJsonArray(jsonToString(item.embed_videos)) as { url: string; title: string }[],
      seasons: parseJsonArray(jsonToString(item.seasons)) as any[],
    }));

    return contentList;
  } catch (error) {
    console.error('Error in getTrendingContent:', error);
    return [];
  }
};

export const getAllContent = async (): Promise<Content[]> => {
  try {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all content:', error);
      return [];
    }

    const contentList: Content[] = data.map((item) => ({
      id: item.id,
      title: item.title,
      overview: item.overview || '',
      posterPath: jsonToString(item.poster_path),
      backdropPath: jsonToString(item.backdrop_path),
      releaseDate: jsonToString(item.release_date),
      rating: Number(item.rating) || 0,
      duration: jsonToString(item.duration),
      type: item.type as 'movie' | 'tv',
      genres: Array.isArray(item.genres) ? item.genres : [],
      trailerUrl: jsonToString(item.trailer_url),
      watchProviders: parseJsonArray(jsonToString(item.watch_providers)) as WatchProvider[],
      cast: parseJsonArray(jsonToString(item.cast_info)) as CastMember[],
      images: parseJsonArray(jsonToString(item.images)) as { path: string; type: 'poster' | 'backdrop' }[],
      embedVideos: parseJsonArray(jsonToString(item.embed_videos)) as { url: string; title: string }[],
      seasons: parseJsonArray(jsonToString(item.seasons)) as any[],
    }));

    return contentList;
  } catch (error) {
    console.error('Error in getAllContent:', error);
    return [];
  }
};

export const getContentByType = async (type: 'movie' | 'tv'): Promise<Content[]> => {
  return getTrendingContent(type);
};

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
        trailer_url: content.trailerUrl,
        duration: content.duration,
        status: content.status,
        watch_providers: JSON.stringify(content.watchProviders || []),
        cast_info: JSON.stringify(content.cast || []),
        seasons: JSON.stringify(content.seasons || []),
        images: JSON.stringify(content.images || []),
        embed_videos: JSON.stringify(content.embedVideos || [])
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding content:', error);
      throw error;
    }

    return content;
  } catch (error) {
    console.error('Error in addContent:', error);
    throw error;
  }
};

export const updateContent = async (content: Content): Promise<Content> => {
  try {
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
        trailer_url: content.trailerUrl,
        duration: content.duration,
        status: content.status,
        watch_providers: JSON.stringify(content.watchProviders || []),
        cast_info: JSON.stringify(content.cast || []),
        seasons: JSON.stringify(content.seasons || []),
        images: JSON.stringify(content.images || []),
        embed_videos: JSON.stringify(content.embedVideos || []),
        updated_at: new Date().toISOString()
      })
      .eq('id', content.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content:', error);
      throw error;
    }

    return content;
  } catch (error) {
    console.error('Error in updateContent:', error);
    throw error;
  }
};

export const deleteContent = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('contents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteContent:', error);
    throw error;
  }
};

export const searchContent = async (query: string): Promise<Content[]> => {
  try {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .or(`title.ilike.%${query}%,overview.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error('Error searching content:', error);
      return [];
    }

    const contentList: Content[] = data.map((item) => ({
      id: item.id,
      title: item.title,
      overview: item.overview || '',
      posterPath: jsonToString(item.poster_path),
      backdropPath: jsonToString(item.backdrop_path),
      releaseDate: jsonToString(item.release_date),
      rating: Number(item.rating) || 0,
      duration: jsonToString(item.duration),
      type: item.type as 'movie' | 'tv',
      genres: Array.isArray(item.genres) ? item.genres : [],
      trailerUrl: jsonToString(item.trailer_url),
      watchProviders: parseJsonArray(jsonToString(item.watch_providers)) as WatchProvider[],
      cast: parseJsonArray(jsonToString(item.cast_info)) as CastMember[],
      images: parseJsonArray(jsonToString(item.images)) as { path: string; type: 'poster' | 'backdrop' }[],
      embedVideos: parseJsonArray(jsonToString(item.embed_videos)) as { url: string; title: string }[],
      seasons: parseJsonArray(jsonToString(item.seasons)) as any[],
    }));

    return contentList;
  } catch (error) {
    console.error('Error in searchContent:', error);
    return [];
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    // First get all categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return [];
    }

    if (!categoriesData || categoriesData.length === 0) {
      return [];
    }

    // Get category contents mapping
    const { data: categoryContentsData, error: categoryContentsError } = await supabase
      .from('category_contents')
      .select('category_id, content_id');

    if (categoryContentsError) {
      console.error('Error fetching category contents:', categoryContentsError);
      return categoriesData.map(cat => ({ ...cat, contents: [] }));
    }

    // Get all content
    const allContent = await getAllContent();
    const contentMap = new Map(allContent.map(content => [content.id, content]));

    // Build categories with their contents
    const categories: Category[] = categoriesData.map(category => {
      const categoryContentIds = categoryContentsData
        .filter(cc => cc.category_id === category.id)
        .map(cc => cc.content_id);
      
      const contents = categoryContentIds
        .map(id => contentMap.get(id))
        .filter(content => content !== undefined) as Content[];

      return {
        id: category.id,
        name: category.name,
        contents
      };
    });

    return categories;
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
};

export const importFromTmdb = async (tmdbId: string, type: 'movie' | 'tv'): Promise<Content> => {
  console.log(`Starting TMDB import for ${type} with ID: ${tmdbId}`);
  
  try {
    // Validate inputs
    if (!tmdbId || !tmdbId.trim()) {
      throw new Error('TMDB ID is required');
    }

    if (!['movie', 'tv'].includes(type)) {
      throw new Error('Type must be either "movie" or "tv"');
    }

    console.log('Calling TMDB import edge function...');
    
    const { data, error } = await supabase.functions.invoke('tmdb-import', {
      body: { tmdbId: tmdbId.trim(), type }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Failed to import from TMDB: ${error.message || 'Unknown error'}`);
    }

    if (!data) {
      throw new Error('No data received from TMDB API');
    }

    if (data.error) {
      console.error('TMDB API error:', data.error);
      throw new Error(data.error);
    }

    // Validate required fields
    if (!data.title) {
      throw new Error('Invalid TMDB response: missing title');
    }

    console.log('Successfully imported from TMDB:', data.title);
    
    // Ensure all arrays are properly formatted
    const processedContent: Content = {
      ...data,
      genres: Array.isArray(data.genres) ? data.genres : [],
      watchProviders: Array.isArray(data.watchProviders) ? data.watchProviders : [],
      cast: Array.isArray(data.cast) ? data.cast : [],
      images: Array.isArray(data.images) ? data.images : [],
      embedVideos: Array.isArray(data.embedVideos) ? data.embedVideos : [],
      seasons: Array.isArray(data.seasons) ? data.seasons : [],
      rating: Number(data.rating) || 0,
      posterPath: data.posterPath || '',
      backdropPath: data.backdropPath || '',
      overview: data.overview || '',
      releaseDate: data.releaseDate || '',
      trailerUrl: data.trailerUrl || '',
      duration: data.duration || '',
      status: data.status || ''
    };

    return processedContent;
    
  } catch (error) {
    console.error('TMDB import error:', error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred during TMDB import');
    }
  }
};
