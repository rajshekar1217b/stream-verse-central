
import { supabase } from '@/types/supabase-extensions';
import { Content, Category } from '@/types';

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
      watchProviders: [], // These would be fetched separately
      seasons: [],
      cast: [],
      // Use custom data properties if they exist, otherwise empty arrays
      embedVideos: item.embed_videos || [],
      images: item.images || [],
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
        embed_videos: content.embedVideos,
        images: content.images,
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
      // Ensure type is 'movie' or 'tv' as required by Content interface
      type: data.type === 'movie' ? 'movie' : 'tv',
      genres: data.genres || [],
      rating: data.rating || 0,
      duration: data.duration,
      status: data.status,
      trailerUrl: data.trailer_url,
      watchProviders: [], // These would be fetched separately
      seasons: [],
      cast: [],
      embedVideos: data.embed_videos || [],
      images: data.images || [],
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
    
    // Make sure embedVideos property is properly formatted before saving
    const contentToUpdate = { 
      ...content,
      // Ensure these properties have the right format
      embedVideos: Array.isArray(content.embedVideos) ? content.embedVideos : [],
      images: Array.isArray(content.images) ? content.images : []
    };
    
    // Log what we're about to save
    console.log("Content prepared for update:", contentToUpdate);
    console.log("embedVideos to be saved:", contentToUpdate.embedVideos);
    
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
        // Add embedVideos to the database update
        embed_videos: content.embedVideos,
        // Add images to the database update
        images: content.images,
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
      watchProviders: [], // These would be fetched separately
      embedVideos: data.embed_videos || [],
      images: data.images || [],
      // ... any other fields
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
      seasons: Array.isArray(data.seasons) ? data.seasons : [],
      cast: Array.isArray(data.cast_info) ? data.cast_info : [],
      watchProviders: [], // Fetch from watchProviders table or use mock data
      embedVideos: data.embed_videos || [], // Get embedded videos
      images: data.images || [], // Get images
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
      watchProviders: [],
      seasons: [],
      cast: [],
      embedVideos: item.embed_videos || [],
      images: item.images || [],
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
      watchProviders: [],
      seasons: [],
      cast: [],
      embedVideos: item.embed_videos || [],
      images: item.images || [],
    }));

    return contents;
  } catch (error) {
    console.error('Error in searchContent:', error);
    throw error;
  }
};

// Import content from TMDB
export const importFromTmdb = async (id: string, type: 'movie' | 'tv'): Promise<Content | null> => {
  try {
    // This is a placeholder for a real TMDB API integration
    // In a real implementation, you would call the TMDB API here
    console.log(`Importing ${type} with ID ${id} from TMDB`);
    
    // Mock data for demonstration purposes
    const mockContent: Content = {
      id: `tmdb-${id}`,
      title: `Sample ${type === 'movie' ? 'Movie' : 'TV Show'} ${id}`,
      overview: `This is a sample ${type} imported from TMDB with ID ${id}.`,
      posterPath: `https://image.tmdb.org/t/p/w500/sample-poster-${id}.jpg`,
      backdropPath: `https://image.tmdb.org/t/p/original/sample-backdrop-${id}.jpg`,
      releaseDate: new Date().toISOString().split('T')[0],
      type: type,
      genres: ['Drama', 'Action'],
      rating: 8.5,
      duration: type === 'movie' ? '2h 15m' : null,
      status: 'Released',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      watchProviders: [],
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
          name: 'Actor Name',
          character: 'Character Name',
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
    return null;
  }
};
