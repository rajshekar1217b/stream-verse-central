
import { supabase } from '@/types/supabase-extensions';

// Function to ensure the necessary database structure exists
export const ensureDatabaseStructure = async () => {
  try {
    // Check if the embed_videos and images columns exist in the contents table
    const { data: columnsInfo, error } = await supabase
      .from('contents')
      .select('embed_videos, images')
      .limit(1);
    
    console.log("Database structure check result:", columnsInfo, error);

    // If there's an error about missing columns, we need to run migrations
    if (error && error.message && (
      error.message.includes("embed_videos") || error.message.includes("images")
    )) {
      console.log("Need to add missing columns to contents table");
      
      // You would typically add migrations here, but in this example,
      // we'll assume they're added through the Supabase dashboard or migrations
      
      console.warn("Please add missing columns to the contents table through the Supabase dashboard:");
      console.warn("1. embed_videos: jsonb (nullable)");
      console.warn("2. images: jsonb (nullable)");
    }
    
    return true;
  } catch (error) {
    console.error("Error checking database structure:", error);
    return false;
  }
};
