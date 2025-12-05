# Frontend-Backend Connection Guide

Complete guide to connect and play the full Spy Game with frontend and backend integration.

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **MongoDB** (local or cloud - backend uses MongoDB Atlas by default)
3. **Two terminal windows** (one for backend, one for frontend)

---

## Step 1: Backend Setup

### 1.1 Navigate to Backend Directory

```bash
cd SpyGameBackend
```

### 1.2 Install Backend Dependencies

```bash
npm install
```

### 1.3 Configure Environment (Optional)

The backend has default configurations, but you can create a `.env` file:

```bash
# Create .env file in SpyGameBackend directory
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

**Note**: The backend already has a default MongoDB connection. You can use it as-is or configure your own.

### 1.4 Start Backend Server

```bash
npm run dev
```

You should see:
```
Server running on port 3000
Database connected successfully
```

**Keep this terminal open!**

---

## Step 2: Frontend Setup

### 2.1 Open New Terminal Window

Keep the backend terminal running, open a new terminal.

### 2.2 Navigate to Frontend Directory

```bash
cd SpyGameBackend/SpyGameFrontend
```

### 2.3 Install Frontend Dependencies

```bash
npm install
```

### 2.4 Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Keep this terminal open too!**

---

## Step 3: Verify Connection

### 3.1 Check Backend Health

Open browser and go to:
```
http://localhost:3000/health
```

You should see a JSON response with database status.

### 3.2 Check Frontend

Open browser and go to:
```
http://localhost:5173
```

You should see the Spy Game landing page.

### 3.3 Check Browser Console

1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Look for any connection errors
4. Go to "Network" tab to see API calls

---

## Step 4: Play the Full Game

### 4.1 Single Player Test (Quick Test)

1. **Open Frontend**: `http://localhost:5173`
2. **Click "GET STARTED"** or go to `/guest`
3. **Enter username**: e.g., "Player1"
4. **Click "CONTINUE AS GUEST"**
5. **You'll be redirected to Lobby**

**Note**: You need at least 4 players to start a game. For testing, see "Multi-Player Setup" below.

### 4.2 Multi-Player Setup (Full Game Test)

To play the full game, you need **4-8 players**. Here's how:

#### Option A: Multiple Browser Windows (Same Computer)

1. **Open 4 browser windows** (or use incognito mode)
2. **In each window**:
   - Go to `http://localhost:5173/guest`
   - Enter different usernames: "Player1", "Player2", "Player3", "Player4"
   - Click "CONTINUE AS GUEST"

3. **In one window (Player1)**:
   - Click "CREATE ROOM"
   - Copy the room code (e.g., "ABC123")

4. **In other windows (Player2, 3, 4)**:
   - Paste the room code
   - Click "JOIN ROOM"

5. **All players**:
   - Click "READY" button
   - Wait for all to be ready

6. **Host (Player1)**:
   - Click "START GAME" button
   - Game will begin automatically!

#### Option B: Multiple Devices (Network)

1. **Find your local IP address**:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
   Look for IPv4 address (e.g., `192.168.1.100`)

2. **Update Vite config** (temporarily):
   - Edit `SpyGameFrontend/vite.config.js`
   - Change server config to:
   ```javascript
   server: {
     host: '0.0.0.0', // Allow external connections
     port: 5173,
     // ... rest of config
   }
   ```

3. **Restart frontend server**

4. **On other devices**, open:
   ```
   http://YOUR_IP:5173
   ```
   (Replace YOUR_IP with your actual IP)

5. **Follow same steps** as Option A

---

## Step 5: Game Flow

### 5.1 Game Phases

Once the game starts, you'll go through these phases:

1. **Clue Phase**
   - Each player (except spy) sees their word
   - Spy sees "You are the spy!"
   - Players take turns giving clues (max 20 characters)
   - Timer: 60 seconds per player

2. **Voting Phase**
   - All players vote for who they think is the spy
   - Timer: 30 seconds
   - Player with most votes is eliminated

3. **Spy Guess Phase** (if spy survives)
   - Spy tries to guess the word
   - Timer: 30 seconds
   - If correct, spy wins!

4. **Game End**
   - Results displayed
   - Shows who was spy
   - Shows winner

### 5.2 During Game

- **Chat**: Use the chat sidebar to communicate
- **Player List**: See all players and their status
- **Timer**: Countdown for each phase
- **Leave Game**: Can leave anytime (returns to lobby)

---

## Troubleshooting

### Issue: Frontend can't connect to backend

**Symptoms**: 
- API calls fail
- Socket connection errors
- "Network Error" in console

**Solutions**:
1. **Check backend is running**: `http://localhost:3000/health`
2. **Check ports**: Backend on 3000, Frontend on 5173
3. **Check CORS**: Backend should allow `http://localhost:5173`
4. **Check proxy**: Vite config should proxy `/api` and `/socket.io` to `http://localhost:3000`

### Issue: Socket connection fails

**Symptoms**:
- Real-time updates don't work
- Chat doesn't work
- Game state doesn't update

**Solutions**:
1. **Check authentication**: Make sure you're logged in (token in localStorage)
2. **Check socket URL**: Should be `http://localhost:3000`
3. **Check browser console**: Look for socket errors
4. **Restart both servers**: Stop and restart backend and frontend

### Issue: Can't start game

**Symptoms**:
- "START GAME" button disabled
- Error: "Need at least 4 players"

**Solutions**:
1. **Need 4+ players**: Minimum 4 players required
2. **All must be ready**: All players must click "READY"
3. **Host only**: Only the room host can start the game

### Issue: Game state not updating

**Symptoms**:
- Game stuck on one phase
- Players don't see updates

**Solutions**:
1. **Check socket connection**: Look for connection in Network tab
2. **Refresh page**: Sometimes helps reset state
3. **Check backend logs**: Look for errors in backend terminal
4. **Rejoin room**: Leave and rejoin the room

### Issue: MongoDB connection error

**Symptoms**:
- Backend won't start
- Database errors in logs

**Solutions**:
1. **Check MongoDB URI**: In `src/config/env.js`
2. **Check internet**: MongoDB Atlas requires internet
3. **Check credentials**: Verify MongoDB connection string
4. **Use local MongoDB**: Install MongoDB locally if preferred

---

## Development Tips

### Check Connection Status

**Backend Console**:
- Look for "Server running on port 3000"
- Look for "Database connected successfully"
- Watch for any error messages

**Frontend Console** (Browser F12):
- Check Network tab for API calls
- Check Console for errors
- Verify socket connection in Network tab (look for "socket.io" entries)

### Debug Socket Events

Add this to browser console to see all socket events:
```javascript
// In browser console
const originalEmit = socketService.emit;
socketService.emit = function(event, data) {
  console.log('📤 Emitting:', event, data);
  return originalEmit.call(this, event, data);
};

const originalOn = socketService.on;
socketService.on = function(event, callback) {
  console.log('📥 Listening:', event);
  return originalOn.call(this, event, callback);
};
```

### Check Authentication

In browser console:
```javascript
// Check if authenticated
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

// Clear auth (if needed)
localStorage.clear();
```

---

## Quick Start Commands

### Terminal 1 (Backend)
```bash
cd SpyGameBackend
npm install          # First time only
npm run dev
```

### Terminal 2 (Frontend)
```bash
cd SpyGameBackend/SpyGameFrontend
npm install          # First time only
npm run dev
```

### Browser
```
http://localhost:5173
```

---

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Can access `http://localhost:5173`
- [ ] Can access `http://localhost:3000/health`
- [ ] Can register/login/guest login
- [ ] Can create a room
- [ ] Can join a room (with room code)
- [ ] Socket connection works (check Network tab)
- [ ] Can toggle ready status
- [ ] Can start game with 4+ players
- [ ] Game phases work correctly
- [ ] Chat works
- [ ] Real-time updates work

---

## Production Deployment

For production, you'll need to:

1. **Build frontend**:
   ```bash
   cd SpyGameFrontend
   npm run build
   ```

2. **Set environment variables**:
   - Backend: Set proper MongoDB URI, JWT secret, etc.
   - Frontend: Set `VITE_API_URL` and `VITE_SOCKET_URL`

3. **Deploy backend** to a server (Heroku, AWS, etc.)
4. **Deploy frontend** to a static host (Vercel, Netlify, etc.)
5. **Update CORS** in backend to allow frontend domain

---

## Need Help?

1. **Check logs**: Both backend and frontend terminals
2. **Check browser console**: F12 → Console tab
3. **Check network**: F12 → Network tab
4. **Verify ports**: 3000 (backend), 5173 (frontend)
5. **Restart servers**: Stop and restart both

---

## Game Rules Reminder

- **Minimum Players**: 4
- **Maximum Players**: 8
- **Clue Length**: Max 20 characters
- **Clue Time**: 60 seconds per player
- **Voting Time**: 30 seconds
- **Spy Guess Time**: 30 seconds
- **Categories**: Food, Animals, Places, Movies, Jobs, Sports, Countries, Objects

---

Happy Gaming! 🎮🕵️

