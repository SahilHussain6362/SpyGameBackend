# Complete cURL Commands for All APIs

All cURL commands for testing the Spy Game Backend APIs.

**Base URL**: `http://localhost:3000`

---

## Health Check

### GET /health
```bash
curl http://localhost:3000/health | jq
```

---

## Authentication APIs

### POST /api/auth/register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }' | jq
```

### POST /api/auth/login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }' | jq
```

### POST /api/auth/guest
```bash
curl -X POST http://localhost:3000/api/auth/guest \
  -H "Content-Type: application/json" \
  -d '{
    "username": "guest_user"
  }' | jq
```

### POST /api/auth/logout
```bash
# First get token from login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

# Then logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### GET /api/auth/google
```bash
# Opens browser for Google OAuth
curl -L http://localhost:3000/api/auth/google
```

### GET /api/auth/google/callback
```bash
# This is handled automatically by Google OAuth redirect
# Not typically called directly via curl
```

---

## User APIs

### GET /api/users/profile
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN" | jq
```

### PATCH /api/users/profile
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

curl -X PATCH http://localhost:3000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "new_username",
    "avatar": "https://example.com/avatar.jpg"
  }' | jq
```

### GET /api/users/stats
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

curl http://localhost:3000/api/users/stats \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Friends APIs

### GET /api/friends
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

curl http://localhost:3000/api/friends \
  -H "Authorization: Bearer $TOKEN" | jq
```

### GET /api/friends/requests
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

curl http://localhost:3000/api/friends/requests \
  -H "Authorization: Bearer $TOKEN" | jq
```

### POST /api/friends/request
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

# Replace USER_ID_TO_ADD with actual user ID
curl -X POST http://localhost:3000/api/friends/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "toUserId": "USER_ID_TO_ADD"
  }' | jq
```

### POST /api/friends/accept
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

# Replace REQUEST_ID with actual friend request ID
curl -X POST http://localhost:3000/api/friends/accept \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "friendRequestId": "REQUEST_ID"
  }' | jq
```

### POST /api/friends/reject
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

# Replace REQUEST_ID with actual friend request ID
curl -X POST http://localhost:3000/api/friends/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "friendRequestId": "REQUEST_ID"
  }' | jq
```

### DELETE /api/friends/:friendId
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

# Replace FRIEND_ID with actual friend user ID
curl -X DELETE http://localhost:3000/api/friends/FRIEND_ID \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Room APIs

### POST /api/rooms
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "maxPlayers": 8,
    "isPrivate": false
  }' | jq
```

### GET /api/rooms/:roomCode
```bash
# Optional auth for spectators
curl http://localhost:3000/api/rooms/123456 | jq

# With auth
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

curl http://localhost:3000/api/rooms/123456 \
  -H "Authorization: Bearer $TOKEN" | jq
```

### POST /api/rooms/join
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

curl -X POST http://localhost:3000/api/rooms/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "roomCode": "123456",
    "asSpectator": false
  }' | jq
```

### POST /api/rooms/leave
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

curl -X POST http://localhost:3000/api/rooms/leave \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "roomCode": "123456"
  }' | jq
```

### POST /api/rooms/ready
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

curl -X POST http://localhost:3000/api/rooms/ready \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "roomCode": "123456",
    "isReady": true
  }' | jq
```

---

## Game APIs

### GET /api/games/:gameId
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' | jq -r '.data.token')

# Replace GAME_ID with actual game ID
curl http://localhost:3000/api/games/GAME_ID \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Complete Test Flow

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "test123"
  }' | jq
```

### 2. Login and Save Token
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }' | jq -r '.data.token')

echo "Token saved: $TOKEN"
```

### 3. Get User Profile
```bash
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 4. Create a Room
```bash
ROOM_RESPONSE=$(curl -s -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "maxPlayers": 6,
    "isPrivate": false
  }')

ROOM_CODE=$(echo $ROOM_RESPONSE | jq -r '.data.roomCode')
echo "Room Code: $ROOM_CODE"
```

### 5. Get Room Details
```bash
curl http://localhost:3000/api/rooms/$ROOM_CODE \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 6. Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Helper Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Testing Spy Game Backend APIs ===${NC}\n"

# 1. Health Check
echo -e "${GREEN}1. Health Check${NC}"
curl -s $BASE_URL/health | jq

# 2. Register
echo -e "\n${GREEN}2. Register User${NC}"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"test123"}')

echo $REGISTER_RESPONSE | jq

# 3. Login
echo -e "\n${GREEN}3. Login${NC}"
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"

# 4. Get Profile
echo -e "\n${GREEN}4. Get Profile${NC}"
curl -s $BASE_URL/api/users/profile \
  -H "Authorization: Bearer $TOKEN" | jq

# 5. Create Room
echo -e "\n${GREEN}5. Create Room${NC}"
ROOM_RESPONSE=$(curl -s -X POST $BASE_URL/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"maxPlayers":6}')

ROOM_CODE=$(echo $ROOM_RESPONSE | jq -r '.data.roomCode')
echo "Room Code: $ROOM_CODE"
echo $ROOM_RESPONSE | jq

# 6. Logout
echo -e "\n${GREEN}6. Logout${NC}"
curl -s -X POST $BASE_URL/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n${BLUE}=== Test Complete ===${NC}"
```

Make it executable:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Quick Reference

### Public Endpoints (No Auth)
- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/guest`
- `GET /api/auth/google`
- `GET /api/rooms/:roomCode` (optional auth)

### Protected Endpoints (Require Bearer Token)
- `POST /api/auth/logout`
- `GET /api/users/profile`
- `PATCH /api/users/profile`
- `GET /api/users/stats`
- All `/api/friends/*`
- All `/api/rooms/*` (except GET by code)
- All `/api/games/*`

---

## Notes

1. Replace `YOUR_TOKEN_HERE` with actual JWT token from login/register
2. Replace placeholder IDs (`USER_ID`, `ROOM_CODE`, etc.) with actual values
3. Use `| jq` for pretty JSON output (requires jq installed)
4. Save token to variable: `TOKEN=$(curl ... | jq -r '.data.token')`
5. All timestamps are in ISO 8601 format
6. Rate limiting: 100 requests per 15 minutes per IP

