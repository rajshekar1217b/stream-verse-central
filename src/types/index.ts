export interface WatchProvider {
  id: string;
  name: string;
  logoPath: string;
  url: string;
  redirectLink?: string;
}

export interface Season {
  id: string;
  seasonNumber: number;
  episodeCount: number;
  posterPath?: string;
}

export interface CastMember {
  id: string;
  name: string;
  character: string;
  profilePath?: string;
}

export interface Content {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath?: string;
  releaseDate?: string;
  type: 'movie' | 'tv';
  genres: string[];
  rating?: number;
  trailerUrl?: string;
  duration?: string;
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
