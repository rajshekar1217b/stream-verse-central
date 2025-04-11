
import React from 'react';

interface ContentBackdropProps {
  backdropPath: string;
}

const ContentBackdrop: React.FC<ContentBackdropProps> = ({ backdropPath }) => {
  // Use a fallback image if backdropPath is undefined or empty
  const backgroundImage = backdropPath ? `url(${backdropPath})` : 'none';
  
  return (
    <div className="relative h-[60vh] w-full mb-6">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>
    </div>
  );
};

export default ContentBackdrop;
