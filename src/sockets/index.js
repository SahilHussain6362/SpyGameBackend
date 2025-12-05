const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');
const logger = require('../config/logger');
const { corsOrigin } = require('../config/env');
const roomSocket = require('./room.socket');
const gameSocket = require('./game.socket');
const chatSocket = require('./chat.socket');
const voiceSocket = require('./voice.socket');

let io;

const initializeSocket = (server) => {
  const { corsOrigin } = require('../config/env');
  io = new Server(server, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        // Allow guest connections without token
        socket.user = null;
        socket.userId = null;
        return next();
      }

      try {
        const decoded = verifyToken(token);
        
        // Verify token has required fields
        if (!decoded || !decoded.userId) {
          logger.debug('Socket token missing userId, allowing as guest');
          socket.user = null;
          socket.userId = null;
          return next();
        }

        const user = await User.findById(decoded.userId).select('-password');

        if (user) {
          socket.user = user;
          socket.userId = user._id.toString();
          logger.debug(`Socket authenticated: ${user.username} (${socket.id})`);
        } else {
          logger.debug(`Socket token valid but user not found: ${decoded.userId}`);
          socket.user = null;
          socket.userId = null;
        }
      } catch (tokenError) {
        // Token is invalid/expired - allow as guest but don't log as error
        // This is expected behavior for expired tokens or invalid tokens
        if (tokenError.message.includes('expired')) {
          logger.debug(`Socket token expired, allowing as guest: ${socket.id}`);
        } else {
          logger.debug(`Socket token invalid, allowing as guest: ${socket.id}`);
        }
        socket.user = null;
        socket.userId = null;
      }

      next();
    } catch (error) {
      // Only log unexpected errors
      logger.error('Unexpected socket authentication error:', error);
      socket.user = null;
      socket.userId = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Initialize socket handlers
    roomSocket(io, socket);
    gameSocket(io, socket);
    chatSocket(io, socket);
    voiceSocket(io, socket);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};

