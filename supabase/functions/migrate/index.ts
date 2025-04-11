
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Creating database migration function");

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceRole) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    
    console.log("Running database migration");

    // Create contents table
    const { error: contentsError } = await supabase.rpc("create_contents_table");
    if (contentsError) {
      console.error("Error creating contents table:", contentsError);
      throw contentsError;
    }
    
    // Create categories table
    const { error: categoriesError } = await supabase.rpc("create_categories_table");
    if (categoriesError) {
      console.error("Error creating categories table:", categoriesError);
      throw categoriesError;
    }
    
    // Create category_contents table
    const { error: categoryContentsError } = await supabase.rpc("create_category_contents_table");
    if (categoryContentsError) {
      console.error("Error creating category_contents table:", categoryContentsError);
      throw categoryContentsError;
    }
    
    // Create initial categories
    const { error: seedError } = await supabase.rpc("seed_initial_categories");
    if (seedError) {
      console.error("Error seeding initial categories:", seedError);
      throw seedError;
    }
    
    // Create analytics functions
    const createViewStatsFunc = `
      CREATE OR REPLACE FUNCTION public.get_content_view_stats()
      RETURNS TABLE (
        content_id TEXT,
        title TEXT,
        view_count BIGINT
      ) LANGUAGE sql SECURITY DEFINER AS $$
        SELECT
          cv.content_id,
          c.title,
          COUNT(*) as view_count
        FROM
          content_views cv
          JOIN contents c ON cv.content_id = c.id
        GROUP BY
          cv.content_id, c.title
        ORDER BY
          view_count DESC;
      $$;
    `;
    
    const createTypeStatsFunc = `
      CREATE OR REPLACE FUNCTION public.get_content_type_stats()
      RETURNS TABLE (
        type TEXT,
        count BIGINT
      ) LANGUAGE sql SECURITY DEFINER AS $$
        SELECT
          type,
          COUNT(*) as count
        FROM
          contents
        GROUP BY
          type
        ORDER BY
          count DESC;
      $$;
    `;
    
    console.log("Creating analytics functions");
    const { error: viewStatsError } = await supabase.rpc("get_content_view_stats");
    if (viewStatsError && viewStatsError.code !== "42883") {
      // If error is not "function does not exist", then it's an unexpected error
      if (viewStatsError.code === "42883") {
        // Create the function if it doesn't exist
        const { error } = await supabase.sql(createViewStatsFunc);
        if (error) {
          console.error("Error creating view stats function:", error);
          throw error;
        }
      } else {
        console.error("Error checking view stats function:", viewStatsError);
        throw viewStatsError;
      }
    }
    
    const { error: typeStatsError } = await supabase.rpc("get_content_type_stats");
    if (typeStatsError && typeStatsError.code !== "42883") {
      // If error is not "function does not exist", then it's an unexpected error
      if (typeStatsError.code === "42883") {
        // Create the function if it doesn't exist
        const { error } = await supabase.sql(createTypeStatsFunc);
        if (error) {
          console.error("Error creating type stats function:", error);
          throw error;
        }
      } else {
        console.error("Error checking type stats function:", typeStatsError);
        throw typeStatsError;
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Database migration completed successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error("Migration error:", error);
    
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
