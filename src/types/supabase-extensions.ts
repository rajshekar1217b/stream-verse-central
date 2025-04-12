
import { Database } from "@/integrations/supabase/types";

// Extend the Database type to include our new tables and functions
export type ExtendedDatabase = Database & {
  public: {
    Tables: Database["public"]["Tables"] & {
      comments: {
        Row: {
          id: string;
          content_id: string;
          user_name: string;
          user_email: string;
          comment_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          content_id: string;
          user_name: string;
          user_email: string;
          comment_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          content_id?: string;
          user_name?: string;
          user_email?: string;
          comment_text?: string;
          created_at?: string;
        };
      };
      content_views: {
        Row: {
          id: string;
          content_id: string;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          content_id: string;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          content_id?: string;
          viewed_at?: string;
        };
      };
      email_subscribers: {
        Row: {
          id: string;
          email: string;
          subscribed_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          subscribed_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          subscribed_at?: string;
          is_active?: boolean;
        };
      };
    };
    Functions: Database["public"]["Functions"] & {
      get_content_view_stats: {
        Args: Record<string, never>;
        Returns: {
          content_id: string;
          title: string;
          view_count: number;
        }[];
      };
      get_content_type_stats: {
        Args: Record<string, never>;
        Returns: {
          type: string;
          count: number;
        }[];
      };
    };
  };
};

// Create an extended Supabase client type
import { SupabaseClient } from "@supabase/supabase-js";
export type TypedSupabaseClient = SupabaseClient<ExtendedDatabase>;

// Helper function to cast the regular supabase client to our extended type
import { supabase as originalSupabase } from "@/integrations/supabase/client";
export const supabase = originalSupabase as unknown as TypedSupabaseClient;
