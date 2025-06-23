
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tmdbId, type } = await req.json()
    const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY')

    if (!TMDB_API_KEY) {
      throw new Error('TMDB API key not configured')
    }

    // Fetch basic movie/TV show data
    const basicResponse = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}`
    )
    
    if (!basicResponse.ok) {
      throw new Error(`TMDB API error: ${basicResponse.status}`)
    }
    
    const basicData = await basicResponse.json()

    // Fetch additional data in parallel
    const [creditsResponse, imagesResponse, videosResponse, watchProvidersResponse] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/credits?api_key=${TMDB_API_KEY}`),
      fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/images?api_key=${TMDB_API_KEY}`),
      fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/videos?api_key=${TMDB_API_KEY}`),
      fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`)
    ])

    const [creditsData, imagesData, videosData, watchProvidersData] = await Promise.all([
      creditsResponse.ok ? creditsResponse.json() : { cast: [] },
      imagesResponse.ok ? imagesResponse.json() : { posters: [], backdrops: [] },
      videosResponse.ok ? videosResponse.json() : { results: [] },
      watchProvidersResponse.ok ? watchProvidersResponse.json() : { results: {} }
    ])

    // Process seasons for TV shows
    let seasons = []
    if (type === 'tv' && basicData.seasons) {
      const seasonPromises = basicData.seasons
        .filter((season: any) => season.season_number > 0)
        .slice(0, 5) // Limit to first 5 seasons
        .map(async (season: any) => {
          try {
            const seasonResponse = await fetch(
              `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season.season_number}?api_key=${TMDB_API_KEY}`
            )
            return seasonResponse.ok ? seasonResponse.json() : null
          } catch {
            return null
          }
        })
      
      const seasonResults = await Promise.all(seasonPromises)
      seasons = seasonResults.filter(Boolean)
    }

    // Format the response
    const formattedData = {
      id: `tmdb-${tmdbId}-${type}`,
      title: basicData.title || basicData.name,
      overview: basicData.overview || '',
      posterPath: basicData.poster_path ? `https://image.tmdb.org/t/p/w500${basicData.poster_path}` : '',
      backdropPath: basicData.backdrop_path ? `https://image.tmdb.org/t/p/original${basicData.backdrop_path}` : '',
      releaseDate: basicData.release_date || basicData.first_air_date || '',
      type: type,
      genres: basicData.genres?.map((g: any) => g.name) || [],
      rating: basicData.vote_average || 0,
      trailerUrl: videosData.results?.find((v: any) => v.type === 'Trailer')?.key 
        ? `https://www.youtube.com/watch?v=${videosData.results.find((v: any) => v.type === 'Trailer').key}`
        : '',
      duration: type === 'movie' ? `${basicData.runtime}min` : undefined,
      status: basicData.status || (type === 'tv' ? 'Returning Series' : 'Released'),
      watchProviders: Object.values(watchProvidersData.results?.US?.flatrate || [])
        .slice(0, 5)
        .map((provider: any) => ({
          id: provider.provider_id?.toString(),
          name: provider.provider_name,
          logoPath: `https://image.tmdb.org/t/p/w500${provider.logo_path}`,
          url: `https://${provider.provider_name.toLowerCase().replace(/\s+/g, '')}.com`,
          redirectLink: `https://${provider.provider_name.toLowerCase().replace(/\s+/g, '')}.com`
        })),
      cast: creditsData.cast?.slice(0, 10).map((person: any) => ({
        id: person.id?.toString(),
        name: person.name,
        character: person.character,
        profilePath: person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : undefined
      })) || [],
      images: [
        ...imagesData.posters?.slice(0, 5).map((img: any) => ({
          path: `https://image.tmdb.org/t/p/w500${img.file_path}`,
          type: 'poster'
        })) || [],
        ...imagesData.backdrops?.slice(0, 5).map((img: any) => ({
          path: `https://image.tmdb.org/t/p/original${img.file_path}`,
          type: 'backdrop'
        })) || []
      ],
      embedVideos: videosData.results?.slice(0, 3).map((video: any) => ({
        url: `https://www.youtube.com/watch?v=${video.key}`,
        title: video.name
      })) || [],
      seasons: seasons.map((season: any) => ({
        id: `${tmdbId}-s${season.season_number}`,
        name: season.name,
        seasonNumber: season.season_number,
        episodeCount: season.episodes?.length || 0,
        posterPath: season.poster_path ? `https://image.tmdb.org/t/p/w500${season.poster_path}` : undefined,
        airDate: season.air_date,
        overview: season.overview,
        episodes: season.episodes?.map((episode: any) => ({
          id: `${tmdbId}-s${season.season_number}-e${episode.episode_number}`,
          title: episode.name,
          overview: episode.overview,
          episodeNumber: episode.episode_number,
          airDate: episode.air_date,
          duration: episode.runtime ? `${episode.runtime}min` : undefined,
          rating: episode.vote_average,
          stillPath: episode.still_path ? `https://image.tmdb.org/t/p/w500${episode.still_path}` : undefined
        })) || []
      }))
    }

    return new Response(
      JSON.stringify(formattedData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('TMDB import error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
