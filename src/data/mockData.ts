
import { Content, Category, Season, Episode } from '@/types';

// Mock Episodes
const generateEpisodes = (seasonId: string, seasonNumber: number, count: number): Episode[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${seasonId}-ep${i + 1}`,
    title: `Episode ${i + 1}`,
    overview: `This is the description for Season ${seasonNumber} Episode ${i + 1}. The plot thickens as our characters face new challenges.`,
    stillPath: `https://picsum.photos/seed/${seasonId}-${i}/800/450`,
    episodeNumber: i + 1,
    airDate: new Date(2023, seasonNumber - 1, (i + 1) * 7).toISOString(),
    duration: `${Math.floor(Math.random() * 15) + 30}m`,
    rating: parseFloat((Math.random() * 2 + 7).toFixed(1)),
  }));
};

// Mock Seasons for TV Shows
const generateSeasons = (showId: string, count: number): Season[] => {
  return Array.from({ length: count }, (_, i) => {
    const seasonId = `${showId}-s${i + 1}`;
    const episodeCount = Math.floor(Math.random() * 6) + 8;
    
    return {
      id: seasonId,
      name: `Season ${i + 1}`,
      overview: i === 0 ? 'The first season introduces the main characters and setting.' : `Season ${i + 1} continues the story with new challenges.`,
      posterPath: `https://picsum.photos/seed/${seasonId}/300/450`,
      seasonNumber: i + 1,
      episodeCount: episodeCount,
      airDate: new Date(2022 + i, 0, 1).toISOString(),
      episodes: generateEpisodes(seasonId, i + 1, episodeCount),
    };
  });
};

// Mock Watch Providers
export const watchProviders = [
  {
    id: 'netflix',
    name: 'Netflix',
    logoPath: 'https://image.tmdb.org/t/p/original/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg',
    url: 'https://www.netflix.com/',
    redirectLink: 'netflix://title/',
  },
  {
    id: 'prime',
    name: 'Prime Video',
    logoPath: 'https://image.tmdb.org/t/p/original/68MNrwlkpF7WnmNPXLah69CR5cb.jpg',
    url: 'https://www.primevideo.com/',
    redirectLink: 'amzn://title/',
  },
  {
    id: 'hotstar',
    name: 'Disney+ Hotstar',
    logoPath: 'https://image.tmdb.org/t/p/original/as2oTLpMy3nGgGTzX8TlWgdSw7f.jpg',
    url: 'https://www.hotstar.com/',
    redirectLink: 'hotstar://title/',
  },
  {
    id: 'zee5',
    name: 'ZEE5',
    logoPath: 'https://image.tmdb.org/t/p/original/xDXzGK8JXfBzH9e2I5vuQ8Ov6yG.jpg',
    url: 'https://www.zee5.com/',
    redirectLink: 'zee5://title/',
  },
  {
    id: 'sonyliv',
    name: 'SonyLIV',
    logoPath: 'https://image.tmdb.org/t/p/original/1U2VgZ9n2lL8rIwNdnkVcXGtYP.jpg',
    url: 'https://www.sonyliv.com/',
    redirectLink: 'sonyliv://title/',
  },
  {
    id: 'altbalaji',
    name: 'ALTBalaji',
    logoPath: 'https://image.tmdb.org/t/p/original/yvMbK6T1ItCK8S9GrJpUBmD5vUa.jpg',
    url: 'https://www.altbalaji.com/',
    redirectLink: 'altbalaji://title/',
  },
  {
    id: 'voot',
    name: 'Voot',
    logoPath: 'https://image.tmdb.org/t/p/original/ywSfsLZ3JgGzM4kJfRgrzVjcbsI.jpg',
    url: 'https://www.voot.com/',
    redirectLink: 'voot://title/',
  },
  {
    id: 'aha',
    name: 'Aha',
    logoPath: 'https://image.tmdb.org/t/p/original/nCzwm4YLuXV7jM5gPOGqRGZ3Y46.jpg',
    url: 'https://www.aha.video/',
    redirectLink: 'aha://title/',
  },
  {
    id: 'hulu',
    name: 'Hulu',
    logoPath: 'https://image.tmdb.org/t/p/original/giwM8XX4V2AQb9vsoN7yti82tKK.jpg',
    url: 'https://www.hulu.com/',
    redirectLink: 'hulu://title/',
  },
  {
    id: 'disney',
    name: 'Disney+',
    logoPath: 'https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg',
    url: 'https://www.disneyplus.com/',
    redirectLink: 'disneyplus://title/',
  },
  {
    id: 'hbomax',
    name: 'HBO Max',
    logoPath: 'https://image.tmdb.org/t/p/original/aS2zvJWn9mwiCOeaaCkIh4wleZS.jpg',
    url: 'https://www.hbomax.com/',
    redirectLink: 'hbomax://title/',
  },
  {
    id: 'appletv',
    name: 'Apple TV+',
    logoPath: 'https://image.tmdb.org/t/p/original/6uhKBfmtzFqOcLousHwZuzcrScK.jpg',
    url: 'https://tv.apple.com/',
    redirectLink: 'appletv://title/',
  }
];

// Mock Content
export const mockContents: Content[] = [
  // Movies
  {
    id: 'movie-1',
    title: 'Inception',
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    posterPath: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    releaseDate: '2010-07-16',
    type: 'movie',
    genres: ['Action', 'Science Fiction', 'Adventure'],
    rating: 8.4,
    duration: '2h 28m',
    status: 'Released',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    watchProviders: [watchProviders[0], watchProviders[1]],
    cast: [
      { id: 'person-1', name: 'Leonardo DiCaprio', character: 'Dom Cobb', profilePath: 'https://image.tmdb.org/t/p/w500/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg' },
      { id: 'person-2', name: 'Joseph Gordon-Levitt', character: 'Arthur', profilePath: 'https://image.tmdb.org/t/p/w500/1P2FLQXgbXeIla5Y3JzKRov3ASF.jpg' },
      { id: 'person-3', name: 'Ellen Page', character: 'Ariadne', profilePath: 'https://image.tmdb.org/t/p/w500/8G8V1E5Gw0pU3a4hCbyTyxOxuS7.jpg' },
      { id: 'person-4', name: 'Tom Hardy', character: 'Eames', profilePath: 'https://image.tmdb.org/t/p/w500/d81K0RH8UX7tZj49tZaQhZ9ewH.jpg' },
    ],
  },
  {
    id: 'movie-2',
    title: 'The Shawshank Redemption',
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    posterPath: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    releaseDate: '1994-09-23',
    type: 'movie',
    genres: ['Drama', 'Crime'],
    rating: 8.7,
    duration: '2h 22m',
    status: 'Released',
    watchProviders: [watchProviders[1], watchProviders[4]],
  },
  {
    id: 'movie-3',
    title: 'Pulp Fiction',
    overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    posterPath: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    releaseDate: '1994-09-10',
    type: 'movie',
    genres: ['Thriller', 'Crime'],
    rating: 8.5,
    duration: '2h 34m',
    status: 'Released',
    watchProviders: [watchProviders[2], watchProviders[0]],
  },
  {
    id: 'movie-4',
    title: 'The Dark Knight',
    overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterPath: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    releaseDate: '2008-07-18',
    type: 'movie',
    genres: ['Action', 'Crime', 'Drama', 'Thriller'],
    rating: 9.0,
    duration: '2h 32m',
    status: 'Released',
    watchProviders: [watchProviders[3], watchProviders[1]],
  },
  {
    id: 'movie-5',
    title: 'Interstellar',
    overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    posterPath: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    releaseDate: '2014-11-07',
    type: 'movie',
    genres: ['Adventure', 'Drama', 'Science Fiction'],
    rating: 8.4,
    duration: '2h 49m',
    status: 'Released',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    watchProviders: [watchProviders[0], watchProviders[2], watchProviders[3]],
  },
  {
    id: 'movie-6',
    title: 'Parasite',
    overview: 'All unemployed, Ki-taek and his family take peculiar interest in the wealthy and glamorous Parks, as they ingratiate themselves into their lives and get entangled in an unexpected incident.',
    posterPath: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/ApiBzeaa95TNYliSbQ8pJv4Fje7.jpg',
    releaseDate: '2019-05-30',
    type: 'movie',
    genres: ['Comedy', 'Thriller', 'Drama'],
    rating: 8.6,
    duration: '2h 12m',
    status: 'Released',
    watchProviders: [watchProviders[4], watchProviders[5]],
  },
  
  // TV Shows
  {
    id: 'tv-1',
    title: 'Breaking Bad',
    overview: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
    posterPath: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    releaseDate: '2008-01-20',
    type: 'tv',
    genres: ['Drama', 'Crime'],
    rating: 8.8,
    status: 'Ended',
    trailerUrl: 'https://www.youtube.com/watch?v=HhesaQXLuRY',
    watchProviders: [watchProviders[0], watchProviders[4]],
    seasons: generateSeasons('tv-1', 5),
  },
  {
    id: 'tv-2',
    title: 'Game of Thrones',
    overview: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    posterPath: 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg',
    releaseDate: '2011-04-17',
    type: 'tv',
    genres: ['Drama', 'Action & Adventure', 'Sci-Fi & Fantasy'],
    rating: 8.3,
    status: 'Ended',
    watchProviders: [watchProviders[4], watchProviders[1]],
    seasons: generateSeasons('tv-2', 8),
  },
  {
    id: 'tv-3',
    title: 'Stranger Things',
    overview: 'When a young boy disappears, his mother, a police chief, and his friends must confront terrifying supernatural forces in order to get him back.',
    posterPath: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    releaseDate: '2016-07-15',
    type: 'tv',
    genres: ['Drama', 'Sci-Fi & Fantasy', 'Mystery'],
    rating: 8.5,
    status: 'Returning Series',
    trailerUrl: 'https://www.youtube.com/watch?v=b9EkMc79ZSU',
    watchProviders: [watchProviders[0]],
    seasons: generateSeasons('tv-3', 4),
  },
  {
    id: 'tv-4',
    title: 'The Mandalorian',
    overview: 'After the fall of the Galactic Empire, a lone gunfighter makes his way through the lawless galaxy.',
    posterPath: 'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/o7qi2v4uWQ8bZ1tW3KI0Ztn2epk.jpg',
    releaseDate: '2019-11-12',
    type: 'tv',
    genres: ['Sci-Fi & Fantasy', 'Action & Adventure', 'Western'],
    rating: 8.4,
    status: 'Returning Series',
    watchProviders: [watchProviders[3]],
    seasons: generateSeasons('tv-4', 3),
  },
  {
    id: 'tv-5',
    title: 'The Office',
    overview: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.',
    posterPath: 'https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/vNpuAxGTl9HsUbHqam4L0YjInQU.jpg',
    releaseDate: '2005-03-24',
    type: 'tv',
    genres: ['Comedy'],
    rating: 8.5,
    status: 'Ended',
    watchProviders: [watchProviders[2], watchProviders[0]],
    seasons: generateSeasons('tv-5', 9),
  },
  {
    id: 'tv-6',
    title: 'The Crown',
    overview: 'The gripping, decades-spanning inside story of Her Majesty Queen Elizabeth II and the Prime Ministers who shaped Britain\'s post-war destiny.',
    posterPath: 'https://image.tmdb.org/t/p/w500/su8z9xxiW7pVkn43N7kP3kEjpeA.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/original/YfsmIHirxwmk3rvbHuQEAHUQnZ.jpg',
    releaseDate: '2016-11-04',
    type: 'tv',
    genres: ['Drama'],
    rating: 8.2,
    status: 'Returning Series',
    watchProviders: [watchProviders[0]],
    seasons: generateSeasons('tv-6', 5),
  },
];

// Mock Categories
export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Trending Now',
    contents: [
      mockContents[0],
      mockContents[6], 
      mockContents[2], 
      mockContents[8],
      mockContents[4], 
      mockContents[10],
    ]
  },
  {
    id: 'cat-2',
    name: 'Top Rated Movies',
    contents: mockContents.filter(content => content.type === 'movie' && content.rating > 8.5)
  },
  {
    id: 'cat-3',
    name: 'Popular TV Shows',
    contents: mockContents.filter(content => content.type === 'tv')
  },
  {
    id: 'cat-4',
    name: 'New Releases',
    contents: mockContents.filter(content => {
      const releaseDate = new Date(content.releaseDate || '');
      return releaseDate.getFullYear() >= 2019;
    })
  }
];
