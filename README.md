# Spy Game Backend

Backend server for a WePlay Spy-like multiplayer game built with Express.js, Socket.io, and MongoDB.

## Features

- **User Management**: Guest mode and authenticated users (Email/Google OAuth)
- **Room System**: Create/join rooms with 6-digit codes
- **Real-time Gameplay**: WebSocket-based game flow
- **Game Mechanics**: 
  - Spy selection and word assignment
  - Clue phase with turn-based gameplay
  - Voting mechanism
  - Spy guess phase
- **Social Features**: Friends system, private chat, online presence
- **Voice Support**: WebRTC signaling for voice chat
- **Throw Things**: Fun emoji/props throwing mechanic

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **WebSocket**: Socket.io
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Passport.js (Google OAuth)
- **Logging**: Winston

## Project Structure

```
backend/
├── src/
│   ├── app.js                 # Express app setup
│   ├── server.js              # Server entry point
│   ├── config/                # Configuration files
│   ├── api/                   # REST API
│   │   ├── controllers/       # Request handlers
│   │   ├── routes/            # API routes
│   │   ├── validators/        # Input validation
│   │   └── middlewares/       # Custom middlewares
│   ├── services/              # Business logic
│   ├── sockets/               # Socket.io handlers
│   ├── models/                # Mongoose models
│   ├── utils/                 # Utility functions
│   └── constants/             # Constants and enums
├── tests/                     # Test files
├── package.json
├── Dockerfile
└── docker-compose.yml
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- Google OAuth credentials (for Google login)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd SpyGameBackend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`)
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/spygame
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
CORS_ORIGIN=http://localhost:3000
```

5. Create logs directory
```bash
mkdir -p logs
```

6. Start MongoDB (if running locally)
```bash
mongod
```

7. Run the server
```bash
# Development
npm run dev

# Production
npm start
```

## Docker Setup

### Build and run with Docker

```bash
# Build image
docker build -t spy-game-backend .

# Run container
docker run -p 3000:3000 --env-file .env spy-game-backend
```

### Docker Compose

```bash
docker-compose up -d
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/guest` - Create guest user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Users
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user stats

### Friends
- `GET /api/friends` - Get friends list
- `GET /api/friends/requests` - Get friend requests
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept` - Accept friend request
- `POST /api/friends/reject` - Reject friend request
- `DELETE /api/friends/:friendId` - Remove friend

### Rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/:roomCode` - Get room details
- `POST /api/rooms/join` - Join room
- `POST /api/rooms/leave` - Leave room
- `POST /api/rooms/ready` - Toggle ready status

### Games
- `GET /api/games/:gameId` - Get game state

## Socket Events

### Room Events
- `join_room` - Join a room
- `leave_room` - Leave a room
- `room_joined` - Room joined confirmation
- `room_updated` - Room state update
- `player_ready` - Toggle ready status

### Game Events
- `game_start` - Start game
- `game_state_update` - Game state changed
- `clue_phase_start` - Clue phase begins
- `submit_clue` - Submit clue
- `voting_phase_start` - Voting phase begins
- `cast_vote` - Cast vote
- `voting_results` - Voting results
- `spy_guess_start` - Spy guess phase
- `submit_spy_guess` - Submit spy guess
- `game_end` - Game ended

### Chat Events
- `send_message` - Send chat message
- `message_received` - Receive message
- `typing_start` - Typing indicator start
- `typing_stop` - Typing indicator stop

### Voice Events
- `voice_offer` - WebRTC offer
- `voice_answer` - WebRTC answer
- `voice_ice_candidate` - ICE candidate

### Throw Things
- `throw_item` - Throw emoji/prop
- `item_thrown` - Item thrown broadcast

## Game Flow

1. **Room Creation**: Host creates room, gets 6-digit code
2. **Players Join**: Players join via code or invite link
3. **Game Start**: Host selects category and starts game
4. **Spy Selection**: Random spy selected, words assigned
5. **Clue Phase**: Players give clues one-by-one
6. **Voting Phase**: All players vote on suspected spy
7. **Result Processing**:
   - If spy voted out → Spy guess phase
   - If villager voted out → New round or game end
8. **Game End**: Winner determined, stats updated

## Categories & Word Pairs

Predefined word pairs for:
- Food
- Animals
- Places
- Movies
- Jobs
- Sports
- Countries
- Objects

Each category has 15+ word pairs with similar but different words for spy.

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Environment Variables

See `.env.example` for all available environment variables.

## License

ISC

