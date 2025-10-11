'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AnimatedContent from '@/components/AnimatedContent';
// import LightRays from '@/components/LightRays';
import PlayerList from '@/components/PlayerList';
import DrawingCanvas from '@/components/DrawingCanvas';
import ChatAndGuessing from '@/components/ChatAndGuessing';
import WordSelector from '@/components/WordSelector';
import { ParticleCard } from '@/components/MagicBento';
import { useWebSocket } from '@/hooks/useWebSocket';

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
  const ws = useWebSocket('ws://localhost:8080');

  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    totalRounds: 5,
    currentDrawer: null,
    secretWord: null,
    wordHint: '_______',
    timeRemaining: 120,
    gameStatus: 'waiting',
  });

  const [currentPlayerName, setCurrentPlayerName] = useState('');
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [showRoomContent, setShowRoomContent] = useState(false);

  useEffect(() => {
    // Get player info from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    const playerId = urlParams.get('playerId');
    
    if (name) {
      setCurrentPlayerName(decodeURIComponent(name));
    }
    if (playerId) {
      setCurrentPlayerId(playerId);
    }

    // Add initial waiting message
    setMessages([{
      id: '1',
      playerName: 'System',
      message: 'Welcome to the Web-Slinger Room! Waiting for the host to start the game...',
      type: 'system',
      timestamp: new Date(),
    }]);

    // Show room content after a brief delay for entrance animation
    setTimeout(() => {
      setShowRoomContent(true);
    }, 500);
  }, []);

  // WebSocket event handlers
  useEffect(() => {
    if (!ws.room) {
      console.log('No room data yet, waiting for WebSocket...');
      return;
    }

    console.log('Room data received:', ws.room);

    // Update room data when it changes
    const roomData = ws.room;
    
    // Convert room players to our Player interface
    const roomPlayers: Player[] = Array.from(roomData.players.values()).map((player: any) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      isHost: player.isHost,
      isDrawing: player.isCurrentDrawer,
      isCurrentDrawer: player.isCurrentDrawer,
      hasGuessed: player.hasGuessed,
    }));

    console.log('Converted players:', roomPlayers);
    setPlayers(roomPlayers);

    // Check if current player is host
    const currentPlayer = roomPlayers.find(p => p.id === currentPlayerId);
    const hostStatus = currentPlayer?.isHost || false;
    console.log('Current player:', currentPlayer);
    console.log('Is host:', hostStatus);
    setIsHost(hostStatus);

    // Update game state based on room data
    setGameState(prev => ({
      ...prev,
      currentRound: roomData.currentRound,
      totalRounds: roomData.maxRounds,
      currentDrawer: roomData.currentDrawerId,
      secretWord: roomData.currentWord,
      wordHint: roomData.wordHint || '_______',
      timeRemaining: roomData.timeLeft,
      gameStatus: roomData.gameState === 'waiting' ? 'waiting' : 
                  roomData.gameState === 'playing' ? 'drawing' : 
                  roomData.gameState === 'finished' ? 'gameEnd' : 'waiting',
    }));

    // Update messages
    if (ws.messages && ws.messages.length > 0) {
      const formattedMessages: Message[] = ws.messages.map((msg: any) => ({
        id: msg.id,
        playerName: msg.playerName,
        message: msg.message,
        type: msg.messageType === 'system' ? 'system' : 
              msg.messageType === 'guess' ? 'guess' : 'chat',
        timestamp: new Date(msg.timestamp),
      }));
      setMessages(formattedMessages);
    }

  }, [ws.room, ws.messages, currentPlayerId]);

  // Handle WebSocket events
  useEffect(() => {
    ws.on('player_joined', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        playerName: 'System',
        message: `${data.player.name} joined the room!`,
        type: 'system',
        timestamp: new Date(),
      }]);
    });

    ws.on('game_started', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        playerName: 'System',
        message: '🎮 Game started! Get ready to draw and guess!',
        type: 'system',
        timestamp: new Date(),
      }]);
    });

    ws.on('word_selected', (data) => {
      setGameState(prev => ({
        ...prev,
        secretWord: data.word,
        wordHint: data.wordHint,
        gameStatus: 'drawing',
      }));
    });

    ws.on('correct_guess', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        playerName: 'System',
        message: `🎉 ${data.guesser} guessed correctly! The word was "${data.word}"! (+${data.score} points)`,
        type: 'system',
        timestamp: new Date(),
      }]);
    });

    ws.on('round_ended', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        playerName: 'System',
        message: `Round ended! ${data.reason === 'timeout' ? 'Time\'s up!' : 'Word was guessed!'}`,
        type: 'system',
        timestamp: new Date(),
      }]);
    });

    ws.on('game_ended', (data) => {
      setGameState(prev => ({ ...prev, gameStatus: 'gameEnd' }));
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        playerName: 'System',
        message: '🎉 Game finished! Thanks for playing WebSlingers Sketchpad!',
        type: 'system',
        timestamp: new Date(),
      }]);
    });

    return () => {
      ws.off('player_joined');
      ws.off('game_started');
      ws.off('word_selected');
      ws.off('correct_guess');
      ws.off('round_ended');
      ws.off('game_ended');
    };
  }, [ws]);

  const handleWordSelect = (word: string) => {
    // Send word selection to server
    ws.selectWord(word);
  };

  const handleDrawingChange = (drawingData: any) => {
    // Send drawing data to server
    ws.sendDrawingData(drawingData);
  };

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    // Send chat message to server
    ws.sendChatMessage(message.trim(), 'chat');
  };

  const handleSendGuess = (guess: string) => {
    if (!guess.trim()) return;
    // Send guess to server
    ws.sendGuess(guess.trim());
  };

  const handleStartGame = () => {
    if (isHost) {
      ws.startGame();
    }
  };

  const handleRoundEnd = () => {
    // This will be handled by server events
    console.log('Round ended');
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

      {/* Room Content with Entrance Animation */}
      <div className={`transition-all duration-1000 ease-out ${
        showRoomContent 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}>
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
        <ParticleCard
          className="w-96 bg-spider-black/90 backdrop-blur-md border-r border-spider-red/40 p-4 relative overflow-hidden"
          style={{}}
          disableAnimations={false}
          particleCount={6}
          glowColor="218, 80, 71"
          enableTilt={false}
          clickEffect={true}
          enableMagnetism={false}
        >
          <AnimatedContent distance={50} direction="horizontal" duration={1} delay={0.2}>
            <PlayerList 
              players={players}
              currentDrawer={gameState.currentDrawer || ''}
              maxRounds={gameState.totalRounds}
              currentRound={gameState.currentRound}
              onSetMaxRounds={(rounds) => ws.updateRoomSettings(rounds)}
              isHost={isHost}
            />
          </AnimatedContent>
        </ParticleCard>

        {/* Center - Drawing Canvas or Waiting Screen */}
        <div className="flex-1 flex flex-col">
          {gameState.gameStatus === 'waiting' ? (
            // Waiting Screen
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-black/50 to-purple-900/20">
              <AnimatedContent distance={50} direction="vertical" duration={1} delay={0.4}>
                <div className="text-center max-w-2xl">
                  {/* Spider Icon */}
                  <div className="mb-8">
                    <img 
                      src="/spider.jpg" 
                      alt="Spider Symbol" 
                      className="w-24 h-24 mx-auto animate-pulse"
                      style={{ mixBlendMode: 'multiply' }}
                    />
                  </div>
                  
                  {/* Waiting Message */}
                  <h2 className="text-4xl font-bold text-white mb-4 tracking-wider">
                    Waiting for Game to Start
                  </h2>
                  
                  <p className="text-xl text-white/80 mb-6 leading-relaxed">
                    {isHost 
                      ? "You're the host! Click 'Start Game' when everyone is ready."
                      : "Waiting for the host to start the game..."
                    }
                  </p>
                  
                  {/* Players Count */}
                  <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8">
                    <p className="text-white/70 text-lg mb-2">
                      Players in Room ({players.length})
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {players.map((player) => (
                        <div 
                          key={player.id}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            player.isHost 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {player.name} {player.isHost && '👑'}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Start Game Button (Host Only) */}
                  {isHost && (
                    <button
                      onClick={handleStartGame}
                      className={`px-8 py-4 font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 ${
                        players.length >= 1
                          ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-[0_0_30px_rgba(255,0,0,0.5)]'
                          : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
                      }`}
                      disabled={players.length < 1}
                    >
                      🎮 Start Game {players.length < 2 && '(Solo Test)'}
                    </button>
                  )}
                  
                  {/* Host Waiting Message */}
                  {isHost && players.length === 0 && (
                    <p className="text-yellow-400 text-lg">
                      Waiting for players to join...
                    </p>
                  )}
                  
                  {/* Debug Info */}
                  <div className="mt-4 text-xs text-gray-400">
                    Debug: isHost={isHost.toString()}, players={players.length}, currentPlayerId={currentPlayerId}
                  </div>
                </div>
              </AnimatedContent>
            </div>
          ) : (
            // Game Screen
            <>
              <div className="flex-1 p-4">
                <AnimatedContent distance={50} direction="vertical" duration={1} delay={0.4}>
                  <DrawingCanvas
                    isDrawing={players.find(p => p.id === currentPlayerId)?.isDrawing || false}
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
            </>
          )}
        </div>

        {/* Right Sidebar - Chat and Guessing */}
        <ParticleCard
          className="w-96 bg-spider-black/90 backdrop-blur-md border-l border-spider-red/40 p-4 relative overflow-hidden"
          style={{}}
          disableAnimations={false}
          particleCount={6}
          glowColor="6, 72, 169"
          enableTilt={false}
          clickEffect={true}
          enableMagnetism={false}
        >
          <AnimatedContent distance={50} direction="horizontal" duration={1} delay={0.6}>
            <ChatAndGuessing
              messages={messages}
              onSendMessage={handleSendMessage}
              onSendGuess={handleSendGuess}
              isDrawing={players.find(p => p.id === currentPlayerId)?.isDrawing || false}
              currentPlayer={currentPlayerName}
              wordHint={gameState.wordHint}
              timeLeft={gameState.timeRemaining}
              hasGuessed={players.find(p => p.id === currentPlayerId)?.hasGuessed || false}
            />
          </AnimatedContent>
        </ParticleCard>
      </div>
      </div>
    </div>
  );
}
