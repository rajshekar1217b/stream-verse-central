
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
      <div className="text-center relative">
        {/* Netflix-style logo with individually wrapped letters */}
        <div className="relative inline-block">
          <div className="text-6xl md:text-8xl font-bold text-red-600 tracking-wider">
            
            {/* WHERE - top row */}
            <div className="flex justify-center items-center mb-4 transform -rotate-12 origin-center">
              {['W', 'H', 'E', 'R', 'E'].map((letter, index) => (
                <span
                  key={`where-${index}`}
                  className="inline-block animate-pulse transform hover:scale-110 transition-transform duration-300"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    textShadow: '0 0 20px rgba(229, 9, 20, 0.5), 0 0 40px rgba(229, 9, 20, 0.3)',
                    transform: `perspective(1000px) rotateY(${index % 2 === 0 ? '15deg' : '-15deg'}) rotateX(${index % 3 === 0 ? '10deg' : '-10deg'})`
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>

            {/* TO - middle row (smaller, centered) */}
            <div className="flex justify-center items-center mb-4 relative z-10">
              {['T', 'O'].map((letter, index) => (
                <span
                  key={`to-${index}`}
                  className="inline-block text-4xl md:text-5xl animate-pulse transform hover:scale-110 transition-transform duration-300"
                  style={{
                    animationDelay: `${(index + 5) * 0.1}s`,
                    textShadow: '0 0 20px rgba(229, 9, 20, 0.5), 0 0 40px rgba(229, 9, 20, 0.3)',
                    transform: `perspective(1000px) rotateY(${index % 2 === 0 ? '-20deg' : '20deg'}) rotateX(${index % 2 === 0 ? '-15deg' : '15deg'})`
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>

            {/* WATCH - bottom row */}
            <div className="flex justify-center items-center transform rotate-12 origin-center">
              {['W', 'A', 'T', 'C', 'H'].map((letter, index) => (
                <span
                  key={`watch-${index}`}
                  className="inline-block animate-pulse transform hover:scale-110 transition-transform duration-300"
                  style={{
                    animationDelay: `${(index + 7) * 0.1}s`,
                    textShadow: '0 0 20px rgba(229, 9, 20, 0.5), 0 0 40px rgba(229, 9, 20, 0.3)',
                    transform: `perspective(1000px) rotateY(${index % 2 === 0 ? '15deg' : '-15deg'}) rotateX(${index % 3 === 0 ? '-10deg' : '10deg'})`
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>

          </div>
        </div>
        
        <div className="mt-8">
          <div className="w-16 h-1 bg-red-600 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LaunchScreen;
