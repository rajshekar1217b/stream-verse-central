import React, { useEffect, useState } from 'react';
import { adService } from '@/services/adService';
import { Ad, AdPlacement } from '@/types/ads';

interface AdDisplayProps {
  placement: AdPlacement;
  className?: string;
}

const AdDisplay: React.FC<AdDisplayProps> = ({ placement, className = '' }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const adsData = await adService.getAdsByPlacement(placement);
        setAds(adsData);
      } catch (error) {
        console.error('Error loading ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [placement]);

  // Create a ref for the container to inject ad scripts
  const adContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ads.length > 0 && adContainerRef.current) {
      // Clear previous content
      adContainerRef.current.innerHTML = '';
      
      ads.forEach((ad, index) => {
        const adWrapper = document.createElement('div');
        adWrapper.className = 'ad-unit mb-4';
        adWrapper.innerHTML = ad.ad_code;
        
        // If there are scripts in the ad code, we need to re-execute them
        const scripts = adWrapper.querySelectorAll('script');
        scripts.forEach((script) => {
          const newScript = document.createElement('script');
          if (script.src) {
            newScript.src = script.src;
          } else {
            newScript.innerHTML = script.innerHTML;
          }
          script.parentNode?.replaceChild(newScript, script);
        });
        
        if (adContainerRef.current) {
          adContainerRef.current.appendChild(adWrapper);
        }
      });
    }
  }, [ads]);

  if (loading || ads.length === 0) {
    return null;
  }

  return (
    <div className={`ad-container ${className}`} data-placement={placement}>
      <div ref={adContainerRef} />
    </div>
  );
};

export default AdDisplay;