
import React from 'react';
import { CastMember } from '@/types';

interface CastSectionProps {
  cast: CastMember[];
}

const CastSection: React.FC<CastSectionProps> = ({ cast }) => {
  if (!cast || cast.length === 0) return null;
  
  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium mb-4">Cast</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {cast.map((person) => (
          <div key={person.id} className="text-center">
            <div className="w-full aspect-square rounded-full overflow-hidden mb-2">
              <img
                src={person.profilePath || 'https://via.placeholder.com/150'}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-medium text-sm">{person.name}</p>
            {person.character && (
              <p className="text-muted-foreground text-xs">{person.character}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CastSection;
