'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface SpiderManLogoProps {
  fadeIn?: boolean;
  duration?: number;
  onFadeComplete?: () => void;
  className?: string;
}

const SpiderManLogo: React.FC<SpiderManLogoProps> = ({ 
  fadeIn = true, 
  duration = 5000, 
  onFadeComplete,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(fadeIn);
  const [animationPhase, setAnimationPhase] = useState('fade-in');

  useEffect(() => {
    if (!fadeIn) return;

    const timer = setTimeout(() => {
      setAnimationPhase('fade-out');
      setTimeout(() => {
        setIsVisible(false);
        onFadeComplete?.();
      }, 1000);
    }, duration);

    return () => clearTimeout(timer);
  }, [fadeIn, duration, onFadeComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black ${className}`}>
      <div 
        className={`relative flex items-center justify-center transition-all duration-1000 ${
          animationPhase === 'fade-in' 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-110'
        }`}
      >
        {/* Miles Morales Spider-Man Logo */}
        <div className="relative w-64 h-80 md:w-80 md:h-96">
          <Image
            src="/spiderman-logo.png"
            alt="Miles Morales Spider-Man Logo"
            fill
            className="object-contain"
            priority
          />
          
          {/* Enhanced glowing effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          
          {/* Electric energy effects */}
          <div className="absolute inset-0">
            <div className="absolute top-8 left-8 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
            <div className="absolute top-12 right-10 w-2 h-2 bg-red-400 rounded-full animate-ping delay-300"></div>
            <div className="absolute bottom-16 left-12 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-700"></div>
            <div className="absolute bottom-12 right-8 w-3 h-3 bg-red-400 rounded-full animate-ping delay-1000"></div>
            <div className="absolute top-1/2 left-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-500"></div>
            <div className="absolute top-1/2 right-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-1200"></div>
          </div>
          
          {/* Venom blast effect */}
          <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-80 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
          </div>
          
          {/* Web strand effects */}
          <div className="absolute top-8 right-1/4 w-16 h-0.5 bg-white/60 transform rotate-45 animate-pulse"></div>
          <div className="absolute bottom-16 left-1/4 w-12 h-0.5 bg-white/40 transform -rotate-45 animate-pulse delay-1000"></div>
        </div>
      </div>
    </div>
  );
};

export default SpiderManLogo;
