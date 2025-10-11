'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedContent from './AnimatedContent';
import StarBorder from './StarBorder';
import LightRays from './LightRays';
import ASCIIText from './ASCIIText';
import SpiderManLogo from './SpiderManLogo';
import { useWebSocket } from '@/hooks/useWebSocket';

const HomePage = () => {
  const [showLogo, setShowLogo] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const router = useRouter();
  const ws = useWebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080');

  useEffect(() => {
    // Show logo for 3 seconds, then show main content
    const timer = setTimeout(() => {
      setShowLogo(false);
      setTimeout(() => setShowContent(true), 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Listen for room creation/join success
    ws.on('room_created', (data) => {
      router.push(`/room/${data.roomCode}?playerId=${ws.playerId}&name=${encodeURIComponent(playerName)}`);
    });

    ws.on('room_joined', (data) => {
      router.push(`/room/${data.roomCode}?playerId=${ws.playerId}&name=${encodeURIComponent(playerName)}`);
    });

    return () => {
      ws.off('room_created');
      ws.off('room_joined');
    };
  }, [ws, router, playerName]);

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      ws.createRoom(playerName.trim(), 5);
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim() && roomCode.trim()) {
      ws.joinRoom(roomCode.toUpperCase().trim(), playerName.trim());
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden web-pattern">
      {/* Background Light Rays */}
      <LightRays
        raysOrigin="top-center"
        raysColor="#da5047"
        raysSpeed={0.8}
        lightSpread={2.5}
        rayLength={4}
        pulsating={true}
        fadeDistance={2}
        saturation={1.3}
        followMouse={true}
        mouseInfluence={0.3}
        noiseAmount={0.15}
        distortion={0.4}
        className="absolute inset-0"
      />

      {/* Additional Web Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border border-spider-red/30 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-24 h-24 border border-spider-blue/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 border border-spider-grey/30 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 border border-spider-red/20 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Spider-Man Logo Animation */}
      {showLogo && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-spider-black">
          <div className="relative">
            <SpiderManLogo />
            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 text-white text-lg font-speedy animate-pulse">
              Loading Web-Slinger Interface...
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {showContent && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          {/* ASCII Title with Enhanced Effects */}
          <div className="w-full h-80 mb-12 relative">
            <ASCIIText
              text="WebSlingers Sketchpad"
              asciiFontSize={5}
              textFontSize={140}
              textColor="#da5047"
              planeBaseHeight={8}
              enableWaves={true}
            />
            
            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-8 w-2 h-2 bg-spider-red rounded-full animate-bounce delay-100"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-spider-blue rounded-full animate-bounce delay-300"></div>
              <div className="absolute top-16 left-16 w-1.5 h-1.5 bg-spider-grey rounded-full animate-bounce delay-500"></div>
              <div className="absolute top-12 right-8 w-1 h-1 bg-spider-red rounded-full animate-bounce delay-700"></div>
            </div>
          </div>

          {/* Player Setup Form */}
          <AnimatedContent
            distance={50}
            direction="vertical"
            duration={1}
            delay={0.5}
            className="w-full max-w-md mb-8"
          >
            <div className="bg-spider-black/90 backdrop-blur-md border border-spider-red/40 rounded-2xl p-8 spider-glow shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-spider-red text-2xl font-speedy mb-2 spider-text-glow">
                  🕷️ Enter Your Web-Slinger Identity 🕷️
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-spider-red to-spider-blue mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-spider-grey text-sm mb-3 font-speedy">
                    <span className="text-spider-red">★</span> Web-Slinger Nickname
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your Spider-Alias"
                      className="w-full px-6 py-4 bg-spider-navy/60 border-2 border-spider-grey/40 rounded-xl text-white placeholder-spider-grey focus:border-spider-red focus:outline-none focus:ring-4 focus:ring-spider-red/30 transition-all duration-300 text-lg font-speedy shadow-inner"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-spider-red">
                      🦸‍♂️
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedContent>

          {/* Action Buttons */}
          <div className="w-full max-w-lg space-y-6">
            <AnimatedContent
              distance={50}
              direction="vertical"
              duration={1}
              delay={1}
            >
              <div className="relative group">
                <StarBorder
                  color="#da5047"
                  speed="3s"
                  className="w-full"
                  onClick={handleCreateRoom}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-xl font-speedy">Create a New Web</span>
                    <span className="text-2xl">🕷️</span>
                  </div>
                </StarBorder>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-spider-red rounded-full animate-ping opacity-75"></div>
              </div>
            </AnimatedContent>

            <AnimatedContent
              distance={50}
              direction="vertical"
              duration={1}
              delay={1.2}
            >
              <div className="bg-spider-black/90 backdrop-blur-md border border-spider-blue/40 rounded-2xl p-6 shadow-2xl">
                <div className="mb-4">
                  <label className="block text-spider-grey text-sm mb-3 font-speedy">
                    <span className="text-spider-blue">🔗</span> Room Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="Room Code"
                      className="w-full px-6 py-4 bg-spider-navy/60 border-2 border-spider-grey/40 rounded-xl text-white placeholder-spider-grey focus:border-spider-blue focus:outline-none focus:ring-4 focus:ring-spider-blue/30 transition-all duration-300 text-lg font-speedy text-center tracking-widest"
                      maxLength={6}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-spider-blue">
                      🕸️
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <StarBorder
                    color="#0648a9"
                    speed="4s"
                    className="w-full"
                    onClick={handleJoinRoom}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-xl font-speedy">Join a Web</span>
                      <span className="text-2xl">🕸️</span>
                    </div>
                  </StarBorder>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-spider-blue rounded-full animate-ping opacity-75"></div>
                </div>
              </div>
            </AnimatedContent>
          </div>

          {/* Enhanced Footer */}
          <AnimatedContent
            distance={100}
            direction="vertical"
            duration={1.5}
            delay={1.5}
            className="mt-16"
          >
            <div className="text-center space-y-6">
              <div className="bg-spider-black/60 backdrop-blur-sm border border-spider-grey/30 rounded-2xl p-6 max-w-md mx-auto">
                <div className="text-spider-grey text-lg font-speedy mb-4">
                  Your Friendly Neighborhood Sketchpad
                </div>
                
                {/* Animated Spider Icon */}
                <div className="relative mb-4">
                  <div className="text-8xl animate-bounce">🕷️</div>
                  <div className="absolute -top-2 -left-2 text-2xl animate-pulse">⚡</div>
                  <div className="absolute -bottom-2 -right-2 text-2xl animate-pulse delay-500">🕸️</div>
                </div>
                
                {/* Feature Tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-spider-red/20 text-spider-red text-xs rounded-full border border-spider-red/30">
                    Real-time Multiplayer
                  </span>
                  <span className="px-3 py-1 bg-spider-blue/20 text-spider-blue text-xs rounded-full border border-spider-blue/30">
                    AI-Powered Words
                  </span>
                  <span className="px-3 py-1 bg-spider-grey/20 text-spider-grey text-xs rounded-full border border-spider-grey/30">
                    Spider-Man Themed
                  </span>
                </div>
                
                <div className="text-spider-grey text-xs">
                  Ready to web-sling your way to victory? 🏆
                </div>
              </div>
            </div>
          </AnimatedContent>
        </div>
      )}
    </div>
  );
};

export default HomePage;
