
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { WatchProvider } from '@/types';

interface WatchProvidersProps {
  providers: WatchProvider[];
}

const WatchProviders: React.FC<WatchProvidersProps> = ({ providers }) => {
  if (!providers || providers.length === 0) {
    return (
      <div className="text-gray-400 text-sm mt-2">
        No streaming options available at this time.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-3">Where to Watch</h3>
      <div className="flex flex-wrap gap-3">
        {providers.map((provider) => (
          <a
            key={provider.id}
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-ott-card hover:bg-white/10 px-3 py-2 rounded-md transition-colors group"
          >
            <img
              src={provider.logoPath}
              alt={provider.name}
              className="w-6 h-6 rounded"
            />
            <span>{provider.name}</span>
            <ExternalLink size={14} className="text-gray-400 group-hover:text-white" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default WatchProviders;
