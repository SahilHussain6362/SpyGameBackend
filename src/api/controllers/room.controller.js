const roomService = require('../../services/room.service');
const logger = require('../../config/logger');
const { getIO } = require('../../sockets/index');
const websocketService = require('../../services/websocket.service');
const SOCKET_EVENTS = require('../../constants/socket-events');

const createRoom = async (req, res, next) => {
  try {
    const hostId = req.user._id;
    const hostUsername = req.user.username;
    const settings = req.body;

    // Get socketId if user has an active socket connection
    const socketId = websocketService.getUserSocket(hostId.toString());

    // Create room with host as first player
    const room = await roomService.createRoom(hostId, settings, hostUsername, socketId || null);

    // Automatically join the host to the socket room if they have an active socket connection
    if (socketId) {
      try {
        const io = getIO();
        const socket = io.sockets.sockets.get(socketId);
        
        if (socket) {
          // Join socket room
          socket.join(room.roomCode);
          websocketService.joinRoom(socketId, room.roomCode, hostId.toString());
          
          // Emit room joined event to the host
          socket.emit(SOCKET_EVENTS.ROOM_JOINED, { room });
          
          // Broadcast room update to all users in the room (if any)
          io.to(room.roomCode).emit(SOCKET_EVENTS.ROOM_UPDATED, { room });
        }
      } catch (socketError) {
        logger.warn('Failed to join socket room after room creation:', socketError);
        // Don't fail the request if socket join fails
      }
    }

    res.status(201).json({
      message: 'Room created successfully',
      data: room,
    });
  } catch (error) {
    logger.error('Create room controller error:', error);
    next(error);
  }
};

const getRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const room = await roomService.getRoomByCode(roomCode);

    res.status(200).json({
      message: 'Room retrieved successfully',
      data: room,
    });
  } catch (error) {
    logger.error('Get room controller error:', error);
    next(error);
  }
};

const joinRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user._id;
    const username = req.user.username;
    const { asSpectator } = req.body;

    // Get socketId if user has an active socket connection
    const socketId = websocketService.getUserSocket(userId.toString());

    const room = await roomService.joinRoom(roomCode, userId, username, socketId || null, asSpectator);

    // Automatically join the user to the socket room if they have an active socket connection
    if (socketId) {
      try {
        const io = getIO();
        const socket = io.sockets.sockets.get(socketId);
        
        if (socket) {
          // Join socket room
          socket.join(roomCode);
          websocketService.joinRoom(socketId, roomCode, userId.toString());
          
          // Emit room joined event to the user
          socket.emit(SOCKET_EVENTS.ROOM_JOINED, { room });
          
          // Notify other users in the room
          socket.to(roomCode).emit(SOCKET_EVENTS.PLAYER_JOINED, {
            userId: userId.toString(),
            username,
            asSpectator,
          });
          
          // Broadcast updated room state to all users in the room
          io.to(roomCode).emit(SOCKET_EVENTS.ROOM_UPDATED, { room });
        }
      } catch (socketError) {
        logger.warn('Failed to join socket room after API join:', socketError);
        // Don't fail the request if socket join fails
      }
    }

    res.status(200).json({
      message: 'Joined room successfully',
      data: room,
    });
  } catch (error) {
    logger.error('Join room controller error:', error);
    next(error);
  }
};

const leaveRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user._id;
    const username = req.user.username;

    const room = await roomService.leaveRoom(roomCode, userId);

    // Automatically leave the socket room if user has an active socket connection
    const socketId = websocketService.getUserSocket(userId.toString());
    if (socketId) {
      try {
        const io = getIO();
        const socket = io.sockets.sockets.get(socketId);
        
        if (socket) {
          // Leave socket room
          socket.leave(roomCode);
          websocketService.leaveRoom(socketId);
          
          // Emit room left event to the user
          socket.emit(SOCKET_EVENTS.ROOM_LEFT, { room });
          
          // Notify other users in the room
          socket.to(roomCode).emit(SOCKET_EVENTS.PLAYER_LEFT, {
            userId: userId.toString(),
            username,
          });
          
          // Broadcast updated room state to all users in the room
          io.to(roomCode).emit(SOCKET_EVENTS.ROOM_UPDATED, { room });
        }
      } catch (socketError) {
        logger.warn('Failed to leave socket room after API leave:', socketError);
        // Don't fail the request if socket leave fails
      }
    }

    res.status(200).json({
      message: 'Left room successfully',
      data: room,
    });
  } catch (error) {
    logger.error('Leave room controller error:', error);
    next(error);
  }
};

const toggleReady = async (req, res, next) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user._id;
    const { isReady } = req.body;

    const room = await roomService.togglePlayerReady(roomCode, userId, isReady);

    // Broadcast room update to all users in the socket room
    try {
      const io = getIO();
      io.to(roomCode).emit(SOCKET_EVENTS.ROOM_UPDATED, { room });
    } catch (socketError) {
      logger.warn('Failed to broadcast room update after toggle ready:', socketError);
      // Don't fail the request if socket broadcast fails
    }

    res.status(200).json({
      message: 'Ready status updated',
      data: room,
    });
  } catch (error) {
    logger.error('Toggle ready controller error:', error);
    next(error);
  }
};

module.exports = {
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  toggleReady,
};

