
export interface WatchProvider {
  id: string;
  name: string;
  logoPath: string;
  url: string;
  redirectLink?: string;
}

export interface Season {
  id: string;
  name: string;
  seasonNumber: number;
  episodeCount: number;
  posterPath?: string;
  airDate?: string;
  overview?: string;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  title: string;
  overview: string;
  stillPath?: string;
  episodeNumber: number;
  airDate?: string;
  duration?: string;
  rating?: number;
}

export interface CastMember {
  id: string;
  name: string;
  character: string;
  profilePath?: string;
}

// Alias CastMember as Person for backward compatibility
export type Person = CastMember;

export interface Content {
  id: string;
  title: string;
  slug?: string;
  overview: string;
  posterPath: string;
  backdropPath?: string;
  releaseDate?: string;
  type: 'movie' | 'tv';
  genres: string[];
  rating?: number;
  trailerUrl?: string;
  duration?: string;
  status?: string;
  watchProviders?: WatchProvider[];
  seasons?: Season[];
  cast?: CastMember[];
  images?: {
    path: string;
    type: 'poster' | 'backdrop';
  }[];
  embedVideos?: {
    url: string;
    title: string;
  }[];
}

export interface Category {
  id: string;
  name: string;
  contents: Content[];
}
