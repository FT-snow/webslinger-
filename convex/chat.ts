import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a chat message
export const sendMessage = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    // Check if player exists in room
    const player = await ctx.db
      .query("players")
      .withIndex("by_room_and_player", (q) => 
        q.eq("roomId", args.roomId).eq("playerId", args.playerId)
      )
      .first();

    if (!player && args.messageType !== "system") {
      throw new Error("Player not found in room");
    }

    // If it's a guess, check if it's correct
    let isCorrect = false;
    if (args.messageType === "guess" && room.currentWord) {
      isCorrect = args.message.toLowerCase().trim() === room.currentWord.toLowerCase();
      
      if (isCorrect) {
        // Update player score based on time left
        const timeBonus = Math.floor(room.timeLeft * 2);
        await ctx.db.patch(player._id, {
          score: player.score + timeBonus,
          hasGuessed: true,
        });

        // Add correct guess message
        await ctx.db.insert("messages", {
          roomId: args.roomId,
          playerId: "system",
          playerName: "System",
          message: `🎉 ${args.playerName} guessed correctly! It was "${room.currentWord}"! (+${timeBonus} points)`,
          messageType: "system",
          timestamp: Date.now(),
        });

        // End the drawing round
        await ctx.db.patch(args.roomId, {
          isDrawing: false,
          timeLeft: 0,
          updatedAt: Date.now(),
        });

        // Create game round record
        await ctx.db.insert("gameRounds", {
          roomId: args.roomId,
          roundNumber: room.currentRound,
          word: room.currentWord,
          drawerId: room.currentDrawerId || "",
          drawerName: "", // Will be filled by querying player data
          correctGuesses: [{
            playerId: args.playerId,
            playerName: args.playerName,
            guess: args.message,
            score: timeBonus,
            timestamp: Date.now(),
          }],
          roundStartTime: Date.now() - (room.timeLeft * 1000),
          isCompleted: true,
        });

        return { isCorrect: true, score: timeBonus };
      }
    }

    // Store the message
    await ctx.db.insert("messages", {
      roomId: args.roomId,
      playerId: args.playerId,
      playerName: args.playerName,
      message: args.message,
      messageType: args.messageType,
      isCorrect: isCorrect,
      timestamp: Date.now(),
    });

    return { isCorrect: false };
  },
});

// Get messages for a room
export const getMessages = query({
  args: { 
    roomId: v.id("rooms"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room_and_time", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .take(args.limit || 50);

    return messages.reverse();
  },
});

// Get recent messages (for real-time updates)
export const getRecentMessages = query({
  args: { 
    roomId: v.id("rooms"),
    since: v.number() // Timestamp to get messages since
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_room_and_time", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.gt(q.field("timestamp"), args.since))
      .order("asc")
      .collect();

    return messages;
  },
});

// Send a guess
export const sendGuess = mutation({
  args: {
    roomId: v.id("rooms"),
    playerId: v.string(),
    playerName: v.string(),
    guess: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (!room.isDrawing) {
      throw new Error("No active drawing round");
    }

    // Check if player has already guessed
    const player = await ctx.db
      .query("players")
      .withIndex("by_room_and_player", (q) => 
        q.eq("roomId", args.roomId).eq("playerId", args.playerId)
      )
      .first();

    if (!player) {
      throw new Error("Player not found in room");
    }

    if (player.hasGuessed) {
      throw new Error("You have already guessed this round");
    }

    if (player.isCurrentDrawer) {
      throw new Error("You cannot guess your own drawing");
    }

    // Send as a guess message
    return await ctx.runMutation("chat:sendMessage", {
      roomId: args.roomId,
      playerId: args.playerId,
      playerName: args.playerName,
      message: args.guess,
      messageType: "guess",
    });
  },
});

// Get player's guess status
export const getPlayerGuessStatus = query({
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
      return null;
    }

    return {
      hasGuessed: player.hasGuessed,
      isCurrentDrawer: player.isCurrentDrawer,
      score: player.score,
    };
  },
});
