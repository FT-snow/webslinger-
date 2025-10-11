# 🕷️ WebSlingers Sketchpad

A real-time multiplayer drawing and guessing game themed around Spider-Man, built with Next.js, WebSockets, and TypeScript.

## 🎮 Features

- **Real-time Multiplayer**: Draw and guess with friends in real-time
- **Spider-Man Themed**: Immersive Spider-Man aesthetic with themed words
- **WebSocket Backend**: Fast, lightweight real-time communication
- **AI-Powered Words**: OpenAI integration for dynamic word suggestions
- **Beautiful UI**: Animated components with GSAP and Three.js

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or bun package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/FT-snow/webslinger-.git
cd webslinger-
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:
```env
# OpenAI API Key (for word generation)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# WebSocket Server URL
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

4. **Start the WebSocket server**
```bash
npm run server
```

5. **In a new terminal, start the Next.js development server**
```bash
npm run dev
```

Or run both simultaneously:
```bash
npm run dev:all
```

6. **Open your browser**

Navigate to `http://localhost:3000` to start playing!

## 📁 Project Structure

```
webslingers-sketchpad/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks (useWebSocket)
│   └── lib/              # Utility functions
├── server/
│   └── websocket-server.js  # WebSocket backend server
├── public/               # Static assets
└── package.json
```

## 🎨 Game Flow

1. **Create or Join a Room**
   - Enter your Spider-Man nickname
   - Create a new room or join with a room code

2. **Start the Game**
   - Host selects the number of rounds
   - First player is chosen as the drawer

3. **Draw and Guess**
   - Drawer selects from Spider-Man themed words
   - Other players guess the word in real-time
   - Points awarded based on speed

4. **Win**
   - Player with the highest score wins!

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, GSAP animations
- **3D/Graphics**: Three.js, OGL
- **Backend**: Node.js, WebSocket (ws)
- **AI**: OpenAI API for word generation

## 🕸️ WebSocket Events

### Client → Server
- `create_room`: Create a new game room
- `join_room`: Join an existing room
- `start_game`: Start the game (host only)
- `send_message`: Send a chat message
- `send_guess`: Submit a guess
- `drawing_data`: Send drawing strokes
- `select_word`: Choose a word to draw
- `update_room_settings`: Update room configuration

### Server → Client
- `connected`: Connection established
- `room_created`: Room successfully created
- `room_joined`: Successfully joined room
- `player_joined`: New player joined
- `game_started`: Game has begun
- `drawing_update`: New drawing data
- `new_message`: New chat message
- `correct_guess`: Player guessed correctly
- `timer_update`: Time remaining update
- `round_ended`: Round finished
- `game_ended`: Game finished

## 🚢 Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Import project on Vercel
3. Add environment variables
4. Deploy

### Backend (Railway/Render/Heroku)
1. Create a new project on your platform
2. Set `PORT` environment variable
3. Deploy the `server/` directory
4. Update `NEXT_PUBLIC_WS_URL` in your frontend environment variables

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_OPENAI_API_KEY` | OpenAI API key for word generation | `sk-...` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `ws://localhost:8080` |
| `PORT` | Server port (backend) | `8080` |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning or personal use.

## 🕷️ Credits

Built with ❤️ by the WebSlingers team. Inspired by Skribbl.io and Gartic Phone.

