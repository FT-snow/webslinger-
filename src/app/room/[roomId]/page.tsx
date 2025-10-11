'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AnimatedContent from '@/components/AnimatedContent';
// import LightRays from '@/components/LightRays';
import PlayerList from '@/components/PlayerList';
import DrawingCanvas from '@/components/DrawingCanvas';
import ChatAndGuessing from '@/components/ChatAndGuessing';
import WordSelector from '@/components/WordSelector';

interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isDrawing: boolean;
  isCurrentDrawer: boolean;
  hasGuessed: boolean;
}

interface Message {
  id: string;
  playerName: string;
  message: string;
  type: 'chat' | 'guess' | 'system';
  timestamp: Date;
}

interface GameState {
  currentRound: number;
  totalRounds: number;
  currentDrawer: string | null;
  secretWord: string | null;
  wordHint: string;
  timeRemaining: number;
  gameStatus: 'waiting' | 'wordSelection' | 'drawing' | 'roundEnd' | 'gameEnd';
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  // Mock data - will be replaced with Convex
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Spider-Man', score: 0, isHost: true, isDrawing: false, isCurrentDrawer: false, hasGuessed: false },
    { id: '2', name: 'Miles Morales', score: 0, isHost: false, isDrawing: true, isCurrentDrawer: true, hasGuessed: false },
    { id: '3', name: 'Gwen Stacy', score: 0, isHost: false, isDrawing: false, isCurrentDrawer: false, hasGuessed: false },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      playerName: 'System',
      message: 'Welcome to the Web-Slinger Room! Get ready to draw!',
      type: 'system',
      timestamp: new Date(),
    },
  ]);

  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    totalRounds: 5,
    currentDrawer: '2',
    secretWord: null,
    wordHint: '_______',
    timeRemaining: 120,
    gameStatus: 'wordSelection',
  });

  const [currentPlayerName, setCurrentPlayerName] = useState('');

  useEffect(() => {
    // Get player name from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    if (name) {
      setCurrentPlayerName(decodeURIComponent(name));
    }
  }, []);

  const handleWordSelect = (word: string) => {
    setGameState(prev => ({
      ...prev,
      secretWord: word,
      wordHint: '_'.repeat(word.length),
      gameStatus: 'drawing',
    }));

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      playerName: 'System',
      message: `🎨 ${players.find(p => p.isDrawing)?.name} is now drawing!`,
      type: 'system',
      timestamp: new Date(),
    }]);
  };

  const handleDrawingChange = (drawingData: any) => {
    // Broadcast drawing changes to other players
    console.log('Drawing changed:', drawingData);
  };

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      playerName: currentPlayerName,
      message: message.trim(),
      type: 'chat',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendGuess = (guess: string) => {
    if (!guess.trim() || !gameState.secretWord) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      playerName: currentPlayerName,
      message: guess.trim(),
      type: 'guess',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);

    // Check if guess is correct
    if (guess.toLowerCase() === gameState.secretWord.toLowerCase()) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        playerName: 'System',
        message: `🎉 ${currentPlayerName} guessed it! The word was "${gameState.secretWord}"!`,
        type: 'system',
        timestamp: new Date(),
      }]);

      // Update scores
      setPlayers(prev => prev.map(p => 
        p.name === currentPlayerName 
          ? { ...p, score: p.score + 100 }
          : p
      ));

      // End round
      handleRoundEnd();
    }
  };

  const handleRoundEnd = () => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'roundEnd',
      secretWord: null,
      wordHint: '_______',
    }));

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      playerName: 'System',
      message: 'Round ended! Switching to next player...',
      type: 'system',
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="min-h-screen relative overflow-hidden web-pattern">
      {/* Background Light Rays - Temporarily disabled */}
      {/* <LightRays
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
      /> */}

      {/* Header */}
      <div className="relative z-10 bg-spider-black/80 backdrop-blur-md border-b border-spider-red/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-spider-grey hover:text-spider-red transition-colors duration-300"
              >
                ← Back to Home
              </button>
              <div className="text-spider-red font-speedy text-xl">
                🕷️ Room: {roomId}
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-spider-grey">
                Round: {gameState.currentRound}/{gameState.totalRounds}
              </div>
              <div className="text-spider-blue">
                Time: {gameState.timeRemaining}s
              </div>
              <div className="text-spider-red">
                Drawing: {players.find(p => p.isDrawing)?.name || 'None'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Player List */}
        <div className="w-80 bg-spider-black/90 backdrop-blur-md border-r border-spider-red/40 p-4">
          <AnimatedContent distance={50} direction="horizontal" duration={1} delay={0.2}>
            <PlayerList 
              players={players}
              currentDrawer={gameState.currentDrawer || ''}
              maxRounds={gameState.totalRounds}
              currentRound={gameState.currentRound}
              onSetMaxRounds={(rounds) => setGameState(prev => ({ ...prev, totalRounds: rounds }))}
              isHost={players.find(p => p.name === currentPlayerName)?.isHost || false}
            />
          </AnimatedContent>
        </div>

        {/* Center - Drawing Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <AnimatedContent distance={50} direction="vertical" duration={1} delay={0.4}>
              <DrawingCanvas
                isDrawing={players.find(p => p.name === currentPlayerName)?.isDrawing || false}
                currentPlayer={currentPlayerName}
                onDrawingChange={handleDrawingChange}
              />
            </AnimatedContent>
          </div>

          {/* Word Selection Modal */}
          {gameState.gameStatus === 'wordSelection' && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
              <AnimatedContent distance={100} direction="vertical" duration={1} delay={0}>
                <WordSelector
                  onWordSelect={handleWordSelect}
                  onClose={() => setGameState(prev => ({ ...prev, gameStatus: 'drawing' }))}
                />
              </AnimatedContent>
            </div>
          )}
        </div>

        {/* Right Sidebar - Chat and Guessing */}
        <div className="w-80 bg-spider-black/90 backdrop-blur-md border-l border-spider-red/40 p-4">
          <AnimatedContent distance={50} direction="horizontal" duration={1} delay={0.6}>
            <ChatAndGuessing
              messages={messages}
              onSendMessage={handleSendMessage}
              onSendGuess={handleSendGuess}
              isDrawing={players.find(p => p.name === currentPlayerName)?.isDrawing || false}
              currentPlayer={currentPlayerName}
              wordHint={gameState.wordHint}
              timeLeft={gameState.timeRemaining}
              hasGuessed={players.find(p => p.name === currentPlayerName)?.hasGuessed || false}
            />
          </AnimatedContent>
        </div>
      </div>
    </div>
  );
}
