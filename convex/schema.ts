import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Game Rooms
  rooms: defineTable({
    roomCode: v.string(),
    hostId: v.string(),
    hostName: v.string(),
    maxRounds: v.number(),
    currentRound: v.number(),
    gameState: v.union(
      v.literal("waiting"), // Waiting for players
      v.literal("playing"), // Game in progress
      v.literal("finished") // Game completed
    ),
    currentWord: v.optional(v.string()),
    wordHint: v.optional(v.string()),
    timeLeft: v.number(),
    isDrawing: v.boolean(),
    currentDrawerId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_room_code", ["roomCode"])
    .index("by_host", ["hostId"])
    .index("by_game_state", ["gameState"]),

  // Players in rooms
  players: defineTable({
    roomId: v.id("rooms"),
    playerId: v.string(), // Unique player identifier
    playerName: v.string(),
    score: v.number(),
    isHost: v.boolean(),
    isCurrentDrawer: v.boolean(),
    hasGuessed: v.boolean(),
    joinedAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_player", ["playerId"])
    .index("by_room_and_player", ["roomId", "playerId"]),

  // Chat messages
  messages: defineTable({
    roomId: v.id("rooms"),
    playerId: v.string(),
    playerName: v.string(),
    message: v.string(),
    messageType: v.union(
      v.literal("chat"),
      v.literal("guess"),
      v.literal("correct"),
      v.literal("system")
    ),
    isCorrect: v.optional(v.boolean()),
    timestamp: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_time", ["roomId", "timestamp"]),

  // Drawing data for real-time synchronization
  drawingData: defineTable({
    roomId: v.id("rooms"),
    playerId: v.string(),
    drawingType: v.union(
      v.literal("start"),
      v.literal("draw"),
      v.literal("end"),
      v.literal("clear")
    ),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
    color: v.optional(v.string()),
    brushSize: v.optional(v.number()),
    tool: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_time", ["roomId", "timestamp"]),

  // Game rounds and scoring
  gameRounds: defineTable({
    roomId: v.id("rooms"),
    roundNumber: v.number(),
    word: v.string(),
    drawerId: v.string(),
    drawerName: v.string(),
    correctGuesses: v.array(v.object({
      playerId: v.string(),
      playerName: v.string(),
      guess: v.string(),
      score: v.number(),
      timestamp: v.number(),
    })),
    roundStartTime: v.number(),
    roundEndTime: v.optional(v.number()),
    isCompleted: v.boolean(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_round", ["roomId", "roundNumber"]),

  // Player sessions for tracking active players
  playerSessions: defineTable({
    playerId: v.string(),
    roomId: v.optional(v.id("rooms")),
    isActive: v.boolean(),
    lastHeartbeat: v.number(),
    createdAt: v.number(),
  })
    .index("by_player", ["playerId"])
    .index("by_room", ["roomId"])
    .index("by_active", ["isActive"]),
});
