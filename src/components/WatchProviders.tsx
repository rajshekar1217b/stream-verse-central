
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { WatchProvider } from '@/types';
import { Button } from './ui/button';

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

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-3">Where to Watch</h3>
      <div className="flex flex-wrap gap-3">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            onClick={() => window.open(provider.url, '_blank')}
            className="flex items-center gap-2 hover:bg-accent/10 transition-colors group"
          >
            <img
              src={provider.logoPath}
              alt={provider.name}
              className="w-6 h-6 rounded"
            />
            <span>{provider.name}</span>
            <ExternalLink size={14} className="text-muted-foreground group-hover:text-foreground" />
          </Button>
        ))}
      </div>
    </div>
  );
};

export default WatchProviders;
