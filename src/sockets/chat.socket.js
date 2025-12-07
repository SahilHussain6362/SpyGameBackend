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

      if (!roomCode) {
        return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room code is required' });
      }

      // Ensure socket is in the room
      const rooms = Array.from(socket.rooms);
      if (!rooms.includes(roomCode)) {
        logger.warn(`Socket ${socket.id} not in room ${roomCode}, joining now`);
        socket.join(roomCode);
      }

      // Save message to database
      // Use socket.user._id (ObjectId) instead of socket.userId (string) for proper MongoDB storage
      const savedMessage = await Message.create({
        roomId: roomCode,
        sender: {
          userId: socket.user._id, // Use ObjectId, not string
          username: socket.user.username,
        },
        message: message.trim(),
        messageType,
        gameId: gameId || null,
        roundNumber: roundNumber || null,
      });

      // Convert to plain object and ensure sender.userId is a string for frontend compatibility
      const messageData = savedMessage.toObject();
      messageData.sender = {
        userId: messageData.sender.userId.toString(),
        username: messageData.sender.username,
      };

      // Broadcast message to all sockets in the room EXCEPT the sender
      socket.to(roomCode).emit(SOCKET_EVENTS.MESSAGE_RECEIVED, {
        message: messageData,
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

