
import { Content, Category } from '@/types';
import { mockContents, mockCategories } from '@/data/mockData';

// Simulated API service
// In a real-world scenario, these would make actual API calls to your backend

// Get all content 
export const getAllContent = (): Promise<Content[]> => {
  return Promise.resolve(mockContents);
};

// Get content by ID
export const getContentById = (id: string): Promise<Content | undefined> => {
  return Promise.resolve(mockContents.find(content => content.id === id));
};

// Get content by type (movie or tv)
export const getContentByType = (type: 'movie' | 'tv' | 'all'): Promise<Content[]> => {
  if (type === 'all') {
    return Promise.resolve(mockContents);
  }
  return Promise.resolve(mockContents.filter(content => content.type === type));
};

// Get all categories with their contents
export const getCategories = (): Promise<Category[]> => {
  return Promise.resolve(mockCategories);
};

// Search content by title
export const searchContent = (query: string): Promise<Content[]> => {
  const normalizedQuery = query.toLowerCase();
  return Promise.resolve(
    mockContents.filter(content => 
      content.title.toLowerCase().includes(normalizedQuery) || 
      content.overview.toLowerCase().includes(normalizedQuery)
    )
  );
};

// Add new content (admin only)
export const addContent = (content: Content): Promise<Content> => {
  // In a real app, this would make a POST request to your backend
  console.log('Adding content:', content);
  
  // Add the new content to our mock database
  const newContent = {
    ...content,
    id: Date.now().toString(), // Generate a unique ID
  };
  
  // Add the content to our mock data
  mockContents.push(newContent);
  
  // Add to relevant category based on type
  const categoryName = content.type === 'movie' ? 'Movies' : 'TV Shows';
  const category = mockCategories.find(cat => cat.name === categoryName);
  if (category) {
    category.contents.push(newContent);
  }
  
  return Promise.resolve(newContent);
};

// Update content (admin only)
export const updateContent = (content: Content): Promise<Content> => {
  // In a real app, this would make a PUT request to your backend
  console.log('Updating content:', content);
  
  // Find and update the content in our mock database
  const index = mockContents.findIndex(c => c.id === content.id);
  if (index !== -1) {
    mockContents[index] = content;
    
    // Update in categories
    mockCategories.forEach(category => {
      const catIndex = category.contents.findIndex(c => c.id === content.id);
      if (catIndex !== -1) {
        category.contents[catIndex] = content;
      }
    });
  }
  
  return Promise.resolve(content);
};

// Delete content (admin only)
export const deleteContent = (id: string): Promise<boolean> => {
  // In a real app, this would make a DELETE request to your backend
  console.log('Deleting content with ID:', id);
  
  // Remove from our mock database
  const index = mockContents.findIndex(content => content.id === id);
  if (index !== -1) {
    mockContents.splice(index, 1);
    
    // Remove from categories
    mockCategories.forEach(category => {
      const catIndex = category.contents.findIndex(c => c.id === id);
      if (catIndex !== -1) {
        category.contents.splice(catIndex, 1);
      }
    });
  }
  
  return Promise.resolve(true);
};

// TMDB import function with real API integration
export const importFromTmdb = async (tmdbId: string): Promise<Content | null> => {
  console.log('Importing from TMDB ID:', tmdbId);
  
  // TMDB API configuration
  const API_KEY = "bc7e2dc86a85f194da52360ed092f9cc";
  const API_READ_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYzdlMmRjODZhODVmMTk0ZGE1MjM2MGVkMDkyZjljYyIsInN1YiI6IjYxYzUzZGQ3YjA0MjI4MDA2MTM1Y2MxOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3VvMqEM8DbOVNZjxgKiHBVPXhpyhEPzXgIJ_NuArOvU";
  
  try {
    // First, try to detect if it's a movie or TV show
    let movieData = null;
    let tvData = null;
    let contentType: 'movie' | 'tv' = 'movie';
    let contentDetails = null;
    
    // Try movie endpoint first
    const movieResponse = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${API_KEY}&append_to_response=videos,credits`, {
      headers: {
        'Authorization': `Bearer ${API_READ_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (movieResponse.ok) {
      movieData = await movieResponse.json();
      contentType = 'movie';
      contentDetails = movieData;
    } else {
      // If not a movie, try TV show endpoint
      const tvResponse = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${API_KEY}&append_to_response=videos,credits`, {
        headers: {
          'Authorization': `Bearer ${API_READ_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (tvResponse.ok) {
        tvData = await tvResponse.json();
        contentType = 'tv';
        contentDetails = tvData;
      } else {
        // Neither movie nor TV show found
        console.error('Content not found on TMDB');
        return null;
      }
    }
    
    if (!contentDetails) return null;
    
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
      seasons = await Promise.all(contentDetails.seasons.map(async (season: any) => {
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
        
        if (!seasonResponse.ok) return null;
        
        const seasonData = await seasonResponse.json();
        
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
      }));
      
      // Filter out null seasons (in case any season fetch failed)
      seasons = seasons.filter(season => season !== null);
    }
    
    // Create content object based on TMDB data
    const content: Content = {
      id: `tmdb-${contentDetails.id}`,
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
      duration: contentType === 'movie' && contentDetails.runtime ? `${Math.floor(contentDetails.runtime / 60)}h ${contentDetails.runtime % 60}m` : undefined,
    };
    
    return content;
    
  } catch (error) {
    console.error('Error importing from TMDB:', error);
    return null;
  }
};
