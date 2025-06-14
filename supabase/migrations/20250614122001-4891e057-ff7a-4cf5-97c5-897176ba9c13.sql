
-- Add watch_providers column to contents table
ALTER TABLE public.contents 
ADD COLUMN watch_providers JSONB DEFAULT '[]'::jsonb;
