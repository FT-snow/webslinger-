'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import AnimatedContent from './AnimatedContent';
import StarBorder from './StarBorder';
import LightRays from './LightRays';
import ASCIIText from './ASCIIText';
import SpiderManLogo from './SpiderManLogo';

const ConvexHomePage = () => {
  const [showLogo, setShowLogo] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const createRoom = useMutation(api.rooms.createRoom);
  const joinRoom = useMutation(api.rooms.joinRoom);

  useEffect(() => {
    // Show logo for 3 seconds, then show main content
    const timer = setTimeout(() => {
      setShowLogo(false);
      setTimeout(() => setShowContent(true), 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your Web-Slinger nickname');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      
      // Generate a unique player ID
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      const result = await createRoom({
        hostId: playerId,
        hostName: playerName.trim(),
        maxRounds: 5,
      });

      if (result.roomCode) {
        router.push(`/room/${result.roomCode}?name=${encodeURIComponent(playerName)}&host=true&playerId=${playerId}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) {
      setError('Please enter both your nickname and room code');
      return;
    }

    try {
      setIsJoining(true);
      setError('');
      
      // Generate a unique player ID
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      const result = await joinRoom({
        roomCode: roomCode.trim().toUpperCase(),
        playerId: playerId,
        playerName: playerName.trim(),
      });

      if (result.roomCode) {
        router.push(`/room/${result.roomCode}?name=${encodeURIComponent(playerName)}&host=false&playerId=${playerId}`);
      }
    } catch (error: any) {
      console.error('Error joining room:', error);
      setError(error.message || 'Failed to join room. Please check the room code.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden web-pattern">
      {/* Background Light Rays */}
      <LightRays
        raysOrigin="top-center"
        raysColor="#da5047"
        raysSpeed={0.5}
        lightSpread={2}
        rayLength={3}
        pulsating={true}
        fadeDistance={1.5}
        saturation={1.2}
        followMouse={true}
        mouseInfluence={0.2}
        noiseAmount={0.1}
        distortion={0.3}
        className="absolute inset-0"
      />

      {/* Spider-Man Logo Animation */}
      {showLogo && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-spider-black">
          <SpiderManLogo />
        </div>
      )}

      {/* Main Content */}
      {showContent && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          {/* ASCII Title */}
          <div className="w-full h-64 mb-8 relative">
            <ASCIIText
              text="WebSlingers Sketchpad"
              asciiFontSize={6}
              textFontSize={120}
              textColor="#da5047"
              planeBaseHeight={6}
              enableWaves={true}
            />
          </div>

          {/* Error Message */}
          {error && (
            <AnimatedContent
              distance={50}
              direction="vertical"
              duration={0.5}
              className="w-full max-w-md mb-4"
            >
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center">
                <p className="text-red-400 font-speedy text-sm">{error}</p>
              </div>
            </AnimatedContent>
          )}

          {/* Player Setup Form */}
          <AnimatedContent
            distance={50}
            direction="vertical"
            duration={1}
            delay={0.5}
            className="w-full max-w-md mb-8"
          >
            <div className="bg-spider-black/80 backdrop-blur-sm border border-spider-red/30 rounded-xl p-6 spider-glow">
              <h2 className="text-spider-red text-xl font-speedy mb-4 text-center spider-text-glow">
                Enter Your Web-Slinger Identity
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-spider-grey text-sm mb-2">
                    Web-Slinger Nickname
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full px-4 py-3 bg-spider-navy/50 border border-spider-grey/30 rounded-lg text-white placeholder-spider-grey focus:border-spider-red focus:outline-none focus:ring-2 focus:ring-spider-red/50 transition-all duration-300"
                    disabled={isCreating || isJoining}
                  />
                </div>
              </div>
            </div>
          </AnimatedContent>

          {/* Action Buttons */}
          <div className="w-full max-w-md space-y-4">
            <AnimatedContent
              distance={50}
              direction="vertical"
              duration={1}
              delay={1}
            >
              <StarBorder
                color="#da5047"
                speed="4s"
                className="w-full"
                onClick={handleCreateRoom}
                style={{ opacity: isCreating ? 0.7 : 1 }}
              >
                <div className="flex items-center justify-center space-x-2">
                  {isCreating ? (
                    <>
                      <div className="animate-spin">🕷️</div>
                      <span className="text-lg font-speedy">Creating Web...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg font-speedy">Create New Web</span>
                      <span className="text-spider-red">🕷️</span>
                    </>
                  )}
                </div>
              </StarBorder>
            </AnimatedContent>

            <AnimatedContent
              distance={50}
              direction="vertical"
              duration={1}
              delay={1.2}
            >
              <div className="bg-spider-black/80 backdrop-blur-sm border border-spider-blue/30 rounded-xl p-4">
                <div className="mb-3">
                  <label className="block text-spider-grey text-sm mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter room code..."
                    className="w-full px-4 py-2 bg-spider-navy/50 border border-spider-grey/30 rounded-lg text-white placeholder-spider-grey focus:border-spider-blue focus:outline-none focus:ring-2 focus:ring-spider-blue/50 transition-all duration-300"
                    maxLength={6}
                    disabled={isCreating || isJoining}
                  />
                </div>
                
                <StarBorder
                  color="#0648a9"
                  speed="5s"
                  className="w-full"
                  onClick={handleJoinRoom}
                  style={{ opacity: isJoining ? 0.7 : 1 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {isJoining ? (
                      <>
                        <div className="animate-spin">🕸️</div>
                        <span className="text-lg font-speedy">Joining Web...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-speedy">Join a Web</span>
                        <span className="text-spider-blue">🕸️</span>
                      </>
                    )}
                  </div>
                </StarBorder>
              </div>
            </AnimatedContent>
          </div>

          {/* Spider-Man Art Placeholder */}
          <AnimatedContent
            distance={100}
            direction="vertical"
            duration={1.5}
            delay={1.5}
            className="mt-12"
          >
            <div className="text-center">
              <div className="text-spider-grey text-sm mb-2">
                Your Friendly Neighborhood Sketchpad
              </div>
              <div className="text-6xl animate-pulse">
                🕷️
              </div>
              <div className="text-spider-grey text-xs mt-2">
                Real-time multiplayer • Powered by Convex
              </div>
            </div>
          </AnimatedContent>
        </div>
      )}
    </div>
  );
};

export default ConvexHomePage;
