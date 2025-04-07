
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
}

export interface Category {
  id: string;
  name: string;
  contents: Content[];
}

export type ContentType = 'movie' | 'tv' | 'all';
