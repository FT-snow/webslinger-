const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

class SpiderManGameServer {
  constructor(port = 8004) {
    this.port = port;
    this.server = http.createServer();
    this.wss = new WebSocket.Server({ server: this.server });
    this.rooms = new Map();
    this.players = new Map();
    
    this.setupWebSocketServer();
    this.startServer();
  }

  setupWebSocketServer() {
    // Add health check endpoint
    this.server.on('request', (req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
        return;
      }
    });

    this.wss.on('connection', (ws, req) => {
      console.log('🕷️ New Web-Slinger connected!');
      
      ws.playerId = uuidv4();
      this.players.set(ws.playerId, {
        id: ws.playerId,
        socket: ws,
        roomId: null,
        name: null,
        isHost: false
      });

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      // Send welcome message
      this.sendMessage(ws, {
        type: 'connected',
        playerId: ws.playerId,
        message: 'Welcome to WebSlingers Sketchpad! 🕷️'
      });
    });
  }

  handleMessage(ws, message) {
    const player = this.players.get(ws.playerId);
    
    switch (message.type) {
      case 'create_room':
        this.handleCreateRoom(ws, message);
        break;
      case 'join_room':
        this.handleJoinRoom(ws, message);
        break;
      case 'start_game':
        this.handleStartGame(ws, message);
        break;
      case 'send_message':
        this.handleSendMessage(ws, message);
        break;
      case 'send_guess':
        this.handleSendGuess(ws, message);
        break;
      case 'drawing_data':
        this.handleDrawingData(ws, message);
        break;
      case 'select_word':
        this.handleSelectWord(ws, message);
        break;
      case 'update_room_settings':
        this.handleUpdateRoomSettings(ws, message);
        break;
      default:
        this.sendError(ws, 'Unknown message type');
    }
  }

  handleCreateRoom(ws, message) {
    const { playerName, maxRounds = 5 } = message;
    const roomCode = this.generateRoomCode();
    const roomId = uuidv4();
    
    const room = {
      id: roomId,
      code: roomCode,
      hostId: ws.playerId,
      hostName: playerName,
      maxRounds,
      currentRound: 1,
      gameState: 'waiting',
      players: new Map(),
      messages: [],
      currentWord: null,
      wordHint: null,
      timeLeft: 120,
      isDrawing: false,
      currentDrawerId: null,
      createdAt: Date.now()
    };

    // Add host as first player
    const player = {
      id: ws.playerId,
      name: playerName,
      score: 0,
      isHost: true,
      isCurrentDrawer: false,
      hasGuessed: false,
      joinedAt: Date.now()
    };

    room.players.set(ws.playerId, player);
    this.rooms.set(roomId, room);
    
    // Update player info
    const playerInfo = this.players.get(ws.playerId);
    playerInfo.roomId = roomId;
    playerInfo.name = playerName;
    playerInfo.isHost = true;

    // Add welcome message
    room.messages.push({
      id: uuidv4(),
      playerId: 'system',
      playerName: 'System',
      message: `Welcome to WebSlingers Sketchpad! ${playerName} created room ${roomCode}. Waiting for players to join...`,
      messageType: 'system',
      timestamp: Date.now()
    });

    this.sendMessage(ws, {
      type: 'room_created',
      roomId,
      roomCode,
      room: this.getRoomData(room)
    });

    console.log(`🕸️ Room ${roomCode} created by ${playerName}`);
  }

  handleJoinRoom(ws, message) {
    const { roomCode, playerName } = message;
    
    // Find room by code
    const room = Array.from(this.rooms.values()).find(r => r.code === roomCode);
    
    if (!room) {
      this.sendError(ws, 'Room not found');
      return;
    }

    if (room.gameState === 'finished') {
      this.sendError(ws, 'Game has already finished');
      return;
    }

    // Check if player already exists
    if (room.players.has(ws.playerId)) {
      const existingPlayer = room.players.get(ws.playerId);
      existingPlayer.hasGuessed = false;
      
      room.messages.push({
        id: uuidv4(),
        playerId: 'system',
        playerName: 'System',
        message: `${playerName} rejoined the game!`,
        messageType: 'system',
        timestamp: Date.now()
      });

      this.broadcastToRoom(room.id, {
        type: 'player_rejoined',
        player: existingPlayer,
        messages: room.messages.slice(-10)
      });
      
      return;
    }

    // Add new player
    const player = {
      id: ws.playerId,
      name: playerName,
      score: 0,
      isHost: false,
      isCurrentDrawer: false,
      hasGuessed: false,
      joinedAt: Date.now()
    };

    room.players.set(ws.playerId, player);
    
    // Update player info
    const playerInfo = this.players.get(ws.playerId);
    playerInfo.roomId = room.id;
    playerInfo.name = playerName;

    // Add join message
    room.messages.push({
      id: uuidv4(),
      playerId: 'system',
      playerName: 'System',
      message: `${playerName} joined the game! 🕷️`,
      messageType: 'system',
      timestamp: Date.now()
    });

    // Broadcast to all players in room
    this.broadcastToRoom(room.id, {
      type: 'player_joined',
      player,
      room: this.getRoomData(room),
      messages: room.messages.slice(-10)
    });

    // Send room data to new player
    this.sendMessage(ws, {
      type: 'room_joined',
      roomId: room.id,
      roomCode: room.code,
      room: this.getRoomData(room),
      messages: room.messages.slice(-10)
    });

    console.log(`🕷️ ${playerName} joined room ${roomCode}`);
  }

  handleStartGame(ws, message) {
    const player = this.players.get(ws.playerId);
    const room = this.rooms.get(player.roomId);
    
    if (!room || !player.isHost) {
      this.sendError(ws, 'Only the host can start the game');
      return;
    }

    if (room.gameState !== 'waiting') {
      this.sendError(ws, 'Game has already started');
      return;
    }

    if (room.players.size < 1) {
      this.sendError(ws, 'Need at least 1 player to start the game');
      return;
    }

    // Set first drawer
    const firstDrawer = Array.from(room.players.values())[0];
    firstDrawer.isCurrentDrawer = true;

    // Update room state
    room.gameState = 'playing';
    room.currentDrawerId = firstDrawer.id;
    room.isDrawing = true;

    // Add start message
    room.messages.push({
      id: uuidv4(),
      playerId: 'system',
      playerName: 'System',
      message: `🎮 Game started! ${firstDrawer.name} is drawing first!`,
      messageType: 'system',
      timestamp: Date.now()
    });

    this.broadcastToRoom(room.id, {
      type: 'game_started',
      room: this.getRoomData(room),
      messages: room.messages.slice(-10)
    });

    console.log(`🎮 Game started in room ${room.code}`);
  }

  handleSendMessage(ws, message) {
    const { roomId, content, messageType = 'chat' } = message;
    const player = this.players.get(ws.playerId);
    const room = this.rooms.get(roomId);
    
    if (!room || !room.players.has(ws.playerId)) {
      this.sendError(ws, 'Not in room');
      return;
    }

    const chatMessage = {
      id: uuidv4(),
      playerId: ws.playerId,
      playerName: player.name,
      message: content,
      messageType,
      timestamp: Date.now()
    };

    room.messages.push(chatMessage);

    this.broadcastToRoom(roomId, {
      type: 'new_message',
      message: chatMessage
    });
  }

  handleSendGuess(ws, message) {
    const { roomId, guess } = message;
    const player = this.players.get(ws.playerId);
    const room = this.rooms.get(roomId);
    
    if (!room || !room.players.has(ws.playerId)) {
      this.sendError(ws, 'Not in room');
      return;
    }

    const playerData = room.players.get(ws.playerId);
    
    if (playerData.hasGuessed) {
      this.sendError(ws, 'You have already guessed this round');
      return;
    }

    if (playerData.isCurrentDrawer) {
      this.sendError(ws, 'You cannot guess your own drawing');
      return;
    }

    // Check if guess is correct
    const isCorrect = room.currentWord && 
      guess.toLowerCase().trim() === room.currentWord.toLowerCase();

    playerData.hasGuessed = true;

    if (isCorrect) {
      // Calculate score based on time left
      const timeBonus = Math.floor(room.timeLeft * 2);
      playerData.score += timeBonus;

      // End the drawing round
      room.isDrawing = false;
      room.timeLeft = 0;

      // Add correct guess message
      room.messages.push({
        id: uuidv4(),
        playerId: 'system',
        playerName: 'System',
        message: `🎉 ${player.name} guessed correctly! It was "${room.currentWord}"! (+${timeBonus} points)`,
        messageType: 'system',
        timestamp: Date.now()
      });

      this.broadcastToRoom(roomId, {
        type: 'correct_guess',
        guesser: player.name,
        word: room.currentWord,
        score: timeBonus,
        room: this.getRoomData(room),
        messages: room.messages.slice(-5)
      });
    } else {
      // Add guess message
      room.messages.push({
        id: uuidv4(),
        playerId: ws.playerId,
        playerName: player.name,
        message: guess,
        messageType: 'guess',
        isCorrect: false,
        timestamp: Date.now()
      });

      this.broadcastToRoom(roomId, {
        type: 'new_message',
        message: room.messages[room.messages.length - 1]
      });
    }
  }

  handleDrawingData(ws, message) {
    const { roomId, drawingType, x, y, color, brushSize, tool } = message;
    const player = this.players.get(ws.playerId);
    const room = this.rooms.get(roomId);
    
    if (!room || room.currentDrawerId !== ws.playerId) {
      this.sendError(ws, 'Only the current drawer can draw');
      return;
    }

    const drawingData = {
      id: uuidv4(),
      playerId: ws.playerId,
      drawingType,
      x,
      y,
      color,
      brushSize,
      tool,
      timestamp: Date.now()
    };

    // Broadcast drawing data to all other players in room
    this.broadcastToRoom(roomId, {
      type: 'drawing_update',
      drawingData
    }, ws.playerId); // Exclude the drawer
  }

  handleSelectWord(ws, message) {
    const { roomId, word } = message;
    const player = this.players.get(ws.playerId);
    const room = this.rooms.get(roomId);
    
    if (!room || room.currentDrawerId !== ws.playerId) {
      this.sendError(ws, 'Only the current drawer can select a word');
      return;
    }

    // Create word hint (underscores)
    const wordHint = word.split('').map(() => '_').join(' ');

    room.currentWord = word;
    room.wordHint = wordHint;
    room.isDrawing = true;
    room.timeLeft = 120; // 2 minutes

    // Reset all players' guess status
    room.players.forEach(player => {
      player.hasGuessed = false;
    });

    // Add system message
    room.messages.push({
      id: uuidv4(),
      playerId: 'system',
      playerName: 'System',
      message: `${player.name} is now drawing! Start guessing! 🎨`,
      messageType: 'system',
      timestamp: Date.now()
    });

    this.broadcastToRoom(roomId, {
      type: 'word_selected',
      word,
      wordHint,
      room: this.getRoomData(room),
      messages: room.messages.slice(-5)
    });

    // Start countdown timer
    this.startRoundTimer(roomId);
  }

  handleUpdateRoomSettings(ws, message) {
    const { roomId, maxRounds } = message;
    const player = this.players.get(ws.playerId);
    const room = this.rooms.get(roomId);
    
    if (!room || !player.isHost) {
      this.sendError(ws, 'Only the host can update room settings');
      return;
    }

    if (maxRounds !== undefined) {
      room.maxRounds = maxRounds;
    }

    this.broadcastToRoom(roomId, {
      type: 'room_settings_updated',
      room: this.getRoomData(room)
    });
  }

  handleDisconnect(ws) {
    const player = this.players.get(ws.playerId);
    
    if (player && player.roomId) {
      const room = this.rooms.get(player.roomId);
      
      if (room && room.players.has(ws.playerId)) {
        const playerData = room.players.get(ws.playerId);
        
        // Remove player from room
        room.players.delete(ws.playerId);
        
        // Add leave message
        room.messages.push({
          id: uuidv4(),
          playerId: 'system',
          playerName: 'System',
          message: `${playerData.name} left the game`,
          messageType: 'system',
          timestamp: Date.now()
        });

        // If host left, transfer host to another player
        if (playerData.isHost && room.players.size > 0) {
          const newHost = Array.from(room.players.values())[0];
          newHost.isHost = true;
          
          room.hostId = newHost.id;
          room.hostName = newHost.name;

          room.messages.push({
            id: uuidv4(),
            playerId: 'system',
            playerName: 'System',
            message: `${newHost.name} is now the host`,
            messageType: 'system',
            timestamp: Date.now()
          });
        }

        this.broadcastToRoom(player.roomId, {
          type: 'player_left',
          playerId: ws.playerId,
          playerName: playerData.name,
          room: this.getRoomData(room),
          messages: room.messages.slice(-5)
        });

        // Delete room if no players left
        if (room.players.size === 0) {
          this.rooms.delete(player.roomId);
          console.log(`🗑️ Room ${room.code} deleted (no players left)`);
        }
      }
    }

    this.players.delete(ws.playerId);
    console.log(`👋 Player ${ws.playerId} disconnected`);
  }

  startRoundTimer(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const timer = setInterval(() => {
      if (room.timeLeft > 0) {
        room.timeLeft--;
        
        this.broadcastToRoom(roomId, {
          type: 'timer_update',
          timeLeft: room.timeLeft
        });
      } else {
        clearInterval(timer);
        
        // Time's up
        room.isDrawing = false;
        
        room.messages.push({
          id: uuidv4(),
          playerId: 'system',
          playerName: 'System',
          message: `Time's up! The word was: ${room.currentWord}`,
          messageType: 'system',
          timestamp: Date.now()
        });

        this.broadcastToRoom(roomId, {
          type: 'round_ended',
          reason: 'timeout',
          word: room.currentWord,
          room: this.getRoomData(room),
          messages: room.messages.slice(-5)
        });

        // Move to next round or end game
        this.handleRoundEnd(roomId);
      }
    }, 1000);
  }

  handleRoundEnd(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.currentRound++;
    
    if (room.currentRound > room.maxRounds) {
      // Game ended
      room.gameState = 'finished';
      
      room.messages.push({
        id: uuidv4(),
        playerId: 'system',
        playerName: 'System',
        message: '🎉 Game finished! Thanks for playing WebSlingers Sketchpad!',
        messageType: 'system',
        timestamp: Date.now()
      });

      this.broadcastToRoom(roomId, {
        type: 'game_ended',
        room: this.getRoomData(room),
        messages: room.messages.slice(-5)
      });
    } else {
      // Next round
      const players = Array.from(room.players.values());
      const currentDrawerIndex = players.findIndex(p => p.isCurrentDrawer);
      const nextDrawerIndex = (currentDrawerIndex + 1) % players.length;
      
      // Reset drawer status
      players.forEach(p => p.isCurrentDrawer = false);
      players[nextDrawerIndex].isCurrentDrawer = true;
      
      room.currentDrawerId = players[nextDrawerIndex].id;
      room.currentWord = null;
      room.wordHint = null;
      room.timeLeft = 120;
      room.isDrawing = false;

      room.messages.push({
        id: uuidv4(),
        playerId: 'system',
        playerName: 'System',
        message: `Round ${room.currentRound}! ${players[nextDrawerIndex].name} is drawing next!`,
        messageType: 'system',
        timestamp: Date.now()
      });

      this.broadcastToRoom(roomId, {
        type: 'next_round',
        room: this.getRoomData(room),
        messages: room.messages.slice(-5)
      });
    }
  }

  getRoomData(room) {
    return {
      id: room.id,
      code: room.code,
      hostId: room.hostId,
      hostName: room.hostName,
      maxRounds: room.maxRounds,
      currentRound: room.currentRound,
      gameState: room.gameState,
      currentWord: room.currentWord,
      wordHint: room.wordHint,
      timeLeft: room.timeLeft,
      isDrawing: room.isDrawing,
      currentDrawerId: room.currentDrawerId,
      players: Array.from(room.players.values()),
      createdAt: room.createdAt
    };
  }

  broadcastToRoom(roomId, message, excludePlayerId = null) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players.forEach((player, playerId) => {
      if (excludePlayerId && playerId === excludePlayerId) return;
      
      const playerInfo = this.players.get(playerId);
      if (playerInfo && playerInfo.socket.readyState === WebSocket.OPEN) {
        this.sendMessage(playerInfo.socket, message);
      }
    });
  }

  sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  sendError(ws, error) {
    this.sendMessage(ws, {
      type: 'error',
      message: error
    });
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  startServer() {
    this.server.listen(this.port, () => {
      console.log(`🕷️ WebSlingers Sketchpad Server running on port ${this.port}`);
      console.log(`🌐 WebSocket endpoint: ws://localhost:${this.port}`);
    });
  }
}

// Start the server
const server = new SpiderManGameServer(process.env.PORT || 8004);

module.exports = SpiderManGameServer;
