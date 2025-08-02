-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create ads table for storing ad snippets and configurations
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ad_code TEXT NOT NULL,
  placement TEXT NOT NULL CHECK (placement IN ('header', 'footer', 'before_content', 'after_content', 'between_content', 'sidebar')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad_settings table for global ad configurations
CREATE TABLE public.ad_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auto_ads_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_ads_client_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for ads table (admin only)
CREATE POLICY "Only authenticated users can view ads" 
ON public.ads 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can manage ads" 
ON public.ads 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create policies for ad_settings table (admin only)
CREATE POLICY "Only authenticated users can view ad settings" 
ON public.ad_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can manage ad settings" 
ON public.ad_settings 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_settings_updated_at
BEFORE UPDATE ON public.ad_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default ad settings record
INSERT INTO public.ad_settings (auto_ads_enabled) VALUES (false);