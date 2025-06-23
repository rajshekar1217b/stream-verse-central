
import { supabase } from '@/types/supabase-extensions';
import { Content, CastMember, WatchProvider, Episode } from '@/types';

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
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      releaseDate: data.release_date,
      rating: Number(data.rating) || 0,
      duration: data.duration,
      type: data.type as 'movie' | 'tv',
      genres: Array.isArray(data.genres) ? data.genres : 
              typeof data.genres === 'string' ? JSON.parse(data.genres) : [],
      trailerUrl: data.trailer_url,
      watchProviders: parseJsonArray(data.watch_providers) as WatchProvider[],
      cast: parseJsonArray(data.cast_info) as CastMember[],
      images: parseJsonArray(data.images) as { path: string; type: 'poster' | 'backdrop' }[],
      embedVideos: parseJsonArray(data.embed_videos) as { url: string; title: string }[],
      seasons: []
    };

    // For TV shows, fetch and parse seasons with episodes
    if (content.type === 'tv' && data.seasons) {
      console.log('Processing TV show seasons:', data.seasons);
      
      let seasonsData = [];
      if (typeof data.seasons === 'string') {
        try {
          seasonsData = JSON.parse(data.seasons);
        } catch (e) {
          console.error('Error parsing seasons JSON:', e);
          seasonsData = [];
        }
      } else if (Array.isArray(data.seasons)) {
        seasonsData = data.seasons;
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
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      releaseDate: item.release_date,
      rating: Number(item.rating) || 0,
      duration: item.duration,
      type: item.type as 'movie' | 'tv',
      genres: Array.isArray(item.genres) ? item.genres : [],
      trailerUrl: item.trailer_url,
      watchProviders: parseJsonArray(item.watch_providers) as WatchProvider[],
      cast: parseJsonArray(item.cast_info) as CastMember[],
      images: parseJsonArray(item.images) as { path: string; type: 'poster' | 'backdrop' }[],
      embedVideos: parseJsonArray(item.embed_videos) as { url: string; title: string }[],
      seasons: parseJsonArray(item.seasons) as any[],
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
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      releaseDate: item.release_date,
      rating: Number(item.rating) || 0,
      duration: item.duration,
      type: item.type as 'movie' | 'tv',
      genres: Array.isArray(item.genres) ? item.genres : [],
      trailerUrl: item.trailer_url,
      watchProviders: parseJsonArray(item.watch_providers) as WatchProvider[],
      cast: parseJsonArray(item.cast_info) as CastMember[],
      images: parseJsonArray(item.images) as { path: string; type: 'poster' | 'backdrop' }[],
      embedVideos: parseJsonArray(item.embed_videos) as { url: string; title: string }[],
      seasons: parseJsonArray(item.seasons) as any[],
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
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      releaseDate: item.release_date,
      rating: Number(item.rating) || 0,
      duration: item.duration,
      type: item.type as 'movie' | 'tv',
      genres: Array.isArray(item.genres) ? item.genres : [],
      trailerUrl: item.trailer_url,
      watchProviders: parseJsonArray(item.watch_providers) as WatchProvider[],
      cast: parseJsonArray(item.cast_info) as CastMember[],
      images: parseJsonArray(item.images) as { path: string; type: 'poster' | 'backdrop' }[],
      embedVideos: parseJsonArray(item.embed_videos) as { url: string; title: string }[],
      seasons: parseJsonArray(item.seasons) as any[],
    }));

    return contentList;
  } catch (error) {
    console.error('Error in searchContent:', error);
    return [];
  }
};

export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
};

export const importFromTmdb = async (tmdbId: string, type: 'movie' | 'tv'): Promise<Content> => {
  // This is a placeholder function - in a real implementation, 
  // you would call TMDB API and parse the response
  throw new Error('TMDB import not implemented yet');
};
