# Quick Start Guide - Play Spy Game

Fastest way to get the game running and playing!

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Backend

```bash
# Terminal 1
cd SpyGameBackend
npm install    # First time only
npm run dev
```

Wait for: `Server running on port 3000`

### Step 2: Start Frontend

```bash
# Terminal 2 (new terminal)
cd SpyGameBackend/SpyGameFrontend
npm install    # First time only
npm run dev
```

Wait for: `Local: http://localhost:5173/`

### Step 3: Open Browser

Go to: **http://localhost:5173**

### Step 4: Play!

1. Click **"GET STARTED"**
2. Enter username (e.g., "Player1")
3. Click **"CONTINUE AS GUEST"**
4. You're in the lobby!

---

## 🎮 Playing the Full Game

### You Need 4 Players Minimum

**Option 1: Multiple Browser Windows**
1. Open 4 browser windows (or use incognito)
2. In each: Go to `http://localhost:5173/guest`
3. Enter different usernames
4. One creates room, others join with room code
5. All click "READY"
6. Host clicks "START GAME"

**Option 2: Multiple Devices**
1. Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. On other devices: `http://YOUR_IP:5173`
3. Follow same steps as Option 1

---

## ✅ Verify Everything Works

### Backend Check
- Open: `http://localhost:3000/health`
- Should see JSON with `"status": "ok"`

### Frontend Check
- Open: `http://localhost:5173`
- Should see landing page with background

### Connection Check
- Open browser DevTools (F12)
- Go to Network tab
- Try logging in
- Should see API calls to `localhost:3000`

---

## 🐛 Common Issues

**Backend won't start?**
- Check MongoDB connection
- Check port 3000 is free
- Look at error messages in terminal

**Frontend won't start?**
- Check port 5173 is free
- Run `npm install` again
- Check Node.js version (need 18+)

**Can't connect?**
- Make sure BOTH servers are running
- Check browser console for errors
- Verify `http://localhost:3000/health` works

**Can't start game?**
- Need 4+ players
- All must be ready
- Only host can start

---

## 📚 More Help

- **Full Guide**: See `FRONTEND_BACKEND_CONNECTION_GUIDE.md`
- **Testing Guide**: See `SpyGameFrontend/TESTING_GUIDE.md`
- **API Docs**: See `API_DOCUMENTATION.md`

---

## 🎯 Game Flow

1. **Lobby** → Create/Join room
2. **Ready Up** → All players click ready
3. **Start Game** → Host starts
4. **Clue Phase** → Give clues (spy doesn't know word)
5. **Voting Phase** → Vote for spy
6. **Spy Guess** → Spy tries to guess word
7. **Game End** → See results!

---

Happy Gaming! 🕵️🎮

