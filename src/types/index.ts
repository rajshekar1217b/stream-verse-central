
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
  trailerUrl?: string;
  duration?: string;
  status?: string;
  cast?: Person[];
  seasons?: Season[];
  watchProviders?: WatchProvider[];
  images?: {
    path: string;
    type: 'poster' | 'backdrop';
  }[];
}

export interface Category {
  id: string;
  name: string;
  contents: Content[];
}

export interface Season {
  id: string;
  name: string;
  overview: string;
  posterPath: string;
  seasonNumber: number;
  episodeCount: number;
  airDate?: string;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  title: string;
  overview: string;
  stillPath: string;
  episodeNumber: number;
  airDate?: string;
  duration?: string;
  rating: number;
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
  url?: string;
  redirectLink?: string;
}

// Adding Genre interface for consistency, though we're using string[] for genres in Content
export interface Genre {
  id: string;
  name: string;
}
