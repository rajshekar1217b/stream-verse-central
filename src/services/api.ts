
import { Content, Category, Season, Episode, Person, WatchProvider } from '@/types';
import { mockContents, mockCategories, watchProviders } from '@/data/mockData';
import { supabase, toJson } from '@/integrations/supabase/client';

// Simulated API service
// In a real-world scenario, these would make actual API calls to your backend

// Get all content 
export const getAllContent = async (): Promise<Content[]> => {
  try {
    const { data, error } = await supabase
      .from('contents')
      .select('*');
      
    if (error) {
      console.error('Error fetching content:', error);
      return mockContents;
    }
    
    // Map database fields to our Content type
    const mappedContent = data.map(item => ({
      id: item.id,
      title: item.title,
      overview: item.overview,
      posterPath: item.poster_path || '',
      backdropPath: item.backdrop_path || '',
      releaseDate: item.release_date || undefined,
      type: item.type as 'movie' | 'tv',
      genres: item.genres || [],
      rating: item.rating || 0,
      trailerUrl: item.trailer_url || undefined,
      duration: item.duration || undefined,
      status: item.status || undefined,
      cast: item.cast_info ? (item.cast_info as any) : undefined,
      seasons: item.seasons ? (item.seasons as any) : undefined,
    }));
    
    return data.length > 0 ? mappedContent : mockContents;
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return mockContents;
  }
};

// Get content by ID
export const getContentById = async (id: string): Promise<Content | undefined> => {
  try {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching content by ID:', error);
      return mockContents.find(content => content.id === id);
    }
    
    // Map database fields to our Content type
    if (data) {
      return {
        id: data.id,
        title: data.title,
        overview: data.overview,
        posterPath: data.poster_path || '',
        backdropPath: data.backdrop_path || '',
        releaseDate: data.release_date || undefined,
        type: data.type as 'movie' | 'tv',
        genres: data.genres || [],
        rating: data.rating || 0,
        trailerUrl: data.trailer_url || undefined,
        duration: data.duration || undefined,
        status: data.status || undefined,
        cast: data.cast_info ? (data.cast_info as any) : undefined,
        seasons: data.seasons ? (data.seasons as any) : undefined,
      };
    }
    
    return mockContents.find(content => content.id === id);
  } catch (error) {
    console.error('Failed to fetch content by ID:', error);
    return mockContents.find(content => content.id === id);
  }
};

// Get content by type (movie or tv)
export const getContentByType = async (type: 'movie' | 'tv' | 'all'): Promise<Content[]> => {
  try {
    if (type === 'all') {
      return await getAllContent();
    }
    
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('type', type);
      
    if (error) {
      console.error('Error fetching content by type:', error);
      return mockContents.filter(content => content.type === type);
    }
    
    // Map database fields to our Content type
    const mappedContent = data.map(item => ({
      id: item.id,
      title: item.title,
      overview: item.overview,
      posterPath: item.poster_path || '',
      backdropPath: item.backdrop_path || '',
      releaseDate: item.release_date || undefined,
      type: item.type as 'movie' | 'tv',
      genres: item.genres || [],
      rating: item.rating || 0,
      trailerUrl: item.trailer_url || undefined,
      duration: item.duration || undefined,
      status: item.status || undefined,
      cast: item.cast_info ? (item.cast_info as any) : undefined,
      seasons: item.seasons ? (item.seasons as any) : undefined,
    }));
    
    return data.length > 0 ? mappedContent : mockContents.filter(content => content.type === type);
  } catch (error) {
    console.error('Failed to fetch content by type:', error);
    return mockContents.filter(content => content.type === type);
  }
};

// Get all categories with their contents
export const getCategories = async (): Promise<Category[]> => {
  try {
    // First get categories
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('*');
      
    if (categoryError) {
      console.error('Error fetching categories:', categoryError);
      return mockCategories;
    }
    
    if (categoryData.length === 0) {
      return mockCategories;
    }
    
    // Then get all contents
    const { data: contentData, error: contentError } = await supabase
      .from('contents')
      .select('*');
      
    if (contentError) {
      console.error('Error fetching contents for categories:', contentError);
      return mockCategories;
    }
    
    // Then get category_contents mapping
    const { data: mappingData, error: mappingError } = await supabase
      .from('category_contents')
      .select('*');
      
    if (mappingError) {
      console.error('Error fetching category mappings:', mappingError);
      return mockCategories;
    }
    
    // Build categories with their contents
    const categories = categoryData.map((category: any) => {
      const categoryContentIds = mappingData
        .filter((mapping: any) => mapping.category_id === category.id)
        .map((mapping: any) => mapping.content_id);
        
      const contents = contentData.filter((content: any) => 
        categoryContentIds.includes(content.id)
      ).map((item: any) => ({
        id: item.id,
        title: item.title,
        overview: item.overview,
        posterPath: item.poster_path || '',
        backdropPath: item.backdrop_path || '',
        releaseDate: item.release_date || undefined,
        type: item.type as 'movie' | 'tv',
        genres: item.genres || [],
        rating: item.rating || 0,
        trailerUrl: item.trailer_url || undefined,
        duration: item.duration || undefined,
        status: item.status || undefined,
        cast: item.cast_info ? (item.cast_info as any) : undefined,
        seasons: item.seasons ? (item.seasons as any) : undefined,
      }));
      
      return {
        id: category.id,
        name: category.name,
        contents: contents.length > 0 ? contents : []
      };
    });
    
    return categories.length > 0 ? categories : mockCategories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return mockCategories;
  }
};

// Search content by title
export const searchContent = async (query: string): Promise<Content[]> => {
  try {
    const normalizedQuery = query.toLowerCase();
    
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .ilike('title', `%${normalizedQuery}%`)
      .or(`overview.ilike.%${normalizedQuery}%`);
      
    if (error) {
      console.error('Error searching content:', error);
      return mockContents.filter(content => 
        content.title.toLowerCase().includes(normalizedQuery) || 
        content.overview.toLowerCase().includes(normalizedQuery)
      );
    }
    
    // Map database fields to our Content type
    const mappedContent = data.map(item => ({
      id: item.id,
      title: item.title,
      overview: item.overview,
      posterPath: item.poster_path || '',
      backdropPath: item.backdrop_path || '',
      releaseDate: item.release_date || undefined,
      type: item.type as 'movie' | 'tv',
      genres: item.genres || [],
      rating: item.rating || 0,
      trailerUrl: item.trailer_url || undefined,
      duration: item.duration || undefined,
      status: item.status || undefined,
      cast: item.cast_info ? (item.cast_info as any) : undefined,
      seasons: item.seasons ? (item.seasons as any) : undefined,
    }));
    
    return data.length > 0 ? mappedContent : mockContents.filter(content => 
      content.title.toLowerCase().includes(normalizedQuery) || 
      content.overview.toLowerCase().includes(normalizedQuery)
    );
  } catch (error) {
    console.error('Failed to search content:', error);
    return mockContents.filter(content => 
      content.title.toLowerCase().includes(query.toLowerCase()) || 
      content.overview.toLowerCase().includes(query.toLowerCase())
    );
  }
};

// Add new content (admin only)
export const addContent = async (content: Content): Promise<Content> => {
  try {
    // Insert content into database
    const contentToInsert = {
      id: content.id || `content-${Date.now()}`,
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
      cast_info: toJson(content.cast),
      seasons: toJson(content.seasons),
    };
    
    const { data, error } = await supabase
      .from('contents')
      .insert(contentToInsert)
      .select()
      .single();
      
    if (error) {
      console.error('Error adding content:', error);
      throw error;
    }
    
    // Add to relevant category based on type
    const categoryName = content.type === 'movie' ? 'Movies' : 'TV Shows';
    
    // Find category ID
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();
      
    if (categoryError) {
      console.error('Error finding category:', categoryError);
      // If category not found, create it
      if (categoryError.code === 'PGRST116') {
        const { data: newCategory, error: newCategoryError } = await supabase
          .from('categories')
          .insert({ name: categoryName })
          .select()
          .single();
          
        if (newCategoryError) {
          console.error('Error creating category:', newCategoryError);
        } else if (newCategory && data) {
          // Add mapping
          await supabase
            .from('category_contents')
            .insert({
              category_id: newCategory.id,
              content_id: data.id
            });
        }
      }
    } else if (categoryData && data) {
      // Add mapping
      await supabase
        .from('category_contents')
        .insert({
          category_id: categoryData.id,
          content_id: data.id
        });
    }
    
    // Also add to "New Releases" category if recent
    if (content.releaseDate) {
      const releaseDate = new Date(content.releaseDate);
      const now = new Date();
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(now.getFullYear() - 2);
      
      if (releaseDate >= twoYearsAgo) {
        const { data: newReleasesCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('name', 'New Releases')
          .single();
          
        if (newReleasesCategory && data) {
          await supabase
            .from('category_contents')
            .insert({
              category_id: newReleasesCategory.id,
              content_id: data.id
            });
        }
      }
    }
    
    if (data) {
      return {
        id: data.id,
        title: data.title,
        overview: data.overview,
        posterPath: data.poster_path || '',
        backdropPath: data.backdrop_path || '',
        releaseDate: data.release_date || undefined,
        type: data.type as 'movie' | 'tv',
        genres: data.genres || [],
        rating: data.rating || 0,
        trailerUrl: data.trailer_url || undefined,
        duration: data.duration || undefined,
        status: data.status || undefined,
        cast: data.cast_info ? (data.cast_info as any) : undefined,
        seasons: data.seasons ? (data.seasons as any) : undefined,
      };
    }
    
    return content;
  } catch (error) {
    console.error('Failed to add content:', error);
    
    // Fallback to mock implementation
    console.log('Adding content (fallback):', content);
    
    const newContent = {
      ...content,
      id: content.id || Date.now().toString(),
    };
    
    mockContents.push(newContent);
    
    const categoryName = content.type === 'movie' ? 'Movies' : 'TV Shows';
    const category = mockCategories.find(cat => cat.name === categoryName);
    if (category) {
      category.contents.push(newContent);
    }
    
    return newContent;
  }
};

// Update content (admin only)
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
        cast_info: toJson(content.cast),
        seasons: toJson(content.seasons),
      })
      .eq('id', content.id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating content:', error);
      throw error;
    }
    
    if (data) {
      return {
        id: data.id,
        title: data.title,
        overview: data.overview,
        posterPath: data.poster_path || '',
        backdropPath: data.backdrop_path || '',
        releaseDate: data.release_date || undefined,
        type: data.type as 'movie' | 'tv',
        genres: data.genres || [],
        rating: data.rating || 0,
        trailerUrl: data.trailer_url || undefined,
        duration: data.duration || undefined,
        status: data.status || undefined,
        cast: data.cast_info ? (data.cast_info as any) : undefined,
        seasons: data.seasons ? (data.seasons as any) : undefined,
      };
    }
    
    return content;
  } catch (error) {
    console.error('Failed to update content:', error);
    
    // Fallback to mock implementation
    console.log('Updating content (fallback):', content);
    
    const index = mockContents.findIndex(c => c.id === content.id);
    if (index !== -1) {
      mockContents[index] = content;
      
      mockCategories.forEach(category => {
        const catIndex = category.contents.findIndex(c => c.id === content.id);
        if (catIndex !== -1) {
          category.contents[catIndex] = content;
        }
      });
    }
    
    return content;
  }
};

// Delete content (admin only)
export const deleteContent = async (id: string): Promise<boolean> => {
  try {
    // First delete all category mappings
    const { error: mappingError } = await supabase
      .from('category_contents')
      .delete()
      .eq('content_id', id);
      
    if (mappingError) {
      console.error('Error deleting category mappings:', mappingError);
    }
    
    // Then delete the content
    const { error } = await supabase
      .from('contents')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete content:', error);
    
    // Fallback to mock implementation
    console.log('Deleting content with ID (fallback):', id);
    
    const index = mockContents.findIndex(content => content.id === id);
    if (index !== -1) {
      mockContents.splice(index, 1);
      
      mockCategories.forEach(category => {
        const catIndex = category.contents.findIndex(c => c.id === id);
        if (catIndex !== -1) {
          category.contents.splice(catIndex, 1);
        }
      });
    }
    
    return true;
  }
};

// TMDB import function with real API integration
export const importFromTmdb = async (tmdbId: string, forcedType?: 'movie' | 'tv'): Promise<Content | null> => {
  console.log('Importing from TMDB ID:', tmdbId, 'Forced type:', forcedType);
  
  // TMDB API configuration
  const API_KEY = "bc7e2dc86a85f194da52360ed092f9cc";
  const API_READ_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYzdlMmRjODZhODVmMTk0ZGE1MjM2MGVkMDkyZjljYyIsInN1YiI6IjYxYzUzZGQ3YjA0MjI4MDA2MTM1Y2MxOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3VvMqEM8DbOVNZjxgKiHBVPXhpyhEPzXgIJ_NuArOvU";
  
  try {
    // Define the content type based on forced parameter or autodetect
    let contentType: 'movie' | 'tv' = forcedType || 'movie';
    let contentDetails = null;
    
    if (forcedType === 'movie' || !forcedType) {
      // Try movie endpoint first (or if explicitly requested)
      const movieResponse = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${API_KEY}&append_to_response=videos,credits`, {
        headers: {
          'Authorization': `Bearer ${API_READ_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (movieResponse.ok) {
        contentDetails = await movieResponse.json();
        contentType = 'movie';
      } else if (!forcedType) {
        // Only try TV if not forcing movie type
        const tvResponse = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${API_KEY}&append_to_response=videos,credits`, {
          headers: {
            'Authorization': `Bearer ${API_READ_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (tvResponse.ok) {
          contentDetails = await tvResponse.json();
          contentType = 'tv';
        }
      }
    } else if (forcedType === 'tv') {
      // If TV type is explicitly requested
      const tvResponse = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${API_KEY}&append_to_response=videos,credits`, {
        headers: {
          'Authorization': `Bearer ${API_READ_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (tvResponse.ok) {
        contentDetails = await tvResponse.json();
      }
    }
    
    if (!contentDetails) {
      console.error('Content not found on TMDB');
      return null;
    }
    
    // Extract trailer URL if available
    let trailerUrl = '';
    if (contentDetails.videos && contentDetails.videos.results && contentDetails.videos.results.length > 0) {
      const trailer = contentDetails.videos.results.find((video: any) => 
        video.type === 'Trailer' && video.site === 'YouTube'
      ) || contentDetails.videos.results[0];
      
      if (trailer) {
        trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
      }
    }
    
    // Extract genres
    const genres = contentDetails.genres.map((genre: any) => genre.name);
    
    // Get cast information
    const cast = contentDetails.credits && contentDetails.credits.cast ? 
      contentDetails.credits.cast.slice(0, 10).map((person: any) => ({
        id: `cast-${person.id}`,
        name: person.name,
        character: person.character,
        profilePath: person.profile_path
          ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
          : 'https://via.placeholder.com/150?text=No+Image',
      })) : [];
    
    // Get seasons data for TV shows
    let seasons = undefined;
    if (contentType === 'tv' && contentDetails.seasons) {
      // Get full details for all seasons
      seasons = await Promise.all(contentDetails.seasons
        // Filter out season 0 which is usually specials
        .filter((season: any) => season.season_number > 0)
        .map(async (season: any) => {
          try {
            // Fetch detailed season info including episodes
            const seasonResponse = await fetch(
              `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season.season_number}?api_key=${API_KEY}`,
              {
                headers: {
                  'Authorization': `Bearer ${API_READ_TOKEN}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            if (!seasonResponse.ok) {
              console.error(`Failed to fetch season ${season.season_number} data`);
              return null;
            }
            
            const seasonData = await seasonResponse.json();
            
            // Get episodes with complete details
            const episodes = seasonData.episodes.map((episode: any) => ({
              id: `${tmdbId}-s${season.season_number}-e${episode.episode_number}`,
              title: episode.name,
              overview: episode.overview || 'No description available.',
              stillPath: episode.still_path 
                ? `https://image.tmdb.org/t/p/w500${episode.still_path}` 
                : 'https://via.placeholder.com/500x281?text=No+Image',
              episodeNumber: episode.episode_number,
              airDate: episode.air_date,
              duration: episode.runtime ? `${episode.runtime}m` : '30m', // Some TMDB episodes have runtime
              rating: episode.vote_average || 0,
            }));
            
            return {
              id: `${tmdbId}-s${season.season_number}`,
              name: season.name,
              overview: season.overview || seasonData.overview || 'No description available.',
              posterPath: season.poster_path 
                ? `https://image.tmdb.org/t/p/w500${season.poster_path}`
                : 'https://via.placeholder.com/500x750?text=No+Image',
              seasonNumber: season.season_number,
              episodeCount: episodes.length,
              airDate: season.air_date,
              episodes: episodes
            };
          } catch (error) {
            console.error(`Error fetching season ${season.season_number} data:`, error);
            return null;
          }
        }));
      
      // Filter out null seasons (in case any season fetch failed)
      seasons = seasons.filter((season: Season | null) => season !== null);
    }
    
    // Include real watch providers from TMDB if available
    let availableWatchProviders: WatchProvider[] = [];
    
    try {
      // Fetch watch providers
      const watchProvidersResponse = await fetch(
        `https://api.themoviedb.org/3/${contentType}/${tmdbId}/watch/providers?api_key=${API_KEY}`,
        {
          headers: {
            'Authorization': `Bearer ${API_READ_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (watchProvidersResponse.ok) {
        const providersData = await watchProvidersResponse.json();
        console.log("Watch providers data:", providersData);
        
        // Use US providers as default, then fall back to IN (India), then UK, then any available region
        const regions = ['US', 'IN', 'GB'];
        let regionProviders = null;
        
        // Try each preferred region in order
        for (const region of regions) {
          if (providersData.results && providersData.results[region]) {
            regionProviders = providersData.results[region];
            console.log(`Using ${region} watch providers`);
            break;
          }
        }
        
        // If none of the preferred regions are available, use the first available region
        if (!regionProviders && providersData.results) {
          const availableRegions = Object.keys(providersData.results);
          if (availableRegions.length > 0) {
            regionProviders = providersData.results[availableRegions[0]];
            console.log(`Using ${availableRegions[0]} watch providers as fallback`);
          }
        }
        
        if (regionProviders) {
          // Combine flatrate (subscription), rent, and buy options
          const allProviders = [
            ...(regionProviders.flatrate || []),
            ...(regionProviders.rent || []),
            ...(regionProviders.buy || [])
          ];
          
          // Remove duplicates by provider ID
          const uniqueProviders = allProviders.filter((provider: any, index: number, self: any[]) =>
            index === self.findIndex((p: any) => p.provider_id === provider.provider_id)
          );
          
          // Map to our provider format
          const mappedProviders = uniqueProviders.map((provider: any) => {
            // Try to find a matching provider in our database
            const knownProvider = watchProviders.find(p => 
              p.name.toLowerCase() === provider.provider_name.toLowerCase()
            );
            
            // Generate a URL for web and app if possible
            const providerName = provider.provider_name.toLowerCase();
            let url = `https://www.google.com/search?q=watch+${encodeURIComponent(contentDetails.title || contentDetails.name)}+on+${encodeURIComponent(provider.provider_name)}`;
            let redirectLink: string | undefined = undefined;
            
            // Add special handling for common streaming services
            if (providerName.includes('netflix')) {
              url = 'https://www.netflix.com/';
              redirectLink = 'netflix://';
            } else if (providerName.includes('disney')) {
              url = 'https://www.disneyplus.com/';
              redirectLink = 'disneyplus://';
            } else if (providerName.includes('hulu')) {
              url = 'https://www.hulu.com/';
              redirectLink = 'hulu://';
            } else if (providerName.includes('prime') || providerName.includes('amazon')) {
              url = 'https://www.primevideo.com/';
              redirectLink = 'amzn://apps/android?p=com.amazon.avod.thirdpartyclient';
            } else if (providerName.includes('hbo') || providerName.includes('max')) {
              url = 'https://www.max.com/';
              redirectLink = 'max://';
            } else if (providerName.includes('apple') || providerName.includes('itunes')) {
              url = 'https://tv.apple.com/';
              redirectLink = 'videos://';
            }
            
            return {
              id: knownProvider?.id || `tmdb-${provider.provider_id}`,
              name: provider.provider_name,
              logoPath: `https://image.tmdb.org/t/p/original${provider.logo_path}`,
              url: knownProvider?.url || url,
              redirectLink: knownProvider?.redirectLink || redirectLink
            };
          });
          
          availableWatchProviders = mappedProviders;
        }
      }
    } catch (error) {
      console.error('Error fetching watch providers:', error);
    }
    
    console.log("Available watch providers:", availableWatchProviders);
    
    // Create content object based on TMDB data
    const content: Content = {
      id: `tmdb-${contentDetails.id}-${contentType}`,
      title: contentType === 'movie' ? contentDetails.title : contentDetails.name,
      overview: contentDetails.overview || 'No overview available.',
      posterPath: contentDetails.poster_path 
        ? `https://image.tmdb.org/t/p/w500${contentDetails.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image',
      backdropPath: contentDetails.backdrop_path
        ? `https://image.tmdb.org/t/p/original${contentDetails.backdrop_path}`
        : 'https://via.placeholder.com/1920x1080?text=No+Image',
      releaseDate: contentType === 'movie' ? contentDetails.release_date : contentDetails.first_air_date,
      type: contentType,
      genres: genres,
      rating: contentDetails.vote_average || 0,
      trailerUrl: trailerUrl,
      status: contentDetails.status,
      cast: cast.length > 0 ? cast : undefined,
      seasons: seasons,
      watchProviders: availableWatchProviders.length > 0 ? availableWatchProviders : undefined,
      duration: contentType === 'movie' && contentDetails.runtime ? 
        `${Math.floor(contentDetails.runtime / 60)}h ${contentDetails.runtime % 60}m` : 
        undefined,
    };
    
    return content;
    
  } catch (error) {
    console.error('Error importing from TMDB:', error);
    return null;
  }
};
