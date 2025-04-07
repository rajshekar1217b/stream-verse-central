
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
  return Promise.resolve({
    ...content,
    id: Date.now().toString(), // Generate a unique ID
  });
};

// Update content (admin only)
export const updateContent = (content: Content): Promise<Content> => {
  // In a real app, this would make a PUT request to your backend
  console.log('Updating content:', content);
  return Promise.resolve(content);
};

// Delete content (admin only)
export const deleteContent = (id: string): Promise<boolean> => {
  // In a real app, this would make a DELETE request to your backend
  console.log('Deleting content with ID:', id);
  return Promise.resolve(true);
};

// IMDb import function (admin only)
export const importFromImdb = async (imdbId: string): Promise<Content | null> => {
  // In a real app, this would connect to an IMDb API or proxy
  console.log('Importing from IMDb ID:', imdbId);
  
  // Simulating an API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return a mock content based on the ID
      const mockImport: Content = {
        id: `imported-${imdbId}`,
        title: `Imported Title ${imdbId}`,
        overview: "This content was imported from IMDb.",
        posterPath: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        backdropPath: "https://image.tmdb.org/t/p/original/zSJZ1w3y50Lk0IgRZNrVplq0Ifk.jpg",
        releaseDate: "2023-01-01",
        type: "movie",
        genres: ["Action", "Drama"],
        rating: 7.5,
      };
      resolve(mockImport);
    }, 1000);
  });
};
