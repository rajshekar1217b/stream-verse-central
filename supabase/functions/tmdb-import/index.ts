
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    console.log('TMDB Import request:', { tmdbId, type })

    if (!TMDB_API_KEY) {
      console.error('TMDB API key not found in environment')
      return new Response(
        JSON.stringify({ 
          error: 'TMDB API key not configured. Please add your TMDB_API_KEY to Supabase secrets.' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!tmdbId || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing tmdbId or type parameter' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Fetching basic data from TMDB...')
    
    // Fetch basic movie/TV show data
    const basicResponse = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`
    )
    
    if (!basicResponse.ok) {
      console.error('TMDB API error:', basicResponse.status, basicResponse.statusText)
      const errorText = await basicResponse.text()
      console.error('TMDB API error response:', errorText)
      
      return new Response(
        JSON.stringify({ 
          error: `TMDB API error: ${basicResponse.status} - ${basicResponse.statusText}. Please check your TMDB ID and try again.` 
        }),
        { 
          status: basicResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const basicData = await basicResponse.json()
    console.log('Basic data fetched:', basicData.title || basicData.name)

    // Fetch additional data in parallel with better error handling
    const fetchWithFallback = async (url: string) => {
      try {
        const response = await fetch(url)
        return response.ok ? await response.json() : null
      } catch (error) {
        console.warn('Failed to fetch from:', url, error)
        return null
      }
    }

    console.log('Fetching additional data...')
    const [creditsData, imagesData, videosData, watchProvidersData] = await Promise.all([
      fetchWithFallback(`https://api.themoviedb.org/3/${type}/${tmdbId}/credits?api_key=${TMDB_API_KEY}`),
      fetchWithFallback(`https://api.themoviedb.org/3/${type}/${tmdbId}/images?api_key=${TMDB_API_KEY}`),
      fetchWithFallback(`https://api.themoviedb.org/3/${type}/${tmdbId}/videos?api_key=${TMDB_API_KEY}&language=en-US`),
      fetchWithFallback(`https://api.themoviedb.org/3/${type}/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`)
    ])

    console.log('Additional data fetched')

    // Process seasons for TV shows
    let seasons = []
    if (type === 'tv' && basicData.seasons) {
      console.log('Processing TV seasons...')
      const seasonPromises = basicData.seasons
        .filter((season: any) => season.season_number > 0)
        .slice(0, 10) // Limit to first 10 seasons
        .map(async (season: any) => {
          return await fetchWithFallback(
            `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season.season_number}?api_key=${TMDB_API_KEY}&language=en-US`
          )
        })
      
      const seasonResults = await Promise.all(seasonPromises)
      seasons = seasonResults.filter(Boolean)
      console.log(`Processed ${seasons.length} seasons`)
    }

    // Get trailer URL
    const trailerVideo = videosData?.results?.find((v: any) => 
      v.type === 'Trailer' && v.site === 'YouTube'
    )
    const trailerUrl = trailerVideo 
      ? `https://www.youtube.com/watch?v=${trailerVideo.key}`
      : ''

    // Process watch providers (focus on US market)
    const usProviders = watchProvidersData?.results?.US
    const watchProviders = []
    
    if (usProviders) {
      const allProviders = [
        ...(usProviders.flatrate || []),
        ...(usProviders.rent || []),
        ...(usProviders.buy || [])
      ]
      
      // Remove duplicates and limit to 8 providers
      const uniqueProviders = Array.from(
        new Map(allProviders.map(p => [p.provider_id, p])).values()
      ).slice(0, 8)
      
      watchProviders.push(...uniqueProviders.map((provider: any) => ({
        id: provider.provider_id?.toString(),
        name: provider.provider_name,
        logoPath: `https://image.tmdb.org/t/p/w500${provider.logo_path}`,
        url: `https://${provider.provider_name.toLowerCase().replace(/\s+/g, '')}.com`,
        redirectLink: `https://${provider.provider_name.toLowerCase().replace(/\s+/g, '')}.com`
      })))
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
      trailerUrl: trailerUrl,
      duration: type === 'movie' ? (basicData.runtime ? `${basicData.runtime}min` : '') : undefined,
      status: basicData.status || (type === 'tv' ? 'Returning Series' : 'Released'),
      watchProviders: watchProviders,
      cast: creditsData?.cast?.slice(0, 15).map((person: any) => ({
        id: person.id?.toString(),
        name: person.name,
        character: person.character,
        profilePath: person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : undefined
      })) || [],
      images: [
        ...(imagesData?.posters?.slice(0, 8).map((img: any) => ({
          path: `https://image.tmdb.org/t/p/w500${img.file_path}`,
          type: 'poster'
        })) || []),
        ...(imagesData?.backdrops?.slice(0, 8).map((img: any) => ({
          path: `https://image.tmdb.org/t/p/original${img.file_path}`,
          type: 'backdrop'
        })) || [])
      ],
      embedVideos: videosData?.results?.slice(0, 5).map((video: any) => ({
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

    console.log('Successfully processed TMDB data for:', formattedData.title)

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
      JSON.stringify({ 
        error: `Import failed: ${error.message || 'Unknown error occurred'}. Please check your TMDB ID and try again.` 
      }),
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
