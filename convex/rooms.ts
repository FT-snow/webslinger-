import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new game room
export const createRoom = mutation({
  args: {
    hostId: v.string(),
    hostName: v.string(),
    maxRounds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const roomCode = generateRoomCode();
    const now = Date.now();

    // Check if room code already exists
    const existingRoom = await ctx.db
      .query("rooms")
      .withIndex("by_room_code", (q) => q.eq("roomCode", roomCode))
      .first();

    if (existingRoom) {
      throw new Error("Room code already exists, please try again");
    }

    const roomId = await ctx.db.insert("rooms", {
      roomCode,
      hostId: args.hostId,
      hostName: args.hostName,
      maxRounds: args.maxRounds || 5,
      currentRound: 1,
      gameState: "waiting",
      timeLeft: 120,
      isDrawing: false,
      createdAt: now,
      updatedAt: now,
    });

    // Add host as first player
    await ctx.db.insert("players", {
      roomId,
      playerId: args.hostId,
      playerName: args.hostName,
      score: 0,
      isHost: true,
      isCurrentDrawer: false,
      hasGuessed: false,
      joinedAt: now,
      lastActiveAt: now,
    });

    // Create player session
    await ctx.db.insert("playerSessions", {
      playerId: args.hostId,
      roomId,
      isActive: true,
      lastHeartbeat: now,
      createdAt: now,
    });

    // Add welcome message
    await ctx.db.insert("messages", {
      roomId,
      playerId: "system",
      playerName: "System",
      message: `Welcome to WebSlingers Sketchpad! ${args.hostName} created room ${roomCode}. Waiting for players to join...`,
      messageType: "system",
      timestamp: now,
    });

    return { roomId, roomCode };
  },
});

// Join an existing room
export const joinRoom = mutation({
  args: {
    roomCode: v.string(),
    playerId: v.string(),
    playerName: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_code", (q) => q.eq("roomCode", args.roomCode))
      .first();

    if (!room) {
      throw new Error("Room not found");
    }

    if (room.gameState === "finished") {
      throw new Error("Game has already finished");
    }

    // Check if player already exists in room
    const existingPlayer = await ctx.db
      .query("players")
      .withIndex("by_room_and_player", (q) => 
        q.eq("roomId", room._id).eq("playerId", args.playerId)
      )
      .first();

    if (existingPlayer) {
      // Update existing player session
      await ctx.db.patch(existingPlayer._id, {
        lastActiveAt: Date.now(),
        hasGuessed: false,
      });

      await ctx.db.insert("messages", {
        roomId: room._id,
        playerId: "system",
        playerName: "System",
        message: `${args.playerName} rejoined the game!`,
        messageType: "system",
        timestamp: Date.now(),
      });

      return { roomId: room._id, roomCode: room.roomCode };
    }

    const now = Date.now();

    // Add new player
    await ctx.db.insert("players", {
      roomId: room._id,
      playerId: args.playerId,
      playerName: args.playerName,
      score: 0,
      isHost: false,
      isCurrentDrawer: false,
      hasGuessed: false,
      joinedAt: now,
      lastActiveAt: now,
    });

    // Create player session
    await ctx.db.insert("playerSessions", {
      playerId: args.playerId,
      roomId: room._id,
      isActive: true,
      lastHeartbeat: now,
      createdAt: now,
    });

    // Add join message
    await ctx.db.insert("messages", {
      roomId: room._id,
      playerId: "system",
      playerName: "System",
      message: `${args.playerName} joined the game! 🕷️`,
      messageType: "system",
      timestamp: now,
    });

    return { roomId: room._id, roomCode: room.roomCode };
  },
});

// Get room details
export const getRoom = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_room_code", (q) => q.eq("roomCode", args.roomCode))
      .first();

    if (!room) {
      return null;
    }

    return room;
  },
});

// Get all players in a room
export const getPlayers = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    return players.sort((a, b) => a.joinedAt - b.joinedAt);
  },
});

// Get recent messages for a room
export const getMessages = query({
  args: { roomId: v.id("rooms"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room_and_time", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .take(args.limit || 50);

    return messages.reverse();
  },
});

// Start the game
export const startGame = mutation({
  args: { roomId: v.id("rooms"), hostId: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.hostId !== args.hostId) {
      throw new Error("Only the host can start the game");
    }

    if (room.gameState !== "waiting") {
      throw new Error("Game has already started");
    }

    const players = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    if (players.length < 2) {
      throw new Error("Need at least 2 players to start the game");
    }

    // Set first drawer
    const firstDrawer = players[0];
    await ctx.db.patch(firstDrawer._id, { isCurrentDrawer: true });

    // Update room state
    await ctx.db.patch(args.roomId, {
      gameState: "playing",
      currentDrawerId: firstDrawer.playerId,
      isDrawing: true,
      updatedAt: Date.now(),
    });

    // Add start message
    await ctx.db.insert("messages", {
      roomId: args.roomId,
      playerId: "system",
      playerName: "System",
      message: `🎮 Game started! ${firstDrawer.playerName} is drawing first!`,
      messageType: "system",
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

// Update room settings (host only)
export const updateRoomSettings = mutation({
  args: {
    roomId: v.id("rooms"),
    hostId: v.string(),
    maxRounds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.hostId !== args.hostId) {
      throw new Error("Only the host can update room settings");
    }

    const updateData: any = { updatedAt: Date.now() };
    if (args.maxRounds !== undefined) {
      updateData.maxRounds = args.maxRounds;
    }

    await ctx.db.patch(args.roomId, updateData);
    return { success: true };
  },
});

// Leave room
export const leaveRoom = mutation({
  args: {
    roomId: v.id("rooms"),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_room_and_player", (q) => 
        q.eq("roomId", args.roomId).eq("playerId", args.playerId)
      )
      .first();

    if (!player) {
      return { success: false };
    }

    const room = await ctx.db.get(args.roomId);
    if (!room) {
      return { success: false };
    }

    // Remove player
    await ctx.db.delete(player._id);

    // Update player session
    const session = await ctx.db
      .query("playerSessions")
      .withIndex("by_player", (q) => q.eq("playerId", args.playerId))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        isActive: false,
        roomId: undefined,
        lastHeartbeat: Date.now(),
      });
    }

    // Add leave message
    await ctx.db.insert("messages", {
      roomId: args.roomId,
      playerId: "system",
      playerName: "System",
      message: `${player.playerName} left the game`,
      messageType: "system",
      timestamp: Date.now(),
    });

    // If host left, transfer host to another player
    if (player.isHost) {
      const remainingPlayers = await ctx.db
        .query("players")
        .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
        .collect();

      if (remainingPlayers.length > 0) {
        const newHost = remainingPlayers[0];
        await ctx.db.patch(newHost._id, { isHost: true });

        await ctx.db.patch(args.roomId, {
          hostId: newHost.playerId,
          hostName: newHost.playerName,
          updatedAt: Date.now(),
        });

        await ctx.db.insert("messages", {
          roomId: args.roomId,
          playerId: "system",
          playerName: "System",
          message: `${newHost.playerName} is now the host`,
          messageType: "system",
          timestamp: Date.now(),
        });
      } else {
        // No players left, delete room
        await ctx.db.delete(args.roomId);
      }
    }

    return { success: true };
  },
});

// Generate a random room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
