
import { Content, Category } from '@/types';

// Mock content data for initial display
export const mockContents: Content[] = [
  {
    id: "1",
    title: "Stranger Things",
    overview: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
    posterPath: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    releaseDate: "2016-07-15",
    type: "tv",
    genres: ["Drama", "Fantasy", "Sci-Fi"],
    rating: 8.6,
    watchProviders: [
      {
        id: "1",
        name: "Netflix",
        logoPath: "https://image.tmdb.org/t/p/w500/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg",
        url: "https://www.netflix.com/",
      }
    ],
  },
  {
    id: "2",
    title: "The Witcher",
    overview: "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.",
    posterPath: "https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/hQW4dwXiUFVf6LiLzA9YGbzl4AF.jpg",
    releaseDate: "2019-12-20",
    type: "tv",
    genres: ["Action", "Adventure", "Fantasy"],
    rating: 8.2,
    watchProviders: [
      {
        id: "1",
        name: "Netflix",
        logoPath: "https://image.tmdb.org/t/p/w500/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg",
        url: "https://www.netflix.com/",
      }
    ],
  },
  {
    id: "3",
    title: "Dune",
    overview: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
    posterPath: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/zSJZ1w3y50Lk0IgRZNrVplq0Ifk.jpg",
    releaseDate: "2021-10-22",
    type: "movie",
    genres: ["Action", "Adventure", "Sci-Fi"],
    rating: 8.0,
    watchProviders: [
      {
        id: "2",
        name: "HBO Max",
        logoPath: "https://image.tmdb.org/t/p/w500/aS2zvJWn9mwiCOeaaCkIh4wleZS.jpg",
        url: "https://www.hbomax.com/",
      }
    ],
  },
  {
    id: "4",
    title: "The Mandalorian",
    overview: "After the fall of the Galactic Empire, lawlessness has spread throughout the galaxy. A lone gunfighter makes his way through the outer reaches, earning his keep as a bounty hunter.",
    posterPath: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/6RIVvzj4A6DbaIifmUyGAQQ4B9v.jpg", 
    releaseDate: "2019-11-12",
    type: "tv",
    genres: ["Action", "Adventure", "Sci-Fi"],
    rating: 8.5,
    watchProviders: [
      {
        id: "3",
        name: "Disney+",
        logoPath: "https://image.tmdb.org/t/p/w500/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg",
        url: "https://www.disneyplus.com/",
      }
    ],
  },
  {
    id: "5",
    title: "Avengers: Endgame",
    overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
    posterPath: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    releaseDate: "2019-04-26",
    type: "movie",
    genres: ["Action", "Adventure", "Sci-Fi"],
    rating: 8.4,
    watchProviders: [
      {
        id: "3",
        name: "Disney+",
        logoPath: "https://image.tmdb.org/t/p/w500/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg",
        url: "https://www.disneyplus.com/",
      }
    ],
  },
  {
    id: "6",
    title: "The Queen's Gambit",
    overview: "In a Kentucky orphanage in the 1950s, a young girl discovers an astonishing talent for chess while struggling with addiction.",
    posterPath: "https://image.tmdb.org/t/p/w500/zU0htwkhNvBQdVSIKB9s6hgVeFK.jpg",
    backdropPath: "https://image.tmdb.org/t/p/original/34OGjFEbHj0E3lE2w0iTUVq0CBz.jpg",
    releaseDate: "2020-10-23",
    type: "tv",
    genres: ["Drama"],
    rating: 8.6,
    watchProviders: [
      {
        id: "1",
        name: "Netflix",
        logoPath: "https://image.tmdb.org/t/p/w500/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg",
        url: "https://www.netflix.com/",
      }
    ],
  },
];

// Categories
export const mockCategories: Category[] = [
  {
    id: "trending",
    name: "Trending Now",
    contents: mockContents.slice(0, 6),
  },
  {
    id: "popular",
    name: "Popular on StreamVerse",
    contents: mockContents.slice(0, 6).reverse(),
  },
  {
    id: "action",
    name: "Action & Adventure",
    contents: mockContents.filter(content => 
      content.genres.includes("Action") || content.genres.includes("Adventure")),
  },
  {
    id: "drama",
    name: "Drama",
    contents: mockContents.filter(content => 
      content.genres.includes("Drama")),
  },
  {
    id: "scifi",
    name: "Sci-Fi & Fantasy",
    contents: mockContents.filter(content => 
      content.genres.includes("Sci-Fi") || content.genres.includes("Fantasy")),
  },
];

// Watch Providers
export const watchProviders = [
  {
    id: "1",
    name: "Netflix",
    logoPath: "https://image.tmdb.org/t/p/w500/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg",
    url: "https://www.netflix.com/",
  },
  {
    id: "2", 
    name: "HBO Max",
    logoPath: "https://image.tmdb.org/t/p/w500/aS2zvJWn9mwiCOeaaCkIh4wleZS.jpg",
    url: "https://www.hbomax.com/",
  },
  {
    id: "3",
    name: "Disney+",
    logoPath: "https://image.tmdb.org/t/p/w500/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg",
    url: "https://www.disneyplus.com/",
  },
  {
    id: "4",
    name: "Amazon Prime Video",
    logoPath: "https://image.tmdb.org/t/p/w500/68MNrwlkpF7WnmNPXLah69CR5cb.jpg",
    url: "https://www.primevideo.com/",
  },
];
