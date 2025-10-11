'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

type WebSocketContextValue = ReturnType<typeof useWebSocket>;

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string;
}

export function WebSocketProvider({ children, url = "wss://webslingers-sketchpad-server-production.up.railway.app" }: WebSocketProviderProps) {
  const ws = useWebSocket(url);

  const value = useMemo(() => ws, [ws]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWS() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error('useWS must be used within a WebSocketProvider');
  }
  return ctx;
}


