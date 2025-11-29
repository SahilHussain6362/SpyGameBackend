const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { corsOrigin, rateLimitWindowMs, rateLimitMaxRequests } = require('./config/env');
const logger = require('./config/logger');

// Import routes
const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/user.routes');
const friendsRoutes = require('./api/routes/friends.routes');
const roomRoutes = require('./api/routes/room.routes');
const gameRoutes = require('./api/routes/game.routes');

// Import middlewares
const errorMiddleware = require('./api/middlewares/error.middleware');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStates[dbStatus] || 'unknown',
      readyState: dbStatus,
      connected: dbStatus === 1,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
      writeTest: null,
    },
  };

  // Test database write operation to users collection
  if (dbStatus === 1) {
    logger.debug('Testing database write operation to users collection');
    try {
      const User = require('./models/user.model');
      
      // Find or create a test health check user
      const testUserId = 'health-check-test-user';
      const testUser = await User.findOneAndUpdate(
        { userId: testUserId },
        {
          $set: {
            userId: testUserId,
            username: 'sahil_hussain',
            isGuest: true,
            isOnline: false,
            lastSeen: new Date(),
            'stats.gamesPlayed': 0,
            'stats.gamesWon': 0,
            'stats.spyWins': 0,
            'stats.villagerWins': 0,
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: false, // Skip validation for health check
        }
      );

      // Read the document back from database to verify
      const readUser = await User.findOne({ userId: testUserId })
        .select('-password') // Exclude password field
        .lean(); // Return plain JavaScript object

        logger.debug('Read user from database', readUser);

      health.database.writeTest = {
        success: true,
        message: 'Database write operation to users collection successful',
        collection: 'users',
        documentId: testUser._id.toString(),
        userId: testUser.userId,
        lastUpdated: testUser.updatedAt,
      };

      // Include the full database entry in response
      health.database.entry = readUser;

      logger.debug('Health check: Database write test successful', {
        userId: testUser.userId,
        documentId: testUser._id.toString(),
      });
    } catch (error) {
      health.database.writeTest = {
        success: false,
        message: 'Database write operation to users collection failed',
        error: error.message,
      };
      health.status = 'degraded';
      logger.error('Health check: Database write test failed', {
        error: error.message,
        stack: error.stack,
      });
    }
  } else {
    health.database.writeTest = {
      success: false,
      message: 'Cannot test write - database not connected',
    };
  }

  const statusCode = dbStatus === 1 && health.database.writeTest?.success !== false ? 200 : 503;
  res.status(statusCode).json(health);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/games', gameRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

module.exports = app;

