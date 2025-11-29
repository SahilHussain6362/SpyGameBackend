const Message = require('../models/message.model');
const websocketService = require('../services/websocket.service');
const SOCKET_EVENTS = require('../constants/socket-events');
const logger = require('../config/logger');

const chatSocket = (io, socket) => {
  // Send message
  socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (data) => {
    try {
      const { roomCode, message, messageType = 'chat', gameId, roundNumber } = data;

      if (!message || message.trim().length === 0) {
        return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Message cannot be empty' });
      }

      if (!socket.user) {
        return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Authentication required' });
      }

      // Save message to database
      const savedMessage = await Message.create({
        roomId: roomCode,
        sender: {
          userId: socket.userId,
          username: socket.user.username,
        },
        message: message.trim(),
        messageType,
        gameId: gameId || null,
        roundNumber: roundNumber || null,
      });

      // Broadcast message
      io.to(roomCode).emit(SOCKET_EVENTS.MESSAGE_RECEIVED, {
        message: savedMessage,
      });
    } catch (error) {
      logger.error('Send message socket error:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
    }
  });

  // Typing indicator
  socket.on(SOCKET_EVENTS.TYPING_START, (data) => {
    const { roomCode } = data;
    socket.to(roomCode).emit(SOCKET_EVENTS.TYPING_START, {
      userId: socket.userId,
      username: socket.user?.username,
    });
  });

  socket.on(SOCKET_EVENTS.TYPING_STOP, (data) => {
    const { roomCode } = data;
    socket.to(roomCode).emit(SOCKET_EVENTS.TYPING_STOP, {
      userId: socket.userId,
      username: socket.user?.username,
    });
  });
};

module.exports = chatSocket;

