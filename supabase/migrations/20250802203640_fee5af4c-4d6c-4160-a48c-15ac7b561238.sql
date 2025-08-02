-- Temporarily disable RLS for ads tables since app uses custom authentication
-- This is a temporary solution - for production, consider implementing proper Supabase auth

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Authenticated users can manage ads" ON public.ads;
DROP POLICY IF EXISTS "Authenticated users can manage ad settings" ON public.ad_settings;

-- Disable RLS entirely for these tables (temporary solution)
ALTER TABLE public.ads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_settings DISABLE ROW LEVEL SECURITY;