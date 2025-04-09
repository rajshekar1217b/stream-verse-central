
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kadhyyqdiuustimubfzv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZGh5eXFkaXV1c3RpbXViZnp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNzI1OTQsImV4cCI6MjA1OTY0ODU5NH0.zRZfZHbA-mvv8pEo-Q7SmZTOBfXXM0tUfVMJRtwPCBA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Helper to convert our app types to Json type
export type Json = Database['public']['Tables']['contents']['Insert']['cast_info'];

// Helper function to convert our app types to Json type for Supabase
export function toJson<T>(data: T): Json {
  return data as unknown as Json;
}
