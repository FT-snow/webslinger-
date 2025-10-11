'use client';

import React from 'react';

interface Player {
  id: string;
  name: string;
  score: number;
  isCurrentDrawer: boolean;
  hasGuessed: boolean;
  isHost: boolean;
}

interface PlayerListProps {
  players: Player[];
  currentDrawer: string;
  maxRounds: number;
  currentRound: number;
  onSetMaxRounds: (rounds: number) => void;
  isHost: boolean;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentDrawer,
  maxRounds,
  currentRound,
  onSetMaxRounds,
  isHost
}) => {
  return (
    <div className="space-y-4">
      {/* Game Settings */}
      <div className="bg-spider-black/80 backdrop-blur-sm border border-spider-red/30 rounded-xl p-4">
        <h2 className="text-spider-red font-speedy mb-3 spider-text-glow">
          🎮 Game Settings
        </h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-spider-grey text-sm">Round:</span>
            <span className="text-white font-speedy">{currentRound}/{maxRounds}</span>
          </div>
          
          {isHost && (
            <div>
              <label className="block text-spider-grey text-sm mb-1">
                Max Rounds:
              </label>
              <select
                value={maxRounds}
                onChange={(e) => onSetMaxRounds(Number(e.target.value))}
                className="w-full bg-spider-navy/50 border border-spider-grey/30 rounded text-white text-sm px-2 py-1 focus:border-spider-red focus:outline-none"
              >
                <option value={3}>3 Rounds</option>
                <option value={5}>5 Rounds</option>
                <option value={7}>7 Rounds</option>
                <option value={10}>10 Rounds</option>
              </select>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-spider-grey text-sm">Drawer:</span>
            <span className="text-spider-red font-speedy">
              {players.find(p => p.id === currentDrawer)?.name || 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="bg-spider-black/80 backdrop-blur-sm border border-spider-blue/30 rounded-xl p-4">
        <h2 className="text-spider-blue font-speedy mb-3 spider-text-glow">
          👥 Players ({players.length})
        </h2>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                player.isCurrentDrawer
                  ? 'bg-spider-red/20 border border-spider-red/50'
                  : player.hasGuessed
                  ? 'bg-spider-blue/20 border border-spider-blue/50'
                  : 'bg-spider-navy/30 border border-spider-grey/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  player.isCurrentDrawer
                    ? 'bg-spider-red animate-pulse'
                    : player.hasGuessed
                    ? 'bg-spider-blue'
                    : 'bg-spider-grey'
                }`}></div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm font-speedy">
                    {player.name}
                  </span>
                  
                  {player.isHost && (
                    <span className="text-xs bg-spider-red text-white px-2 py-1 rounded">
                      HOST
                    </span>
                  )}
                  
                  {player.isCurrentDrawer && (
                    <span className="text-xs bg-spider-red text-white px-2 py-1 rounded animate-pulse">
                      🎨 DRAWING
                    </span>
                  )}
                  
                  {player.hasGuessed && !player.isCurrentDrawer && (
                    <span className="text-xs bg-spider-blue text-white px-2 py-1 rounded">
                      ✅ GUESSED
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-spider-red font-speedy text-sm">
                  {player.score} pts
                </div>
                <div className="text-xs text-spider-grey">
                  #{index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Stats */}
      <div className="bg-spider-black/80 backdrop-blur-sm border border-spider-grey/30 rounded-xl p-4">
        <h2 className="text-spider-grey font-speedy mb-3">
          📊 Quick Stats
        </h2>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-spider-grey">Total Players:</span>
            <span className="text-white">{players.length}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-spider-grey">Current Drawer:</span>
            <span className="text-spider-red">
              {players.find(p => p.id === currentDrawer)?.name || 'None'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-spider-grey">Guessed:</span>
            <span className="text-spider-blue">
              {players.filter(p => p.hasGuessed).length}/{players.length - 1}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-spider-grey">High Score:</span>
            <span className="text-yellow-400">
              {Math.max(...players.map(p => p.score), 0)} pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerList;
