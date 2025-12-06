require("dotenv").config();

// Provide sensible defaults so the app fails less noisily in local dev.
const defaultMongo = "mongodb://localhost:27017/spygame";
const mongodbUri = process.env.MONGODB_URI || defaultMongo;

if (!process.env.MONGODB_URI) {
  // Use console here to avoid importing logger (which depends on this file).
  console.warn("Warning: MONGODB_URI not set. Falling back to", defaultMongo);
}

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:3000/api/auth/google/callback",
  corsOrigin: (() => {
    if (process.env.CORS_ORIGIN) {
      return process.env.CORS_ORIGIN.includes(",")
        ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
        : [process.env.CORS_ORIGIN.trim()];
    }
    // Fallback to localhost if CORS_ORIGIN is not set
    return [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://spygamefrontend.onrender.com",
    ];
  })(),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
};
