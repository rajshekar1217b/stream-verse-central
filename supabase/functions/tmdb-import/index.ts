
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const tmdbApiKey = Deno.env.get('TMDB_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!tmdbApiKey) {
      throw new Error('TMDB API key not configured');
    }

    const { tmdbId, type } = await req.json();
    
    if (!tmdbId || !type) {
      throw new Error('TMDB ID and type are required');
    }

    console.log(`Importing ${type} with TMDB ID: ${tmdbId}`);

    // Fetch basic details with videos
    const detailsUrl = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${tmdbApiKey}&append_to_response=videos`;
    const detailsResponse = await fetch(detailsUrl);
    
    if (!detailsResponse.ok) {
      throw new Error(`TMDB API error: ${detailsResponse.status}`);
    }
    
    const details = await detailsResponse.json();

    // Fetch credits (cast and crew)
    const creditsUrl = `https://api.themoviedb.org/3/${type}/${tmdbId}/credits?api_key=${tmdbApiKey}`;
    const creditsResponse = await fetch(creditsUrl);
    const credits = await creditsResponse.json();

    // Fetch images (posters and backdrops)
    const imagesUrl = `https://api.themoviedb.org/3/${type}/${tmdbId}/images?api_key=${tmdbApiKey}`;
    const imagesResponse = await fetch(imagesUrl);
    const images = await imagesResponse.json();

    // Fetch watch providers
    const watchProvidersUrl = `https://api.themoviedb.org/3/${type}/${tmdbId}/watch/providers?api_key=${tmdbApiKey}`;
    const watchProvidersResponse = await fetch(watchProvidersUrl);
    const watchProviders = await watchProvidersResponse.json();

    // For TV shows, fetch seasons and episodes
    let seasons = [];
    if (type === 'tv' && details.seasons) {
      for (const season of details.seasons) {
        if (season.season_number >= 0) {
          try {
            const seasonUrl = `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season.season_number}?api_key=${tmdbApiKey}`;
            const seasonResponse = await fetch(seasonUrl);
            
            if (seasonResponse.ok) {
              const seasonDetails = await seasonResponse.json();
              
              seasons.push({
                id: `season-${season.season_number}`,
                name: season.name,
                seasonNumber: season.season_number,
                episodeCount: season.episode_count,
                posterPath: season.poster_path ? `https://image.tmdb.org/t/p/w500${season.poster_path}` : null,
                airDate: season.air_date,
                overview: season.overview,
                episodes: seasonDetails.episodes?.map((episode) => ({
                  id: `episode-${episode.id}`,
                  title: episode.name,
                  episodeNumber: episode.episode_number,
                  overview: episode.overview,
                  airDate: episode.air_date,
                  duration: episode.runtime ? `${episode.runtime}min` : undefined,
                  rating: episode.vote_average,
                  stillPath: episode.still_path ? `https://image.tmdb.org/t/p/w500${episode.still_path}` : null
                })) || []
              });
            }
          } catch (error) {
            console.error(`Error fetching season ${season.season_number}:`, error);
          }
        }
      }
    }

    // Process cast information
    const cast = credits.cast?.slice(0, 20).map((person) => ({
      id: person.id.toString(),
      name: person.name,
      character: person.character,
      profilePath: person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : null
    })) || [];

    // Process images
    const processedImages = [];
    
    // Add posters
    if (images.posters) {
      images.posters.slice(0, 10).forEach((poster) => {
        processedImages.push({
          path: `https://image.tmdb.org/t/p/w500${poster.file_path}`,
          type: 'poster'
        });
      });
    }
    
    // Add backdrops
    if (images.backdrops) {
      images.backdrops.slice(0, 10).forEach((backdrop) => {
        processedImages.push({
          path: `https://image.tmdb.org/t/p/w1280${backdrop.file_path}`,
          type: 'backdrop'
        });
      });
    }

    // Process trailers and videos
    const embedVideos = [];
    if (details.videos?.results) {
      details.videos.results
        .filter((video) => video.site === 'YouTube')
        .slice(0, 5)
        .forEach((video) => {
          embedVideos.push({
            url: `https://www.youtube.com/watch?v=${video.key}`,
            title: video.name
          });
        });
    }

    // Process watch providers (US market)
    const processedWatchProviders = [];
    const usProviders = watchProviders.results?.US;
    
    if (usProviders?.flatrate) {
      usProviders.flatrate.forEach((provider) => {
        processedWatchProviders.push({
          id: provider.provider_id.toString(),
          name: provider.provider_name,
          logoPath: `https://image.tmdb.org/t/p/w92${provider.logo_path}`,
          url: usProviders.link || `https://www.${provider.provider_name.toLowerCase().replace(/\s+/g, '')}.com`
        });
      });
    }

    if (usProviders?.rent) {
      usProviders.rent.forEach((provider) => {
        processedWatchProviders.push({
          id: `rent-${provider.provider_id}`,
          name: `${provider.provider_name} (Rent)`,
          logoPath: `https://image.tmdb.org/t/p/w92${provider.logo_path}`,
          url: usProviders.link || `https://www.${provider.provider_name.toLowerCase().replace(/\s+/g, '')}.com`
        });
      });
    }

    if (usProviders?.buy) {
      usProviders.buy.forEach((provider) => {
        processedWatchProviders.push({
          id: `buy-${provider.provider_id}`,
          name: `${provider.provider_name} (Buy)`,
          logoPath: `https://image.tmdb.org/t/p/w92${provider.logo_path}`,
          url: usProviders.link || `https://www.${provider.provider_name.toLowerCase().replace(/\s+/g, '')}.com`
        });
      });
    }

    // Get the main trailer
    const mainTrailer = details.videos?.results?.find((video) => 
      video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Official Trailer')
    );

    const contentData = {
      id: `tmdb-${tmdbId}-${type}`,
      title: details.title || details.name,
      overview: details.overview || '',
      posterPath: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : '',
      backdropPath: details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : '',
      releaseDate: details.release_date || details.first_air_date || '',
      type: type,
      genres: details.genres?.map((genre) => genre.name) || [],
      rating: details.vote_average || 0,
      trailerUrl: mainTrailer ? `https://www.youtube.com/watch?v=${mainTrailer.key}` : '',
      duration: type === 'movie' 
        ? (details.runtime ? `${details.runtime}min` : '')
        : (details.episode_run_time?.length ? `${details.episode_run_time[0]}min per episode` : ''),
      status: details.status || '',
      watchProviders: processedWatchProviders,
      cast: cast,
      images: processedImages,
      embedVideos: embedVideos,
      seasons: seasons
    };

    console.log(`Successfully processed ${type}: ${contentData.title}`);

    return new Response(JSON.stringify(contentData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('TMDB import error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to import from TMDB',
        details: error.toString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
