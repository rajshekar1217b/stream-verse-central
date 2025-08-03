-- Fix security warnings by properly handling dependencies

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_generate_content_slug_insert ON public.contents;
DROP TRIGGER IF EXISTS trigger_generate_content_slug_update ON public.contents;

-- Then drop functions
DROP FUNCTION IF EXISTS public.generate_content_slug();
DROP FUNCTION IF EXISTS public.ensure_unique_slug(text, text);
DROP FUNCTION IF EXISTS public.generate_slug(text);

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_unique_slug(title text, content_id text DEFAULT NULL)
RETURNS text 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := generate_slug(title);
  final_slug := base_slug;
  
  -- Check if slug already exists (excluding current content if updating)
  WHILE EXISTS (
    SELECT 1 FROM public.contents 
    WHERE slug = final_slug 
    AND (content_id IS NULL OR id != content_id)
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_content_slug()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only generate slug if it's not provided or empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := ensure_unique_slug(NEW.title, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER trigger_generate_content_slug_insert
  BEFORE INSERT ON public.contents
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_content_slug();

CREATE TRIGGER trigger_generate_content_slug_update
  BEFORE UPDATE ON public.contents
  FOR EACH ROW
  WHEN (OLD.title IS DISTINCT FROM NEW.title AND (NEW.slug IS NULL OR NEW.slug = ''))
  EXECUTE FUNCTION public.generate_content_slug();