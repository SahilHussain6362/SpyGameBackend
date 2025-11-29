const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');
const logger = require('../config/logger');
const roomSocket = require('./room.socket');
const gameSocket = require('./game.socket');
const chatSocket = require('./chat.socket');
const voiceSocket = require('./voice.socket');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        // Allow guest connections
        socket.user = null;
        return next();
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');

      if (user) {
        socket.user = user;
        socket.userId = user._id.toString();
      } else {
        socket.user = null;
      }

      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      socket.user = null;
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

