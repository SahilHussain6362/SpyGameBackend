const roomService = require('../services/room.service');
const userService = require('../services/user.service');
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

      // Check if user is already in room (reconnection scenario)
      const existingRoom = await roomService.getRoomByCode(roomCode).catch(() => null);
      if (existingRoom) {
        const isPlayer = existingRoom.players.some((p) => p.userId.toString() === userId.toString());
        const isSpectator = existingRoom.spectators.some((s) => s.userId.toString() === userId.toString());
        
        if (isPlayer || isSpectator) {
          // User is already in room, update socketId and send current room state
          if (isPlayer) {
            const player = existingRoom.players.find((p) => p.userId.toString() === userId.toString());
            if (player) {
              player.socketId = socket.id;
            }
          } else {
            const spectator = existingRoom.spectators.find((s) => s.userId.toString() === userId.toString());
            if (spectator) {
              spectator.socketId = socket.id;
            }
          }
          await existingRoom.save();
          
          // Join socket room
          socket.join(roomCode);
          websocketService.joinRoom(socket.id, roomCode, userId);
          
          // Get fully populated room
          const room = await roomService.getRoomByCode(roomCode);
          
          // Send room state to reconnecting user
          socket.emit(SOCKET_EVENTS.ROOM_JOINED, { room });
          
          // Broadcast updated room state to all users in room
          io.to(roomCode).emit(SOCKET_EVENTS.ROOM_UPDATED, { room });
          return;
        }
      }

      // Join room via service (new join)
      const room = await roomService.joinRoom(roomCode, userId, username, socket.id, asSpectator);

      // Join socket room
      socket.join(roomCode);
      websocketService.joinRoom(socket.id, roomCode, userId);

      // Get fully populated room with all user data
      const populatedRoom = await roomService.getRoomByCode(roomCode);

      // Send room state to joining user
      socket.emit(SOCKET_EVENTS.ROOM_JOINED, { room: populatedRoom });
      
      // Notify others about new player
      socket.to(roomCode).emit(SOCKET_EVENTS.PLAYER_JOINED, {
        userId,
        username,
        asSpectator,
      });

      // Broadcast updated room state to ALL users (including the one who just joined)
      io.to(roomCode).emit(SOCKET_EVENTS.ROOM_UPDATED, { room: populatedRoom });
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

      // Get fully populated room after leave
      let populatedRoom = null;
      try {
        populatedRoom = await roomService.getRoomByCode(roomCode);
      } catch (err) {
        // Room might not exist anymore
      }

      socket.emit(SOCKET_EVENTS.ROOM_LEFT, { room: populatedRoom || room });
      
      if (populatedRoom) {
        // Notify others about player leaving
        socket.to(roomCode).emit(SOCKET_EVENTS.PLAYER_LEFT, {
          userId,
          username,
        });

        // Broadcast updated room state to ALL remaining users
        io.to(roomCode).emit(SOCKET_EVENTS.ROOM_UPDATED, { room: populatedRoom });
      }
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

      // Get fully populated room
      const populatedRoom = await roomService.getRoomByCode(roomCode);
      
      // Broadcast to ALL users in room
      io.to(roomCode).emit(SOCKET_EVENTS.ROOM_UPDATED, { room: populatedRoom });
    } catch (error) {
      logger.error('Player ready socket error:', error);
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: error.message });
    }
  });

  // Update player avatar
  socket.on('update_avatar', async (data) => {
    try {
      const { roomCode, avatar } = data;

      if (!socket.user) {
        return socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: 'Authentication required' });
      }

      if (!avatar) {
        return socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: 'Avatar is required' });
      }

      const userId = socket.userId;

      // Update user avatar in database
      await userService.updateUserProfile(userId, { avatar });

      // Update avatar in room
      const room = await roomService.getRoomByCode(roomCode);
      const player = room.players.find((p) => p.userId.toString() === userId.toString());
      if (player) {
        // Avatar is stored in user model, so we just need to refresh the room
        const populatedRoom = await roomService.getRoomByCode(roomCode);
        
        // Broadcast updated room state to ALL users
        io.to(roomCode).emit(SOCKET_EVENTS.ROOM_UPDATED, { room: populatedRoom });
      }
    } catch (error) {
      logger.error('Update avatar socket error:', error);
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: error.message });
    }
  });

  // Update player name
  socket.on('update_name', async (data) => {
    try {
      const { roomCode, username } = data;

      if (!socket.user) {
        return socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: 'Authentication required' });
      }

      if (!username || username.trim().length === 0) {
        return socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: 'Username is required' });
      }

      const userId = socket.userId;

      // Update user name in database
      await userService.updateUserProfile(userId, { username: username.trim() });

      // Update name in room
      const room = await roomService.getRoomByCode(roomCode);
      const player = room.players.find((p) => p.userId.toString() === userId.toString());
      if (player) {
        player.username = username.trim();
        await room.save();
        
        // Get fully populated room
        const populatedRoom = await roomService.getRoomByCode(roomCode);
        
        // Broadcast updated room state to ALL users
        io.to(roomCode).emit(SOCKET_EVENTS.ROOM_UPDATED, { room: populatedRoom });
      }
    } catch (error) {
      logger.error('Update name socket error:', error);
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: error.message });
    }
  });

  // Handle reconnection - check if user was in a room
  socket.on('check_room', async () => {
    try {
      if (!socket.user) {
        return socket.emit('room_status', { inRoom: false });
      }

      const userId = socket.userId;
      
      // Find room where user is a player or spectator
      const Room = require('../models/room.model');
      const room = await Room.findOne({
        $or: [
          { 'players.userId': userId },
          { 'spectators.userId': userId }
        ],
        status: { $in: ['waiting', 'in_game'] }
      })
        .populate('host', 'userId username avatar')
        .populate('players.userId', 'userId username avatar')
        .populate('spectators.userId', 'userId username avatar');

      if (room) {
        // Update socketId in room
        const player = room.players.find((p) => p.userId.toString() === userId.toString());
        const spectator = room.spectators.find((s) => s.userId.toString() === userId.toString());
        
        if (player) {
          player.socketId = socket.id;
        } else if (spectator) {
          spectator.socketId = socket.id;
        }
        
        await room.save();
        
        // Join socket room
        socket.join(room.roomCode);
        websocketService.joinRoom(socket.id, room.roomCode, userId);
        
        // Get fully populated room
        const populatedRoom = await roomService.getRoomByCode(room.roomCode);
        
        // Send room state to reconnecting user
        socket.emit(SOCKET_EVENTS.ROOM_JOINED, { room: populatedRoom });
        
        // Broadcast updated room state to all users
        io.to(room.roomCode).emit(SOCKET_EVENTS.ROOM_UPDATED, { room: populatedRoom });
        
        socket.emit('room_status', { inRoom: true, room: populatedRoom });
      } else {
        socket.emit('room_status', { inRoom: false });
      }
    } catch (error) {
      logger.error('Check room socket error:', error);
      socket.emit('room_status', { inRoom: false });
    }
  });
};

module.exports = roomSocket;

