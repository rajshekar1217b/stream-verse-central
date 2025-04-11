
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  contentId: string;
  contentTitle: string;
  contentType: 'movie' | 'tv';
  contentPosterUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceRole) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    
    // Parse request body
    const { contentId, contentTitle, contentType, contentPosterUrl } = await req.json() as NotifyRequest;
    
    if (!contentId || !contentTitle || !contentType) {
      throw new Error("Required fields missing");
    }
    
    // Get all active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('email_subscribers')
      .select('email')
      .eq('is_active', true);
      
    if (subscribersError) {
      throw subscribersError;
    }
    
    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No subscribers to notify" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }
    
    // In a real application, you would use a service like SendGrid, MailChimp, etc.
    // to actually send the emails. For this example, we'll just log the action.
    console.log(`Would send notification about new ${contentType} "${contentTitle}" to ${subscribers.length} subscribers`);
    
    // For each subscriber, we would send an email
    const emailsSent = subscribers.map((subscriber) => {
      // This is where the email sending would happen
      console.log(`Notification email would be sent to: ${subscriber.email}`);
      return subscriber.email;
    });
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Notification about "${contentTitle}" would be sent to ${emailsSent.length} subscribers` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
    
  } catch (error) {
    console.error("Error sending notifications:", error);
    
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
