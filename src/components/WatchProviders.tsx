
import React from 'react';
import { ExternalLink, Smartphone } from 'lucide-react';
import { WatchProvider } from '@/types';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WatchProvidersProps {
  providers: WatchProvider[];
}

const WatchProviders: React.FC<WatchProvidersProps> = ({ providers }) => {
  if (!providers || providers.length === 0) {
    return (
      <div className="text-muted-foreground text-sm mt-2">
        No streaming options available at this time.
      </div>
    );
  }

  // Handle opening the app if available, otherwise open the web URL
  const handleProviderClick = (provider: WatchProvider) => {
    if (provider.redirectLink) {
      // Try to open the app with the redirect link
      window.location.href = provider.redirectLink;
      
      // Fallback to web URL after a short timeout (in case app doesn't open)
      setTimeout(() => {
        window.open(provider.url, '_blank');
      }, 1500);
    } else {
      // Just open the web URL if no redirect link
      window.open(provider.url, '_blank');
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-3">Where to Watch</h3>
      <div className="flex flex-wrap gap-3">
        {providers.map((provider) => (
          <TooltipProvider key={provider.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => handleProviderClick(provider)}
                  className="flex items-center gap-2 hover:bg-accent/10 transition-colors group"
                >
                  <img
                    src={provider.logoPath}
                    alt={provider.name}
                    className="w-6 h-6 rounded"
                  />
                  <span>{provider.name}</span>
                  {provider.redirectLink ? (
                    <Smartphone size={14} className="text-muted-foreground group-hover:text-foreground" />
                  ) : (
                    <ExternalLink size={14} className="text-muted-foreground group-hover:text-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {provider.redirectLink 
                  ? `Open in ${provider.name} app` 
                  : `Watch on ${provider.name} website`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};

export default WatchProviders;
