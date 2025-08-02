-- Drop existing restrictive policies and create simpler ones
DROP POLICY IF EXISTS "Only authenticated users can manage ads" ON public.ads;
DROP POLICY IF EXISTS "Only authenticated users can view ads" ON public.ads;
DROP POLICY IF EXISTS "Only authenticated users can manage ad settings" ON public.ad_settings;
DROP POLICY IF EXISTS "Only authenticated users can view ad settings" ON public.ad_settings;

-- Create more permissive policies for now (can be made more restrictive later)
CREATE POLICY "Authenticated users can manage ads"
ON public.ads
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage ad settings" 
ON public.ad_settings
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Insert default ad_settings record if none exists
INSERT INTO public.ad_settings (auto_ads_enabled, auto_ads_client_id)
SELECT false, null
WHERE NOT EXISTS (SELECT 1 FROM public.ad_settings);