-- Re-enable RLS and create permissive policies for the custom auth system
-- Since the app uses custom PIN authentication, we'll allow all operations for now
-- but maintain RLS structure for future security improvements

-- Re-enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_settings ENABLE ROW LEVEL SECURITY;

-- Create permissive policies that allow all operations
-- This maintains the RLS structure while working with the custom auth system
CREATE POLICY "Allow all operations on ads" 
ON public.ads 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on ad_settings"
ON public.ad_settings
FOR ALL 
USING (true) 
WITH CHECK (true);