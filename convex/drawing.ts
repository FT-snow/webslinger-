import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send drawing data to room
export const sendDrawingData = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Check if player is the current drawer
    if (room.currentDrawerId !== args.playerId) {
      throw new Error("Only the current drawer can draw");
    }

    if (!room.isDrawing) {
      throw new Error("Drawing is not active");
    }

    // Store drawing data
    await ctx.db.insert("drawingData", {
      roomId: args.roomId,
      playerId: args.playerId,
      drawingType: args.drawingType,
      x: args.x,
      y: args.y,
      color: args.color,
      brushSize: args.brushSize,
      tool: args.tool,
      timestamp: Date.now(),
    });

    // If it's a clear action, we might want to handle it specially
    if (args.drawingType === "clear") {
      // Could add logic here to notify other players about canvas clear
    }

    return { success: true };
  },
});

// Get drawing data for a room
export const getDrawingData = query({
  args: { 
    roomId: v.id("rooms"),
    since: v.optional(v.number()) // Timestamp to get data since
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("drawingData")
      .withIndex("by_room_and_time", (q) => q.eq("roomId", args.roomId));

    if (args.since) {
      query = query.filter((q) => q.gt(q.field("timestamp"), args.since));
    }

    const drawingData = await query
      .order("asc")
      .collect();

    return drawingData;
  },
});

// Clear canvas (drawer only)
export const clearCanvas = mutation({
  args: {
    roomId: v.id("rooms"),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Check if player is the current drawer
    if (room.currentDrawerId !== args.playerId) {
      throw new Error("Only the current drawer can clear the canvas");
    }

    // Send clear drawing data
    await ctx.db.insert("drawingData", {
      roomId: args.roomId,
      playerId: args.playerId,
      drawingType: "clear",
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

// Start drawing (when word is selected)
export const startDrawing = mutation({
  args: {
    roomId: v.id("rooms"),
    playerId: v.string(),
    word: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Check if player is the current drawer
    if (room.currentDrawerId !== args.playerId) {
      throw new Error("Only the current drawer can start drawing");
    }

    // Create word hint (underscores)
    const wordHint = args.word.split('').map(() => '_').join(' ');

    // Update room with word and start drawing
    await ctx.db.patch(args.roomId, {
      currentWord: args.word,
      wordHint: wordHint,
      isDrawing: true,
      timeLeft: 120, // 2 minutes
      updatedAt: Date.now(),
    });

    // Clear previous drawing data
    const existingDrawingData = await ctx.db
      .query("drawingData")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    // Delete old drawing data
    for (const data of existingDrawingData) {
      await ctx.db.delete(data._id);
    }

    // Add system message
    const drawer = await ctx.db
      .query("players")
      .withIndex("by_room_and_player", (q) => 
        q.eq("roomId", args.roomId).eq("playerId", args.playerId)
      )
      .first();

    await ctx.db.insert("messages", {
      roomId: args.roomId,
      playerId: "system",
      playerName: "System",
      message: `${drawer?.playerName || 'Someone'} is now drawing! Start guessing! 🎨`,
      messageType: "system",
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

// End drawing (when time runs out or word is guessed)
export const endDrawing = mutation({
  args: {
    roomId: v.id("rooms"),
    reason: v.union(
      v.literal("timeout"),
      v.literal("word_guessed"),
      v.literal("manual")
    ),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Update room state
    await ctx.db.patch(args.roomId, {
      isDrawing: false,
      timeLeft: 0,
      updatedAt: Date.now(),
    });

    // Add system message
    let message = "Drawing time ended!";
    if (args.reason === "word_guessed") {
      message = `Word was guessed correctly! The answer was: ${room.currentWord}`;
    } else if (args.reason === "timeout") {
      message = `Time's up! The word was: ${room.currentWord}`;
    }

    await ctx.db.insert("messages", {
      roomId: args.roomId,
      playerId: "system",
      playerName: "System",
      message: message,
      messageType: "system",
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

// Get current drawing state
export const getDrawingState = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      return null;
    }

    return {
      isDrawing: room.isDrawing,
      currentWord: room.currentWord,
      wordHint: room.wordHint,
      timeLeft: room.timeLeft,
      currentDrawerId: room.currentDrawerId,
    };
  },
});
