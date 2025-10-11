'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedContent from './AnimatedContent';
import StarBorder from './StarBorder';
import ASCIIText from './ASCIIText';
import SpiderManLogo from './SpiderManLogo';
import Dock from './Dock';
import { useWebSocket } from '@/hooks/useWebSocket';

const HomePage = () => {
  const [showLogo, setShowLogo] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const router = useRouter();
  const ws = useWebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080');

  useEffect(() => {
    // Show logo for 5 seconds, then show main content
    const timer = setTimeout(() => {
      setShowLogo(false);
      setTimeout(() => setShowContent(true), 500);
    }, 5000);

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

  // Dock items
  const dockItems = [
    {
      icon: (
        <div className="w-8 h-8 flex items-center justify-center">
          <span className="text-red-500 text-xl font-bold">🕷️</span>
        </div>
      ),
      label: 'Create Room',
      onClick: handleCreateRoom,
    },
    {
      icon: (
        <div className="w-8 h-8 flex items-center justify-center">
          <span className="text-blue-500 text-xl font-bold">🕸️</span>
        </div>
      ),
      label: 'Join Room',
      onClick: () => document.getElementById('join-room')?.focus(),
    },
    {
      icon: (
        <div className="w-8 h-8 flex items-center justify-center">
          <span className="text-yellow-500 text-xl font-bold">⚡</span>
        </div>
      ),
      label: 'Settings',
      onClick: () => console.log('Settings clicked'),
    },
    {
      icon: (
        <div className="w-8 h-8 flex items-center justify-center">
          <span className="text-green-500 text-xl font-bold">🏆</span>
        </div>
      ),
      label: 'Leaderboard',
      onClick: () => console.log('Leaderboard clicked'),
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Web Patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-40 h-40 border-2 border-red-500/40 rounded-full animate-spin"></div>
          <div className="absolute top-40 right-32 w-32 h-32 border-2 border-blue-500/40 rounded-full animate-spin delay-1000"></div>
          <div className="absolute bottom-40 left-40 w-24 h-24 border-2 border-yellow-500/40 rounded-full animate-spin delay-2000"></div>
          <div className="absolute bottom-32 right-20 w-36 h-36 border-2 border-green-500/40 rounded-full animate-spin delay-500"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-white/60 rounded-full animate-ping`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Spider-Man Logo Animation */}
      {showLogo && (
        <SpiderManLogo 
          fadeIn={true}
          duration={5000}
          onFadeComplete={() => setShowContent(true)}
        />
      )}

      {/* Main Content */}
      {showContent && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          {/* Enhanced ASCII Title */}
          <div className="w-full h-96 mb-16 relative">
            <ASCIIText
              text="WebSlingers Sketchpad"
              asciiFontSize={6}
              textFontSize={160}
              textColor="#da5047"
              planeBaseHeight={10}
              enableWaves={true}
            />
            
            {/* Enhanced Floating Effects */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-8 left-12 w-3 h-3 bg-red-500 rounded-full animate-bounce delay-100 shadow-lg shadow-red-500/50"></div>
              <div className="absolute top-12 right-16 w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300 shadow-lg shadow-blue-500/50"></div>
              <div className="absolute top-20 left-20 w-2.5 h-2.5 bg-yellow-500 rounded-full animate-bounce delay-500 shadow-lg shadow-yellow-500/50"></div>
              <div className="absolute top-16 right-12 w-2 h-2 bg-green-500 rounded-full animate-bounce delay-700 shadow-lg shadow-green-500/50"></div>
              <div className="absolute top-24 left-32 w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-900 shadow-lg shadow-purple-500/50"></div>
            </div>
            
            {/* Subtitle */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
              <h2 className="text-white/80 text-2xl font-eras font-bold tracking-wider">
                YOUR FRIENDLY NEIGHBORHOOD DRAWING GAME
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-red-500 via-blue-500 to-yellow-500 mx-auto mt-4 rounded-full"></div>
            </div>
          </div>

          {/* Enhanced Player Setup Form */}
          <AnimatedContent
            distance={50}
            direction="vertical"
            duration={1}
            delay={0.5}
            className="w-full max-w-lg mb-12"
          >
            <div className="bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl border-2 border-red-500/50 rounded-3xl p-10 shadow-2xl shadow-red-500/20">
              <div className="text-center mb-8">
                <h2 className="text-red-500 text-3xl font-eras font-bold mb-4 tracking-wider">
                  🕷️ ENTER YOUR WEB-SLINGER IDENTITY 🕷️
                </h2>
                <div className="w-32 h-1.5 bg-gradient-to-r from-red-500 via-blue-500 to-yellow-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-gray-300 text-lg mb-4 font-eras font-bold">
                    <span className="text-red-500">★</span> WEB-SLINGER NICKNAME
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your Spider-Alias"
                      className="w-full px-8 py-6 bg-gradient-to-r from-gray-800/80 to-black/80 border-2 border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-500/30 transition-all duration-300 text-xl font-eras font-bold shadow-inner backdrop-blur-sm"
                    />
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-red-500 text-2xl">
                      🦸‍♂️
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedContent>

          {/* Enhanced Action Buttons */}
          <div className="w-full max-w-2xl space-y-8">
            {/* Create Room Button */}
            <AnimatedContent
              distance={50}
              direction="vertical"
              duration={1}
              delay={1}
            >
              <div className="relative group">
                <button
                  onClick={handleCreateRoom}
                  className="w-full px-12 py-8 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:via-red-400 hover:to-red-500 border-2 border-red-400/50 rounded-3xl shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <div className="flex items-center justify-center space-x-4">
                    <span className="text-2xl font-eras font-bold text-white tracking-wider">
                      CREATE A NEW WEB
                    </span>
                    <span className="text-4xl animate-pulse">🕷️</span>
                  </div>
                </button>
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full animate-ping opacity-75 shadow-lg"></div>
                <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-yellow-500 rounded-full animate-ping opacity-60 delay-500 shadow-lg"></div>
              </div>
            </AnimatedContent>

            {/* Join Room Section */}
            <AnimatedContent
              distance={50}
              direction="vertical"
              duration={1}
              delay={1.2}
            >
              <div className="bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl border-2 border-blue-500/50 rounded-3xl p-8 shadow-2xl shadow-blue-500/20">
                <div className="mb-6">
                  <label className="block text-gray-300 text-lg mb-4 font-eras font-bold">
                    <span className="text-blue-500">🔗</span> ROOM CODE
                  </label>
                  <div className="relative">
                    <input
                      id="join-room"
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="Enter Room Code"
                      className="w-full px-8 py-6 bg-gradient-to-r from-gray-800/80 to-black/80 border-2 border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 text-xl font-eras font-bold text-center tracking-widest shadow-inner backdrop-blur-sm"
                      maxLength={6}
                    />
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-blue-500 text-2xl">
                      🕸️
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <button
                    onClick={handleJoinRoom}
                    className="w-full px-12 py-8 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-400 hover:to-blue-500 border-2 border-blue-400/50 rounded-3xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-center justify-center space-x-4">
                      <span className="text-2xl font-eras font-bold text-white tracking-wider">
                        JOIN A WEB
                      </span>
                      <span className="text-4xl animate-pulse">🕸️</span>
                    </div>
                  </button>
                  <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-75 shadow-lg"></div>
                  <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-cyan-500 rounded-full animate-ping opacity-60 delay-500 shadow-lg"></div>
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
            className="mt-20"
          >
            <div className="text-center space-y-8">
              <div className="bg-gradient-to-br from-gray-900/80 via-black/80 to-gray-900/80 backdrop-blur-xl border-2 border-gray-700/50 rounded-3xl p-8 max-w-2xl mx-auto shadow-2xl">
                <div className="text-gray-300 text-xl font-eras font-bold mb-6 tracking-wider">
                  YOUR FRIENDLY NEIGHBORHOOD SKETCHPAD
                </div>
                
                {/* Enhanced Animated Spider Icon */}
                <div className="relative mb-8">
                  <div className="text-9xl animate-bounce">🕷️</div>
                  <div className="absolute -top-4 -left-4 text-4xl animate-pulse text-yellow-500">⚡</div>
                  <div className="absolute -bottom-4 -right-4 text-4xl animate-pulse delay-500 text-blue-500">🕸️</div>
                  <div className="absolute top-1/2 -left-8 text-3xl animate-pulse delay-1000 text-red-500">🦸‍♂️</div>
                  <div className="absolute top-1/2 -right-8 text-3xl animate-pulse delay-1500 text-green-500">🏆</div>
                </div>
                
                {/* Enhanced Feature Tags */}
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <span className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 text-sm rounded-full border border-red-500/30 font-eras font-bold shadow-lg">
                    REAL-TIME MULTIPLAYER
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 text-sm rounded-full border border-blue-500/30 font-eras font-bold shadow-lg">
                    AI-POWERED WORDS
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 text-sm rounded-full border border-yellow-500/30 font-eras font-bold shadow-lg">
                    SPIDER-MAN THEMED
                  </span>
                </div>
                
                <div className="text-gray-400 text-lg font-eras font-bold">
                  READY TO WEB-SLING YOUR WAY TO VICTORY? 🏆
                </div>
              </div>
            </div>
          </AnimatedContent>

          {/* Dock Navigation */}
          <div className="fixed bottom-0 left-0 right-0 z-20">
            <Dock items={dockItems} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
