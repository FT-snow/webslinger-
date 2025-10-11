'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  playerName: string;
  message: string;
  type: 'chat' | 'guess' | 'correct' | 'system';
  timestamp: Date;
  isCorrect?: boolean;
}

interface ChatAndGuessingProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onSendGuess: (guess: string) => void;
  isDrawing: boolean;
  currentPlayer: string;
  wordHint: string;
  timeLeft: number;
  hasGuessed: boolean;
}

const ChatAndGuessing: React.FC<ChatAndGuessingProps> = ({
  messages,
  onSendMessage,
  onSendGuess,
  isDrawing,
  currentPlayer,
  wordHint,
  timeLeft,
  hasGuessed
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isGuessMode, setIsGuessMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    if (isGuessMode) {
      onSendGuess(inputMessage.trim());
    } else {
      onSendMessage(inputMessage.trim());
    }
    
    setInputMessage('');
    setIsGuessMode(false);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'correct': return '🎉';
      case 'guess': return '💭';
      case 'system': return '🤖';
      default: return '💬';
    }
  };

  const getMessageColor = (type: string, isCorrect?: boolean) => {
    if (isCorrect) return 'text-green-400';
    switch (type) {
      case 'correct': return 'text-green-400';
      case 'guess': return 'text-spider-blue';
      case 'system': return 'text-spider-grey';
      default: return 'text-white';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Word Hint */}
      <div className="bg-spider-black/80 backdrop-blur-sm border border-spider-red/30 rounded-xl p-4 mb-4">
        <h2 className="text-spider-red font-speedy mb-2 spider-text-glow">
          🕷️ Spider-Sense Hint
        </h2>
        
        <div className="text-center">
          <div className="text-2xl font-speedy text-white mb-2">
            {wordHint}
          </div>
          <div className="text-spider-grey text-base">
            {isDrawing ? 'You are drawing this word' : 'Guess what this word is!'}
          </div>
        </div>
        
        {!isDrawing && (
          <div className="mt-3 text-center">
            <div className="text-spider-blue font-speedy">
              Time Left: <span className={`${timeLeft <= 10 ? 'text-red-500' : 'text-white'}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="bg-spider-black/80 backdrop-blur-sm border border-spider-blue/30 rounded-xl p-4 flex-1 flex flex-col">
        <h2 className="text-spider-blue font-speedy mb-3 spider-text-glow">
          💬 Chat & Guesses
        </h2>
        
        <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-64">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded-lg ${
                message.type === 'system' 
                  ? 'bg-spider-grey/20' 
                  : message.type === 'correct'
                  ? 'bg-green-500/20 border border-green-500/50'
                  : message.type === 'guess'
                  ? 'bg-spider-blue/20 border border-spider-blue/50'
                  : 'bg-spider-navy/30'
              }`}
            >
              <div className="flex items-start space-x-2">
                <span className="text-lg">{getMessageIcon(message.type)}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-spider-grey text-sm font-speedy">
                      {message.playerName}
                    </span>
                    <span className="text-spider-grey text-sm">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.isCorrect && (
                      <span className="text-green-400 text-sm font-bold">
                        ✅ CORRECT!
                      </span>
                    )}
                  </div>
                  <p className={`text-base ${getMessageColor(message.type, message.isCorrect)}`}>
                    {message.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="space-y-2">
          {!isDrawing && !hasGuessed && (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsGuessMode(!isGuessMode)}
                className={`px-3 py-1 rounded text-base font-speedy transition-all duration-300 ${
                  isGuessMode
                    ? 'bg-spider-red text-white spider-glow'
                    : 'bg-spider-navy/50 text-spider-grey hover:bg-spider-navy/70'
                }`}
              >
                {isGuessMode ? '🎯 Guessing Mode' : '💬 Chat Mode'}
              </button>
            </div>
          )}
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isDrawing 
                  ? "You can't chat while drawing" 
                  : isGuessMode 
                  ? "Type your guess here..." 
                  : "Type a message..."
              }
              disabled={isDrawing}
              className={`flex-1 px-3 py-2 rounded text-base font-speedy transition-all duration-300 ${
                isDrawing
                  ? 'bg-spider-grey/30 text-spider-grey cursor-not-allowed'
                  : 'bg-spider-navy/50 border border-spider-grey/30 text-white placeholder-spider-grey focus:border-spider-red focus:outline-none focus:ring-2 focus:ring-spider-red/50'
              }`}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isDrawing}
              className={`px-4 py-2 rounded text-base font-speedy transition-all duration-300 ${
                !inputMessage.trim() || isDrawing
                  ? 'bg-spider-grey/30 text-spider-grey cursor-not-allowed'
                  : isGuessMode
                  ? 'bg-spider-red text-white hover:bg-spider-dark-red spider-glow'
                  : 'bg-spider-blue text-white hover:bg-spider-navy'
              }`}
            >
              {isGuessMode ? '🎯' : '💬'}
            </button>
          </div>
        </form>

        {/* Instructions */}
        <div className="mt-2 text-center">
          <div className="text-spider-grey text-sm">
            {isDrawing ? (
              <>🎨 Focus on drawing! Chat will resume when your turn ends.</>
            ) : hasGuessed ? (
              <>✅ You've already guessed! Wait for the next round.</>
            ) : isGuessMode ? (
              <>🎯 Guessing mode: Type your answer and press Enter!</>
            ) : (
              <>💬 Chat mode: Talk with other players!</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAndGuessing;
