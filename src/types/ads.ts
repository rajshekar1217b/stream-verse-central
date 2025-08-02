export interface Ad {
  id: string;
  name: string;
  ad_code: string;
  placement: 'header' | 'footer' | 'before_content' | 'after_content' | 'between_content' | 'sidebar';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdSettings {
  id: string;
  auto_ads_enabled: boolean;
  auto_ads_client_id?: string;
  created_at: string;
  updated_at: string;
}

export type AdPlacement = Ad['placement'];