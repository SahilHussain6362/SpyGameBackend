# Troubleshooting Guide

Common issues and solutions for the Spy Game.

## Socket Authentication Errors

### Error: "Invalid or expired token"

**What it means:**
- The JWT token stored in your browser is invalid or expired
- This is usually harmless - the socket will connect as a guest

**Solutions:**

1. **Clear localStorage and re-login:**
   ```javascript
   // In browser console (F12)
   localStorage.clear();
   // Then refresh page and login again
   ```

2. **Check token expiration:**
   - Tokens expire after 7 days by default
   - If you haven't logged in recently, your token may be expired
   - Solution: Log out and log back in

3. **Verify token format:**
   ```javascript
   // In browser console
   const token = localStorage.getItem('token');
   console.log('Token:', token);
   // Should be a long string starting with something like "eyJ..."
   ```

4. **Re-authenticate:**
   - Go to login page
   - Log in again (or use guest mode)
   - This will generate a new valid token

### Error: "Socket connection error"

**Solutions:**

1. **Check backend is running:**
   - Verify `http://localhost:3000/health` works
   - Backend terminal should show "Server running on port 3000"

2. **Check CORS configuration:**
   - Backend should allow `http://localhost:5173`
   - Check `src/config/env.js` - `corsOrigin` should be `http://localhost:5173`

3. **Check ports:**
   - Backend: 3000
   - Frontend: 5173
   - Make sure nothing else is using these ports

4. **Restart both servers:**
   ```bash
   # Stop both (Ctrl+C)
   # Then restart backend
   cd SpyGameBackend
   npm run dev
   
   # Then restart frontend (new terminal)
   cd SpyGameBackend/SpyGameFrontend
   npm run dev
   ```

---

## Authentication Issues

### Can't login/register

**Check:**
1. Backend is running
2. MongoDB connection is working
3. Check browser console for errors
4. Check Network tab for failed API calls

**Solution:**
- Verify backend health: `http://localhost:3000/health`
- Check backend terminal for errors
- Try guest login instead

### Token keeps expiring

**Default expiration:** 7 days

**Solution:**
- This is normal security behavior
- Just log in again when token expires
- Or increase `JWT_EXPIRES_IN` in backend `.env` file

---

## Game Issues

### Can't start game

**Requirements:**
- Minimum 4 players
- All players must be ready
- Only host can start

**Check:**
1. Count players in room (need 4+)
2. All players clicked "READY"
3. You are the host (crown icon next to name)

### Game state not updating

**Solutions:**
1. **Check socket connection:**
   - Open browser DevTools (F12)
   - Network tab → Look for "socket.io" entries
   - Should show "101 Switching Protocols" (WebSocket)

2. **Refresh page:**
   - Sometimes helps reset state
   - You'll rejoin the room automatically

3. **Rejoin room:**
   - Leave room
   - Join again with room code

4. **Check backend logs:**
   - Look for errors in backend terminal
   - Check for socket connection issues

### Players not seeing updates

**Check:**
1. All players are connected (socket connected)
2. Backend is processing events
3. No network issues

**Solution:**
- Have all players refresh
- Check backend terminal for errors
- Verify socket connections in Network tab

---

## Database Issues

### MongoDB connection error

**Symptoms:**
- Backend won't start
- "Database connection failed" errors

**Solutions:**

1. **Check MongoDB URI:**
   - In `src/config/env.js`
   - Verify connection string is correct

2. **Check internet connection:**
   - MongoDB Atlas requires internet
   - Verify you can access MongoDB Atlas dashboard

3. **Use local MongoDB:**
   ```bash
   # Install MongoDB locally
   # Then update MONGODB_URI to:
   mongodb://localhost:27017/spygame
   ```

---

## Frontend Issues

### Pages not loading

**Check:**
1. Frontend server is running
2. No errors in browser console
3. Correct URL: `http://localhost:5173`

**Solution:**
- Restart frontend: `npm run dev`
- Clear browser cache
- Check for port conflicts

### Background images not showing

**Check:**
1. Images exist in `assets/images/` folder
2. File names match exactly (case-sensitive)
3. No 404 errors in Network tab

**Solution:**
- Verify image files exist
- Check file names match code
- Restart dev server

### Styling looks broken

**Check:**
1. Tailwind CSS is installed
2. `npm install` completed successfully

**Solution:**
```bash
cd SpyGameFrontend
npm install
npm run dev
```

---

## Network Issues

### CORS errors

**Error:** "Access to fetch blocked by CORS policy"

**Solution:**
1. Check backend CORS config
2. Verify `corsOrigin` in `src/config/env.js` is `http://localhost:5173`
3. Restart backend server

### API calls failing

**Check:**
1. Backend is running
2. Correct API URL
3. Network tab shows failed requests

**Solution:**
- Verify backend: `http://localhost:3000/health`
- Check API URL in `apiService.js`
- Verify proxy config in `vite.config.js`

---

## Quick Fixes

### Clear everything and start fresh

```javascript
// In browser console (F12)
localStorage.clear();
sessionStorage.clear();
// Then refresh page
```

### Restart everything

```bash
# Terminal 1 - Backend
cd SpyGameBackend
# Ctrl+C to stop
npm run dev

# Terminal 2 - Frontend  
cd SpyGameBackend/SpyGameFrontend
# Ctrl+C to stop
npm run dev
```

### Check if everything is working

1. **Backend health:** `http://localhost:3000/health`
2. **Frontend:** `http://localhost:5173`
3. **Browser console:** No errors
4. **Network tab:** API calls succeed

---

## Debug Tips

### Enable verbose logging

**Backend:**
- Check `src/config/logger.js`
- Set log level to 'debug'

**Frontend:**
- Open browser console
- Check for warnings/errors
- Use Network tab to see API calls

### Test socket connection

```javascript
// In browser console
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
console.log('Socket connected:', socketService.connected);
```

### Check authentication state

```javascript
// In browser console
console.log('User:', localStorage.getItem('user'));
console.log('Token:', localStorage.getItem('token') ? 'Exists' : 'Missing');
```

---

## Still Having Issues?

1. **Check logs:**
   - Backend terminal
   - Browser console (F12)
   - Network tab

2. **Verify setup:**
   - Both servers running
   - Correct ports
   - Dependencies installed

3. **Try fresh start:**
   - Clear localStorage
   - Restart both servers
   - Clear browser cache

4. **Check documentation:**
   - `FRONTEND_BACKEND_CONNECTION_GUIDE.md`
   - `QUICK_START.md`
   - `API_DOCUMENTATION.md`

---

## Common Error Messages

| Error | Solution |
|-------|----------|
| "Invalid or expired token" | Clear localStorage, re-login |
| "Socket connection error" | Check backend is running |
| "Need at least 4 players" | Get more players in room |
| "Only host can start" | Host must click start button |
| "Database connection failed" | Check MongoDB URI/connection |
| "CORS error" | Check CORS config in backend |
| "Port already in use" | Kill process using port or change port |

---

Happy Debugging! 🐛🔧

