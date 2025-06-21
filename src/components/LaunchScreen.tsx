
import React, { useEffect, useState } from 'react';

interface LaunchScreenProps {
  onComplete: () => void;
}

const LaunchScreen: React.FC<LaunchScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 2500); // Show for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-black z-50 transition-opacity duration-500 opacity-0 pointer-events-none" />
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-500">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-red-600 tracking-wider animate-pulse">
          WHERE TO WATCH
        </h1>
        <div className="mt-8">
          <div className="w-16 h-1 bg-red-600 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LaunchScreen;
