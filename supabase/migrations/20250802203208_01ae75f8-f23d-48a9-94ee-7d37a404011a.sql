-- Fix RLS policies for ads and ad_settings tables

-- Create admin-only policies for ads table
CREATE POLICY "Admins can manage ads" 
ON public.ads 
USING (auth.uid() IN (
  SELECT user_id FROM public.admin_users WHERE is_active = true
));

-- Create admin-only policies for ad_settings table  
CREATE POLICY "Admins can manage ad settings"
ON public.ad_settings
USING (auth.uid() IN (
  SELECT user_id FROM public.admin_users WHERE is_active = true
));

-- Insert default ad_settings record if none exists
INSERT INTO public.ad_settings (auto_ads_enabled, auto_ads_client_id)
SELECT false, null
WHERE NOT EXISTS (SELECT 1 FROM public.ad_settings);