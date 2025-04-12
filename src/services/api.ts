import { supabase } from '@/types/supabase-extensions';
import { Content } from '@/types';

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
      type: item.type,
      genres: item.genres || [],
      rating: item.rating || 0,
      duration: item.duration,
      status: item.status,
	  trailerUrl: item.trailer_url,
      watchProviders: [], // These would be fetched separately
	  seasons: [],
	  cast: [],
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
        type: content.type,
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
      type: data.type,
      genres: data.genres,
      rating: data.rating,
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
        type: content.type,
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
      type: data.type,
      genres: data.genres,
      rating: data.rating,
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
      type: data.type,
      genres: data.genres || [],
      rating: data.rating || 0,
      duration: data.duration,
      status: data.status,
      trailerUrl: data.trailer_url,
      seasons: data.seasons || [],
      cast: data.cast_info || [],
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
