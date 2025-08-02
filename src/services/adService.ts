import { supabase } from "@/integrations/supabase/client";
import { Ad, AdSettings, AdPlacement } from "@/types/ads";

export const adService = {
  // Get all ads
  async getAds(): Promise<Ad[]> {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Ad[];
  },

  // Get active ads by placement
  async getAdsByPlacement(placement: AdPlacement): Promise<Ad[]> {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('placement', placement)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Ad[];
  },

  // Create new ad
  async createAd(ad: Omit<Ad, 'id' | 'created_at' | 'updated_at'>): Promise<Ad> {
    const { data, error } = await supabase
      .from('ads')
      .insert([ad])
      .select()
      .single();

    if (error) throw error;
    return data as Ad;
  },

  // Update ad
  async updateAd(id: string, updates: Partial<Omit<Ad, 'id' | 'created_at' | 'updated_at'>>): Promise<Ad> {
    const { data, error } = await supabase
      .from('ads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Ad;
  },

  // Delete ad
  async deleteAd(id: string): Promise<void> {
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get ad settings
  async getAdSettings(): Promise<AdSettings | null> {
    const { data, error } = await supabase
      .from('ad_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Update ad settings
  async updateAdSettings(settings: Partial<Omit<AdSettings, 'id' | 'created_at' | 'updated_at'>>): Promise<AdSettings> {
    // Get the first settings record or create one
    const existingSettings = await this.getAdSettings();
    
    if (existingSettings) {
      const { data, error } = await supabase
        .from('ad_settings')
        .update(settings)
        .eq('id', existingSettings.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('ad_settings')
        .insert([settings])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }
};