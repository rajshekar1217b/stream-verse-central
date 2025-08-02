import React, { useEffect, useState } from 'react';
import { adService } from '@/services/adService';

const AutoAds: React.FC = () => {
  const [adSettings, setAdSettings] = useState(null);

  useEffect(() => {
    const fetchAdSettings = async () => {
      try {
        const settings = await adService.getAdSettings();
        setAdSettings(settings);
        
        if (settings?.auto_ads_enabled && settings.auto_ads_client_id) {
          // Add the AdSense auto ads script
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.auto_ads_client_id}`;
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);

          // Initialize auto ads
          script.onload = () => {
            try {
              (window as any).adsbygoogle = (window as any).adsbygoogle || [];
              (window as any).adsbygoogle.push({
                google_ad_client: settings.auto_ads_client_id,
                enable_page_level_ads: true
              });
            } catch (error) {
              console.error('Error initializing auto ads:', error);
            }
          };
        }
      } catch (error) {
        console.error('Error loading ad settings:', error);
      }
    };

    fetchAdSettings();
  }, []);

  return null; // This component doesn't render anything visible
};

export default AutoAds;