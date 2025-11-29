# Environment Variables Setup Guide

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

### 1. **PORT** (Optional - has default)
```env
PORT=3000
```
- **What to fill**: Port number for your server
- **Default**: `3000` (already set in code)
- **Example**: `3000`, `8080`, `5000`

---

### 2. **NODE_ENV** (Optional - has default)
```env
NODE_ENV=development
```
- **What to fill**: Environment mode
- **Options**: `development`, `production`, `test`
- **Default**: `development`
- **Note**: Affects logging and error details

---

### 3. **MONGODB_URI** (Optional - has default for local)
```env
MONGODB_URI=mongodb://localhost:27017/spygame
```
- **What to fill**: MongoDB connection string
- **Local MongoDB**: `mongodb://localhost:27017/spygame`
- **MongoDB Atlas (Cloud)**: `mongodb+srv://username:password@cluster.mongodb.net/spygame?retryWrites=true&w=majority`
- **Docker MongoDB**: `mongodb://mongo:27017/spygame` (if using docker-compose)
- **How to get**:
  - **Local**: Install MongoDB locally, default is `mongodb://localhost:27017/spygame`
  - **Atlas**: 
    1. Go to https://www.mongodb.com/cloud/atlas
    2. Create free cluster
    3. Create database user
    4. Get connection string from "Connect" button
    5. Replace `<password>` with your password

---

### 4. **JWT_SECRET** (⚠️ REQUIRED - change default!)
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```
- **What to fill**: Secret key for JWT token signing
- **⚠️ IMPORTANT**: Generate a strong random string
- **How to generate**:
  ```bash
  # Using Node.js
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  
  # Or use online generator: https://randomkeygen.com/
  ```
- **Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
- **Security**: Never commit this to git! Keep it secret.

---

### 5. **JWT_EXPIRES_IN** (Optional - has default)
```env
JWT_EXPIRES_IN=7d
```
- **What to fill**: JWT token expiration time
- **Default**: `7d` (7 days)
- **Examples**: 
  - `1h` (1 hour)
  - `24h` (24 hours)
  - `7d` (7 days)
  - `30d` (30 days)

---

### 6. **GOOGLE_CLIENT_ID** (Required for Google OAuth)
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```
- **What to fill**: Google OAuth Client ID
- **How to get**:
  1. Go to https://console.cloud.google.com/
  2. Create a new project (or select existing)
  3. Enable "Google+ API" or "Google Identity API"
  4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
  5. Application type: "Web application"
  6. Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
  7. Copy the "Client ID"
- **Example**: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
- **Note**: If not using Google login, you can leave this empty (but guest/email login will still work)

---

### 7. **GOOGLE_CLIENT_SECRET** (Required for Google OAuth)
```env
GOOGLE_CLIENT_SECRET=your-google-client-secret
```
- **What to fill**: Google OAuth Client Secret
- **How to get**: Same as above, copy the "Client Secret" from Google Console
- **Example**: `GOCSPX-abcdefghijklmnopqrstuvwxyz`
- **⚠️ Security**: Never commit this to git!

---

### 8. **GOOGLE_CALLBACK_URL** (Optional - has default)
```env
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```
- **What to fill**: OAuth callback URL
- **Default**: `http://localhost:3000/api/auth/google/callback`
- **Production**: `https://yourdomain.com/api/auth/google/callback`
- **Must match**: The "Authorized redirect URIs" in Google Console

---

### 9. **CORS_ORIGIN** (Optional - has default)
```env
CORS_ORIGIN=http://localhost:3000
```
- **What to fill**: Frontend URL allowed to make requests
- **Default**: `http://localhost:3000`
- **Development**: `http://localhost:3000` or `http://localhost:5173` (Vite)
- **Production**: `https://yourdomain.com`
- **Multiple origins**: Not directly supported, you'd need to modify `app.js`

---

### 10. **RATE_LIMIT_WINDOW_MS** (Optional - has default)
```env
RATE_LIMIT_WINDOW_MS=900000
```
- **What to fill**: Rate limit time window in milliseconds
- **Default**: `900000` (15 minutes)
- **Examples**:
  - `60000` = 1 minute
  - `300000` = 5 minutes
  - `900000` = 15 minutes

---

### 11. **RATE_LIMIT_MAX_REQUESTS** (Optional - has default)
```env
RATE_LIMIT_MAX_REQUESTS=100
```
- **What to fill**: Maximum requests per time window
- **Default**: `100` requests per 15 minutes
- **Examples**: `50`, `100`, `200`

---

## Complete .env File Example

### For Local Development:
```env
# Server
PORT=3000
NODE_ENV=development

# Database (Local MongoDB)
MONGODB_URI=mongodb://localhost:27017/spygame

# JWT
JWT_SECRET=generate-a-random-64-character-string-here
JWT_EXPIRES_IN=7d

# Google OAuth (Optional - leave empty if not using)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### For Production:
```env
# Server
PORT=3000
NODE_ENV=production

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spygame?retryWrites=true&w=majority

# JWT (MUST be strong and secret!)
JWT_SECRET=your-production-secret-key-minimum-64-characters-long
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Quick Start (Minimum Required)

For basic functionality without Google OAuth:

```env
MONGODB_URI=mongodb://localhost:27017/spygame
JWT_SECRET=your-random-secret-key-here
```

Everything else has defaults!

---

## How to Create .env File

1. Copy the template:
   ```bash
   cp .env.example .env
   ```
   (If .env.example doesn't exist, create `.env` manually)

2. Edit `.env` with your values

3. **Never commit `.env` to git!** (Already in `.gitignore`)

---

## Verification

After setting up, test your configuration:
```bash
npm run dev
```

Check the console for:
- ✅ MongoDB connection success
- ✅ Server running on specified port
- ⚠️ Any missing required variables

