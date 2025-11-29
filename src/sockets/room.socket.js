const roomService = require('../services/room.service');
const websocketService = require('../services/websocket.service');
const SOCKET_EVENTS = require('../constants/socket-events');
const logger = require('../config/logger');

const roomSocket = (io, socket) => {
  // Join room
  socket.on(SOCKET_EVENTS.JOIN_ROOM, async (data) => {
    try {
      const { roomCode, asSpectator } = data;

      if (!roomCode) {
        return socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: 'Room code is required' });
      }

      if (!socket.user) {
        return socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: 'Authentication required' });
      }

      const userId = socket.userId;
      const username = socket.user.username;

      // Join room via service
      const room = await roomService.joinRoom(roomCode, userId, username, socket.id, asSpectator);

      // Join socket room
      socket.join(roomCode);
      websocketService.joinRoom(socket.id, roomCode, userId);

      socket.emit(SOCKET_EVENTS.ROOM_JOINED, { room });
      socket.to(roomCode).emit(SOCKET_EVENTS.PLAYER_JOINED, {
        userId,
        username,
        asSpectator,
      });

      // Broadcast updated room state
      io.to(roomCode).emit(SOCKET_EVENTS.ROOM_UPDATED, { room });
    } catch (error) {
      logger.error('Join room socket error:', error);
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: error.message });
    }
  });

  // Leave room
  socket.on(SOCKET_EVENTS.LEAVE_ROOM, async (data) => {
    try {
      const { roomCode } = data;

      if (!roomCode) {
        return socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: 'Room code is required' });
      }

      if (!socket.user) {
        return socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: 'Authentication required' });
      }

      const userId = socket.userId;
      const username = socket.user.username;

      // Leave room via service
      const room = await roomService.leaveRoom(roomCode, userId);

      // Leave socket room
      socket.leave(roomCode);
      websocketService.leaveRoom(socket.id);

      socket.emit(SOCKET_EVENTS.ROOM_LEFT, { room });
      socket.to(roomCode).emit(SOCKET_EVENTS.PLAYER_LEFT, {
        userId,
        username,
      });

      // Broadcast updated room state
      io.to(roomCode).emit(SOCKET_EVENTS.ROOM_UPDATED, { room });
    } catch (error) {
      logger.error('Leave room socket error:', error);
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: error.message });
    }
  });

  // Player ready
  socket.on(SOCKET_EVENTS.PLAYER_READY, async (data) => {
    try {
      const { roomCode, isReady } = data;

      if (!socket.user) {
        return socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: 'Authentication required' });
      }

      const userId = socket.userId;
      const room = await roomService.togglePlayerReady(roomCode, userId, isReady !== false);

      io.to(roomCode).emit(SOCKET_EVENTS.ROOM_UPDATED, { room });
    } catch (error) {
      logger.error('Player ready socket error:', error);
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: error.message });
    }
  });
};

module.exports = roomSocket;

