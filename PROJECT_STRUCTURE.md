# Project Structure Overview

## Complete File Structure

```
SpyGameBackend/
├── src/
│   ├── app.js                          # Express app configuration
│   ├── server.js                        # Server entry point with Socket.IO
│   │
│   ├── config/
│   │   ├── env.js                       # Environment variables
│   │   ├── db.js                        # MongoDB connection
│   │   └── logger.js                    # Winston logger setup
│   │
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js       # Auth endpoints (register, login, guest, Google)
│   │   │   ├── user.controller.js       # User profile & stats
│   │   │   ├── friends.controller.js    # Friends management
│   │   │   ├── room.controller.js       # Room CRUD operations
│   │   │   └── game.controller.js        # Game state retrieval
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js           # Auth routes with Passport
│   │   │   ├── user.routes.js           # User routes
│   │   │   ├── friends.routes.js        # Friends routes
│   │   │   ├── room.routes.js           # Room routes
│   │   │   └── game.routes.js           # Game routes
│   │   │
│   │   ├── validators/
│   │   │   ├── auth.validator.js        # Auth input validation
│   │   │   └── room.validator.js        # Room input validation
│   │   │
│   │   └── middlewares/
│   │       ├── auth.middleware.js        # JWT authentication
│   │       └── error.middleware.js      # Global error handler
│   │
│   ├── services/
│   │   ├── auth.service.js               # Authentication logic
│   │   ├── user.service.js               # User operations
│   │   ├── friends.service.js            # Friends operations
│   │   ├── room.service.js               # Room management
│   │   ├── game-engine.service.js         # Core game logic (spy selection, voting, etc.)
│   │   ├── websocket.service.js          # Socket connection tracking
│   │   └── voice-signaling.service.js    # WebRTC signaling
│   │
│   ├── sockets/
│   │   ├── index.js                      # Socket.IO initialization
│   │   ├── room.socket.js                # Room socket events
│   │   ├── game.socket.js                # Game socket events (includes throw things)
│   │   ├── chat.socket.js                # Chat socket events
│   │   └── voice.socket.js               # Voice/WebRTC socket events
│   │
│   ├── models/
│   │   ├── user.model.js                 # User schema (guest/auth, friends, stats)
│   │   ├── friend.model.js               # Friend relationships
│   │   ├── room.model.js                 # Room schema (players, spectators, settings)
│   │   ├── game.model.js                 # Game schema (rounds, votes, clues)
│   │   └── message.model.js              # Chat messages
│   │
│   ├── utils/
│   │   ├── jwt.js                        # JWT token generation/verification
│   │   ├── hashing.js                    # Password hashing (bcrypt)
│   │   ├── id-generator.js               # UUID & room code generation
│   │   └── enums.js                      # Enum exports
│   │
│   └── constants/
│       ├── game.constants.js             # Game rules, states, categories
│       ├── socket-events.js              # All Socket.IO event names
│       ├── roles.js                      # Player roles (SPY, VILLAGER, SPECTATOR)
│       └── word-pairs.js                 # Predefined word pairs per category
│
├── tests/
│   ├── unit/                             # Unit tests
│   └── integration/                      # Integration tests
│
├── logs/                                 # Application logs (Winston)
├── package.json                          # Dependencies & scripts
├── Dockerfile                            # Docker image configuration
├── docker-compose.yml                    # Docker Compose setup (includes MongoDB)
├── .env.example                          # Environment variables template
├── .gitignore                            # Git ignore rules
├── .dockerignore                         # Docker ignore rules
├── README.md                             # Project documentation
└── PROJECT_STRUCTURE.md                  # This file

```

## Module Breakdown

### 1. New User Module
- **Files**: `auth.controller.js`, `auth.service.js`, `auth.routes.js`, `auth.validator.js`
- **Features**: Guest creation, Email login, Google OAuth
- **Models**: `user.model.js` (supports both guest and authenticated users)

### 2. Game Module
- **Files**: `game-engine.service.js`, `game.socket.js`, `game.controller.js`
- **Features**: 
  - Spy selection & word assignment
  - Clue phase management
  - Voting mechanism
  - Spy guess phase
  - Throw things (emoji/props)
- **Models**: `game.model.js` (complete game state)

### 3. Friends Module
- **Files**: `friends.controller.js`, `friends.service.js`, `friends.routes.js`
- **Features**: Friend requests, friend list, online presence
- **Models**: `friend.model.js`, `user.model.js` (friends array)

### 4. Create a Room Module
- **Files**: `room.controller.js`, `room.service.js`, `room.routes.js`, `room.socket.js`
- **Features**: 
  - Room creation with 6-digit code
  - Invite links
  - Player/spectator management
  - Ready status
- **Models**: `room.model.js`

### 5. System Flow
- **Entry**: `server.js` → `app.js`
- **WebSocket**: `sockets/index.js` → individual socket handlers
- **Database**: MongoDB via Mongoose
- **Real-time**: Socket.IO for all game events

## Key Features Implemented

✅ Guest mode (temporary users)
✅ Email/Password authentication
✅ Google OAuth integration
✅ Room system with 6-digit codes
✅ WebSocket real-time communication
✅ Game engine with spy selection
✅ Predefined word pairs (8 categories, 15+ pairs each)
✅ Voting mechanism
✅ Spy guess phase
✅ Friends system
✅ Chat functionality
✅ Voice signaling (WebRTC)
✅ Throw things feature
✅ Spectator mode
✅ Player stats tracking
✅ Game history

## Next Steps

1. Set up environment variables (`.env`)
2. Install dependencies: `npm install`
3. Start MongoDB
4. Run server: `npm run dev`
5. Test API endpoints
6. Test Socket.IO connections
7. Add unit/integration tests

