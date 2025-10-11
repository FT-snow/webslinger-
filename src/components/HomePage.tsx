'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TextPressure from './TextPressure';
import SpiderManLogo from './SpiderManLogo';
import MagicBento, { ParticleCard } from './MagicBento';
import { useWebSocket } from '@/hooks/useWebSocket';

const HomePage = () => {
  const [showLogo, setShowLogo] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showJoinSpider, setShowJoinSpider] = useState(false);
  const router = useRouter();
  const ws = useWebSocket("ws://213.35.127.100:8004");

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
      console.log('Room created event received:', data);
      router.push(`/room/${data.roomCode}?playerId=${ws.playerId}&name=${encodeURIComponent(playerName)}`);
    });

    ws.on('room_joined', (data) => {
      console.log('Room joined event received:', data);
      router.push(`/room/${data.roomCode}?playerId=${ws.playerId}&name=${encodeURIComponent(playerName)}`);
    });

    // Add debugging for all WebSocket events
    ws.on('connected', (data) => {
      console.log('WebSocket connected:', data);
    });

    ws.on('error', (data) => {
      console.error('WebSocket error:', data);
    });

    return () => {
      ws.off('room_created');
      ws.off('room_joined');
      ws.off('connected');
      ws.off('error');
    };
  }, [ws, router, playerName]);

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      console.log('Creating room with player name:', playerName.trim());
      console.log('WebSocket connection status:', ws.isConnected);
      console.log('Player ID:', ws.playerId);
      
      if (!ws.isConnected) {
        console.error('WebSocket is not connected! Make sure the server is running.');
        alert(`Cannot connect to server. Please make sure the WebSocket server is running on ${"ws://213.35.127.100:8004"}`);
        return;
      }
      
      if (!ws.playerId) {
        console.error('Player ID is not available yet. Waiting for connection...');
        alert('Connecting to server... Please try again in a moment.');
        return;
      }
      
      ws.createRoom(playerName.trim(), 5);
    } else {
      console.log('Player name is empty, cannot create room');
      alert('Please enter your player name first.');
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim() && roomCode.trim()) {
      setShowJoinSpider(true);
      ws.joinRoom(roomCode.toUpperCase().trim(), playerName.trim());
      
      // Hide spider after 3 seconds
      setTimeout(() => {
        setShowJoinSpider(false);
      }, 3000);
    }
  };


  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50"
        >
          <source src="/Spiderman Live Wallpaper - The Sensei BG (1080p, h264).mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70"></div>
      </div>
      
      {/* Subtle Star Field */}
      <div className="absolute inset-0 z-20">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* CSS for twinkle animation */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      {/* Spider Symbol Animation */}
      {showLogo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="opacity-90">
            <img 
              src="/spider.jpg" 
              alt="Spider Symbol" 
              className="w-32 h-32 animate-pulse"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
        </div>
      )}

      {/* Join Room Spider Effect */}
      {showJoinSpider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="opacity-90 animate-pulse">
            <img 
              src="/spider.jpg" 
              alt="Spider Symbol" 
              className="w-40 h-40 animate-spin"
              style={{ 
                mixBlendMode: 'multiply',
                animation: 'spin 2s linear infinite, pulse 1s ease-in-out infinite'
              }}
            />
          </div>
          <div className="absolute bottom-1/4 text-white text-xl font-bold tracking-wider animate-pulse">
            Joining Room...
          </div>
        </div>
      )}

      {/* Main Content */}
      {showContent && (
        <div className="relative z-30 min-h-screen flex flex-col items-center px-4 pt-24">
          {/* Connection Status */}
          <div className="absolute top-4 right-4 z-50">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              ws.isConnected 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {ws.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
          </div>
          {/* WebSlingers TextPressure */}
          <div className="w-full max-w-6xl mb-4">
            <div className="h-40 flex items-center justify-center">
              <div className="w-5/6">
                <TextPressure
                  text="WebSlingers"
                  textColor="#FFFFFF"
                  strokeColor="#0080FF"
                  strokeWidth={4}
                  stroke={true}
                  width={true}
                  weight={true}
                  italic={true}
                  flex={true}
                  minFontSize={64}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* SKETCHPAD TextPressure */}
          <div className="w-full max-w-6xl mb-32">
            <div className="h-32 flex items-center justify-center">
              <div className="w-3/5">
                <TextPressure
                  text="SKETCHPAD"
                  textColor="#FFFFFF"
                  strokeColor="#FF0040"
                  strokeWidth={4}
                  stroke={true}
                  width={true}
                  weight={true}
                  italic={false}
                  flex={true}
                  minFontSize={49}
                  className="w-full"
                />
              </div>
            </div>
          </div>


          {/* Action Buttons with MagicBento Effects */}
          <div className="w-full max-w-4xl mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Player Name Input Card */}
              <ParticleCard
                className="card flex flex-col justify-center relative aspect-[4/3] min-h-[200px] w-full max-w-full p-6 rounded-[20px] border border-solid border-white/20 bg-black/70 backdrop-blur-3xl font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] card--border-glow"
                style={{}}
                disableAnimations={false}
                particleCount={8}
                glowColor="0, 128, 255"
                enableTilt={false}
                clickEffect={true}
                enableMagnetism={false}
              >
                <div className="card__content flex flex-col relative text-white">
                  <h3 className="card__title font-normal text-lg m-0 mb-3 text-center">
                    Player Name
                  </h3>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="ENTER YOUR NAME"
                    className="w-full px-4 py-3 bg-black/50 border border-white/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500/80 transition-all duration-300 text-center tracking-[0.2em] font-['Inter'] font-medium text-sm backdrop-blur-sm"
                    maxLength={20}
                  />
                </div>
              </ParticleCard>

              {/* Create Room Button Card */}
              <ParticleCard
                className={`card flex flex-col justify-center relative aspect-[4/3] min-h-[200px] w-full max-w-full p-6 rounded-[20px] border border-solid font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] card--border-glow ${
                  playerName.trim()
                    ? 'bg-gradient-to-br from-red-500/30 to-red-600/20 border-red-500/50 hover:border-red-500/80 hover:shadow-[0_0_30px_rgba(255,0,64,0.3)] text-white'
                    : 'bg-gradient-to-br from-gray-500/20 to-gray-600/10 border-gray-500/30 cursor-not-allowed opacity-50 text-gray-400'
                }`}
                style={{}}
                disableAnimations={false}
                particleCount={8}
                glowColor="255, 0, 64"
                enableTilt={false}
                clickEffect={true}
                enableMagnetism={false}
              >
                <button
                  onClick={handleCreateRoom}
                  disabled={!playerName.trim()}
                  className="w-full h-full flex flex-col items-center justify-center"
                >
                  <div className="card__content flex flex-col items-center relative text-center">
                    <span className="text-4xl mb-3">🕷️</span>
                    <h3 className="card__title font-normal text-lg m-0 mb-2">
                      Create Web
                    </h3>
                    <p className="card__description text-sm opacity-80">
                      Start a new game
                    </p>
                  </div>
                </button>
              </ParticleCard>

              {/* Join Room Button Card */}
              <ParticleCard
                className={`card flex flex-col justify-center relative aspect-[4/3] min-h-[200px] w-full max-w-full p-6 rounded-[20px] border border-solid font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] card--border-glow ${
                  playerName.trim()
                    ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/20 border-blue-500/50 hover:border-blue-500/80 hover:shadow-[0_0_30px_rgba(0,128,255,0.3)] text-white'
                    : 'bg-gradient-to-br from-gray-500/20 to-gray-600/10 border-gray-500/30 cursor-not-allowed opacity-50 text-gray-400'
                }`}
                style={{}}
                disableAnimations={false}
                particleCount={8}
                glowColor="0, 128, 255"
                enableTilt={false}
                clickEffect={true}
                enableMagnetism={false}
              >
                <button
                  onClick={() => playerName.trim() && roomCode.trim() ? handleJoinRoom() : document.getElementById('join-room')?.focus()}
                  disabled={!playerName.trim()}
                  className="w-full h-full flex flex-col items-center justify-center"
                >
                  <div className="card__content flex flex-col items-center relative text-center">
                    <span className="text-4xl mb-3">🕸️</span>
                    <h3 className="card__title font-normal text-lg m-0 mb-2">
                      Join Web
                    </h3>
                    <p className="card__description text-sm opacity-80">
                      Enter room code below
                    </p>
                  </div>
                </button>
              </ParticleCard>
            </div>

            {/* Room Code Input Card */}
            <div className="mt-4 max-w-md mx-auto">
              <ParticleCard
                className="card flex flex-col justify-center relative aspect-[4/2] min-h-[120px] w-full max-w-full p-6 rounded-[20px] border border-solid border-white/20 bg-black/70 backdrop-blur-3xl font-light overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] card--border-glow"
                style={{}}
                disableAnimations={false}
                particleCount={6}
                glowColor="0, 128, 255"
                enableTilt={false}
                clickEffect={true}
                enableMagnetism={false}
              >
                <div className="card__content flex flex-col relative text-white">
                  <h3 className="card__title font-normal text-lg m-0 mb-3 text-center">
                    Room Code
                  </h3>
                  <input
                    id="join-room"
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && playerName.trim() && roomCode.trim() && handleJoinRoom()}
                    placeholder="ENTER CODE"
                    disabled={!playerName.trim()}
                    className={`w-full px-4 py-3 rounded-lg text-center tracking-[0.3em] font-['Inter'] font-medium text-lg backdrop-blur-sm focus:outline-none transition-all duration-300 ${
                      playerName.trim()
                        ? 'bg-black/50 border border-white/40 hover:border-white/60 focus:border-blue-500/80 text-white placeholder-white/40'
                        : 'bg-black/30 border border-gray-500/30 text-gray-500 placeholder-gray-600 cursor-not-allowed'
                    }`}
                    maxLength={6}
                  />
                </div>
              </ParticleCard>
            </div>
          </div>


        </div>
      )}
    </div>
  );
};

export default HomePage;

