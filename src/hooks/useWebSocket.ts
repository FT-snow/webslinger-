'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isCurrentDrawer: boolean;
  hasGuessed: boolean;
  joinedAt: number;
}

interface Message {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  messageType: 'chat' | 'guess' | 'system' | 'correct';
  isCorrect?: boolean;
  timestamp: number;
}

interface Room {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  maxRounds: number;
  currentRound: number;
  gameState: 'waiting' | 'playing' | 'finished';
  currentWord: string | null;
  wordHint: string | null;
  timeLeft: number;
  isDrawing: boolean;
  currentDrawerId: string | null;
  players: Player[];
  createdAt: number;
}

interface DrawingData {
  id: string;
  playerId: string;
  drawingType: 'start' | 'draw' | 'end' | 'clear';
  x?: number;
  y?: number;
  color?: string;
  brushSize?: number;
  tool?: string;
  timestamp: number;
}

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export const useWebSocket = (url: string = "wss://webslingers-sketchpad-server-production.up.railway.app") => {
  const ws = useRef<WebSocket | null>(null);
  const wsUrl = useRef(url);
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messageHandlers = useRef<Map<string, (data: any) => void>>(new Map());

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      ws.current = new WebSocket(wsUrl.current);

      ws.current.onopen = () => {
        console.log('🕷️ Connected to WebSlingers server!');
        setIsConnected(true);
        setError(null);
      };

      ws.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 Received:', data);

          // Handle default messages
          switch (data.type) {
            case 'connected':
              setPlayerId(data.playerId);
              break;

            case 'room_created':
            case 'room_joined':
              setRoom(data.room);
              if (data.messages) {
                setMessages(data.messages);
              }
              break;

            case 'player_joined':
            case 'player_left':
            case 'player_rejoined':
            case 'room_settings_updated':
            case 'game_started':
            case 'next_round':
            case 'word_selected':
            case 'correct_guess':
            case 'round_ended':
            case 'game_ended':
              if (data.room) {
                setRoom(data.room);
              }
              if (data.messages) {
                setMessages(data.messages);
              }
              break;

            case 'new_message':
              if (data.message) {
                setMessages((prev) => [...prev, data.message]);
              }
              break;

            case 'timer_update':
              setRoom((prev) => prev ? { ...prev, timeLeft: data.timeLeft } : null);
              break;

            case 'error':
              setError(data.message);
              console.error('❌ Server error:', data.message);
              break;
          }

          // Call custom handlers
          const handler = messageHandlers.current.get(data.type);
          if (handler) {
            handler(data);
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      ws.current.onerror = (event) => {
        console.error('❌ WebSocket error:', event);
        setError('Connection error');
      };

      ws.current.onclose = () => {
        console.log('👋 Disconnected from WebSlingers server');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (ws.current?.readyState === WebSocket.CLOSED) {
            connect();
          }
        }, 3000);
      };
    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
      setError('Failed to connect to server');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      console.log('📤 Sent:', message);
    } else {
      console.error('WebSocket is not connected');
      setError('Not connected to server');
    }
  }, []);

  const on = useCallback((type: string, handler: (data: any) => void) => {
    messageHandlers.current.set(type, handler);
  }, []);

  const off = useCallback((type: string) => {
    messageHandlers.current.delete(type);
  }, []);

  // WebSocket Actions
  const createRoom = useCallback((playerName: string, maxRounds: number = 5) => {
    sendMessage({
      type: 'create_room',
      playerName,
      maxRounds
    });
  }, [sendMessage]);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    sendMessage({
      type: 'join_room',
      roomCode,
      playerName
    });
  }, [sendMessage]);

  const startGame = useCallback(() => {
    if (!room) return;
    sendMessage({
      type: 'start_game',
      roomId: room.id
    });
  }, [sendMessage, room]);

  const sendChatMessage = useCallback((content: string, messageType: 'chat' | 'guess' = 'chat') => {
    if (!room) return;
    sendMessage({
      type: 'send_message',
      roomId: room.id,
      content,
      messageType
    });
  }, [sendMessage, room]);

  const sendGuess = useCallback((guess: string) => {
    if (!room) return;
    sendMessage({
      type: 'send_guess',
      roomId: room.id,
      guess
    });
  }, [sendMessage, room]);

  const sendDrawingData = useCallback((drawingData: Partial<DrawingData>) => {
    if (!room) return;
    sendMessage({
      type: 'drawing_data',
      roomId: room.id,
      ...drawingData
    });
  }, [sendMessage, room]);

  const selectWord = useCallback((word: string) => {
    if (!room) return;
    sendMessage({
      type: 'select_word',
      roomId: room.id,
      word
    });
  }, [sendMessage, room]);

  const updateRoomSettings = useCallback((maxRounds: number) => {
    if (!room) return;
    sendMessage({
      type: 'update_room_settings',
      roomId: room.id,
      maxRounds
    });
  }, [sendMessage, room]);

  useEffect(() => {
    connect();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    playerId,
    room,
    messages,
    error,
    connect,
    disconnect,
    sendMessage,
    on,
    off,
    // Game actions
    createRoom,
    joinRoom,
    startGame,
    sendChatMessage,
    sendGuess,
    sendDrawingData,
    selectWord,
    updateRoomSettings
  };
};

