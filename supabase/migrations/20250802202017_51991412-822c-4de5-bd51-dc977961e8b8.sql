-- Enable RLS on existing tables that don't have it enabled
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_views ENABLE ROW LEVEL SECURITY;

-- Create basic policies for existing tables
-- Comments - public read, no write restrictions for now
CREATE POLICY "Comments are publicly readable" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can add comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (true);

-- Categories - public read, admin write
CREATE POLICY "Categories are publicly readable" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can manage categories" 
ON public.categories 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Category contents - public read, admin write
CREATE POLICY "Category contents are publicly readable" 
ON public.category_contents 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can manage category contents" 
ON public.category_contents 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Email subscribers - admin only
CREATE POLICY "Only authenticated users can view email subscribers" 
ON public.email_subscribers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can subscribe to emails" 
ON public.email_subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only authenticated users can manage email subscribers" 
ON public.email_subscribers 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Contents - public read, admin write
CREATE POLICY "Contents are publicly readable" 
ON public.contents 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can manage contents" 
ON public.contents 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Content views - public read/write for analytics
CREATE POLICY "Content views are publicly readable" 
ON public.content_views 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can track content views" 
ON public.content_views 
FOR INSERT 
WITH CHECK (true);

-- Fix function security by setting search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;