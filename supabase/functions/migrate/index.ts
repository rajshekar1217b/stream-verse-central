
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
