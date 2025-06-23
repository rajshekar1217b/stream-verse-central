import { supabase } from '@/types/supabase-extensions';
import { Content, CastMember, WatchProvider, Episode, Category } from '@/types';

// Helper function to safely parse JSON arrays from the database
function parseJsonArray<T>(jsonString: string | null): T[] {
  if (!jsonString) {
    return [];
  }
  try {
    return JSON.parse(jsonString) as T[];
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
      watchProviders: parseJsonArray(jsonToString(data.watch_providers)) as WatchProvider[],
      cast: parseJsonArray(jsonToString(data.cast_info)) as CastMember[],
      images: parseJsonArray(jsonToString(data.images)) as { path: string; type: 'poster' | 'backdrop' }[],
      embedVideos: parseJsonArray(jsonToString(data.embed_videos)) as { url: string; title: string }[],
      seasons: []
    };

    // For TV shows, fetch and parse seasons with episodes
    if (content.type === 'tv' && data.seasons) {
      console.log('Processing TV show seasons:', data.seasons);
      
      let seasonsData = [];
      const seasonsString = jsonToString(data.seasons);
      if (seasonsString) {
        try {
          seasonsData = JSON.parse(seasonsString);
        } catch (e) {
          console.error('Error parsing seasons JSON:', e);
          seasonsData = [];
        }
      }

      console.log('Parsed seasons data:', seasonsData);

      content.seasons = seasonsData.map((season: any) => {
        console.log('Processing season:', season);
        
        // Parse episodes if they exist
        let episodes: Episode[] = [];
        if (season.episodes) {
          if (typeof season.episodes === 'string') {
            try {
              episodes = JSON.parse(season.episodes);
            } catch (e) {
              console.error('Error parsing episodes JSON:', e);
              episodes = [];
            }
          } else if (Array.isArray(season.episodes)) {
            episodes = season.episodes;
          }
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
  console.log(`Importing ${type} with TMDB ID: ${tmdbId}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('tmdb-import', {
      body: { tmdbId, type }
    })

    if (error) {
      console.error('Error calling TMDB import function:', error)
      throw new Error(`Failed to import from TMDB: ${error.message}`)
    }

    if (!data) {
      throw new Error('No data received from TMDB')
    }

    console.log('Successfully imported from TMDB:', data.title)
    return data as Content
    
  } catch (error) {
    console.error('TMDB import error:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to import from TMDB')
  }
};
