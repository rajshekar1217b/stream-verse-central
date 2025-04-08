
export interface Content {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseDate?: string;
  type: 'movie' | 'tv';
  genres: string[];
  rating: number;
  watchProviders?: WatchProvider[];
  trailerUrl?: string;
  duration?: string;
  status?: string;
  cast?: Person[];
  seasons?: Season[]; // Added for TV Shows
}

export interface Season {
  id: string;
  name: string;
  overview?: string;
  posterPath?: string;
  airDate?: string;
  seasonNumber: number;
  episodeCount: number;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  title: string;
  overview: string;
  stillPath?: string;
  airDate?: string;
  episodeNumber: number;
  duration?: string;
  rating?: number;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Person {
  id: string;
  name: string;
  character?: string;
  profilePath?: string;
}

export interface WatchProvider {
  id: string;
  name: string;
  logoPath: string;
  url: string;
  redirectLink?: string; // Added for app redirect links
}

export type ContentType = 'movie' | 'tv' | 'all';

// Add the Category interface that was missing
export interface Category {
  id: string;
  name: string;
  contents: Content[];
}
