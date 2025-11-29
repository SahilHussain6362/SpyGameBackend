# API Documentation

Complete list of all API endpoints in the Spy Game Backend.

**Base URL**: `http://localhost:3000` (or your server URL)

---

## Health Check

### GET `/health`
Health check endpoint with database connection and write test.

**Authentication**: Not required

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": {
    "status": "connected",
    "readyState": 1,
    "connected": true,
    "host": "localhost:27017",
    "name": "spygame",
    "writeTest": { ... },
    "entry": { ... }
  }
}
```

---

## Authentication APIs

### POST `/api/auth/register`
Register a new user with email and password.

**Authentication**: Not required

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "userId": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "isGuest": false
    },
    "token": "jwt_token_here"
  }
}
```

---

### POST `/api/auth/login`
Login with email and password.

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "userId": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "isGuest": false,
      "avatar": "url"
    },
    "token": "jwt_token_here"
  }
}
```

---

### POST `/api/auth/guest`
Create a guest user (no signup required).

**Authentication**: Not required

**Request Body**:
```json
{
  "username": "guest_user"
}
```

**Response**:
```json
{
  "message": "Guest user created",
  "data": {
    "user": {
      "userId": "uuid",
      "username": "guest_user",
      "isGuest": true
    },
    "token": "jwt_token_here"
  }
}
```

---

### GET `/api/auth/google`
Initiate Google OAuth login.

**Authentication**: Not required

**Description**: Redirects to Google OAuth consent screen.

---

### GET `/api/auth/google/callback`
Google OAuth callback endpoint.

**Authentication**: Not required

**Description**: Handles Google OAuth callback and redirects to frontend with token.

---

## User APIs

### GET `/api/users/profile`
Get current user's profile.

**Authentication**: Required (Bearer token)

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "message": "Profile retrieved successfully",
  "data": {
    "userId": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": "url",
    "isGuest": false,
    "friends": [ ... ],
    "stats": { ... },
    "gameHistory": [ ... ]
  }
}
```

---

### PATCH `/api/users/profile`
Update user profile.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "username": "new_username",
  "avatar": "avatar_url"
}
```

**Response**:
```json
{
  "message": "Profile updated successfully",
  "data": {
    "userId": "uuid",
    "username": "new_username",
    "avatar": "avatar_url",
    ...
  }
}
```

---

### GET `/api/users/stats`
Get user statistics.

**Authentication**: Required (Bearer token)

**Response**:
```json
{
  "message": "Stats retrieved successfully",
  "data": {
    "stats": {
      "gamesPlayed": 10,
      "gamesWon": 6,
      "spyWins": 2,
      "villagerWins": 4
    },
    "recentGames": [ ... ]
  }
}
```

---

## Friends APIs

### GET `/api/friends`
Get user's friends list.

**Authentication**: Required (Bearer token)

**Response**:
```json
{
  "message": "Friends retrieved successfully",
  "data": [
    {
      "userId": "uuid",
      "username": "friend_username",
      "avatar": "url",
      "isOnline": true
    }
  ]
}
```

---

### GET `/api/friends/requests`
Get pending friend requests.

**Authentication**: Required (Bearer token)

**Response**:
```json
{
  "message": "Friend requests retrieved successfully",
  "data": [
    {
      "_id": "request_id",
      "user1": {
        "userId": "uuid",
        "username": "requester",
        "avatar": "url"
      },
      "status": "pending",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/friends/request`
Send a friend request.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "toUserId": "user_id_to_send_request"
}
```

**Response**:
```json
{
  "message": "Friend request sent",
  "data": {
    "_id": "request_id",
    "user1": { ... },
    "user2": { ... },
    "status": "pending"
  }
}
```

---

### POST `/api/friends/accept`
Accept a friend request.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "friendRequestId": "request_id"
}
```

**Response**:
```json
{
  "message": "Friend request accepted",
  "data": {
    "_id": "request_id",
    "user1": { ... },
    "user2": { ... },
    "status": "accepted"
  }
}
```

---

### POST `/api/friends/reject`
Reject a friend request.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "friendRequestId": "request_id"
}
```

**Response**:
```json
{
  "message": "Friend request rejected",
  "data": {
    "message": "Friend request rejected"
  }
}
```

---

### DELETE `/api/friends/:friendId`
Remove a friend.

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `friendId`: User ID of friend to remove

**Response**:
```json
{
  "message": "Friend removed",
  "data": {
    "message": "Friend removed"
  }
}
```

---

## Room APIs

### POST `/api/rooms`
Create a new game room.

**Authentication**: Required (Bearer token)

**Request Body** (optional):
```json
{
  "maxPlayers": 8,
  "isPrivate": false
}
```

**Response**:
```json
{
  "message": "Room created successfully",
  "data": {
    "roomId": "uuid",
    "roomCode": "123456",
    "host": { ... },
    "players": [],
    "spectators": [],
    "settings": {
      "maxPlayers": 8,
      "maxSpectators": 10,
      "isPrivate": false
    },
    "inviteLink": "http://localhost:3000/join/123456",
    "status": "waiting"
  }
}
```

---

### GET `/api/rooms/:roomCode`
Get room details by room code.

**Authentication**: Optional (for spectators)

**URL Parameters**:
- `roomCode`: 6-digit room code

**Response**:
```json
{
  "message": "Room retrieved successfully",
  "data": {
    "roomId": "uuid",
    "roomCode": "123456",
    "host": { ... },
    "players": [ ... ],
    "spectators": [ ... ],
    "status": "waiting"
  }
}
```

---

### POST `/api/rooms/join`
Join a room.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "roomCode": "123456",
  "asSpectator": false
}
```

**Response**:
```json
{
  "message": "Joined room successfully",
  "data": {
    "roomId": "uuid",
    "roomCode": "123456",
    "players": [ ... ],
    "spectators": [ ... ]
  }
}
```

---

### POST `/api/rooms/leave`
Leave a room.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "roomCode": "123456"
}
```

**Response**:
```json
{
  "message": "Left room successfully",
  "data": {
    "roomId": "uuid",
    "roomCode": "123456",
    "players": [ ... ]
  }
}
```

---

### POST `/api/rooms/ready`
Toggle ready status in room.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "roomCode": "123456",
  "isReady": true
}
```

**Response**:
```json
{
  "message": "Ready status updated",
  "data": {
    "roomId": "uuid",
    "roomCode": "123456",
    "players": [
      {
        "userId": "uuid",
        "username": "player1",
        "isReady": true
      }
    ]
  }
}
```

---

## Game APIs

### GET `/api/games/:gameId`
Get game state.

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `gameId`: Game ID

**Response**:
```json
{
  "message": "Game state retrieved successfully",
  "data": {
    "gameId": "uuid",
    "roomId": "uuid",
    "category": "food",
    "currentRound": 1,
    "currentState": "clue_phase",
    "currentTurn": 0,
    "players": [ ... ],
    "rounds": [ ... ],
    "winner": null
  }
}
```

**Note**: Word is only shown to the player themselves or after game ends.

---

## WebSocket Events

All WebSocket events are available at the same server URL. Connect using Socket.IO client.

### Connection
- **Event**: `connection`
- **Auth**: Optional (token in handshake)

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

---

## Authentication

Most endpoints require authentication using JWT Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

Get token from:
- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/guest`
- `/api/auth/google/callback`

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "message": "Error message here",
  "stack": "Error stack (only in development)"
}
```

**Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (database issues)

---

## Rate Limiting

All `/api/*` endpoints are rate limited:
- **Window**: 15 minutes (900000ms)
- **Max Requests**: 100 per window
- **Error**: `429 Too Many Requests`

---

## Complete API Summary

### Total Endpoints: 18 REST APIs + WebSocket Events

**Health Check**: 1 endpoint
**Authentication**: 5 endpoints
**Users**: 3 endpoints
**Friends**: 6 endpoints
**Rooms**: 5 endpoints
**Games**: 1 endpoint
**WebSocket**: Multiple real-time events

---

## Testing APIs

### Using cURL

```bash
# Health check
curl http://localhost:3000/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get profile (with token)
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <token>"
```

### Using Postman/Insomnia

Import the endpoints and set:
- Base URL: `http://localhost:3000`
- Auth Type: Bearer Token (for protected endpoints)
- Headers: `Content-Type: application/json`

