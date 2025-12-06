const Room = require('../models/room.model');
const { generateRoomId, generateRoomCode } = require('../utils/id-generator');
const logger = require('../config/logger');
const GAME_CONSTANTS = require('../constants/game.constants');

const createRoom = async (hostId, settings = {}) => {
  try {
    let roomCode;
    let isUnique = false;

    // Generate unique room code
    while (!isUnique) {
      roomCode = generateRoomCode();
      const existingRoom = await Room.findOne({ roomCode });
      if (!existingRoom) {
        isUnique = true;
      }
    }

    const room = await Room.create({
      roomId: generateRoomId(),
      roomCode,
      host: hostId,
      players: [],
      spectators: [],
      settings: {
        maxPlayers: settings.maxPlayers || GAME_CONSTANTS.MAX_PLAYERS,
        maxSpectators: settings.maxSpectators || GAME_CONSTANTS.MAX_SPECTATORS,
        isPrivate: settings.isPrivate || false,
      },
      inviteLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join/${roomCode}`,
      status: 'waiting',
    });

    return room.populate('host', 'userId username avatar');
  } catch (error) {
    logger.error('Create room error:', error);
    throw error;
  }
};

const getRoomByCode = async (roomCode) => {
  try {
    const room = await Room.findOne({ roomCode })
      .populate('host', 'userId username avatar')
      .populate('players.userId', 'userId username avatar')
      .populate('spectators.userId', 'userId username avatar');

    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  } catch (error) {
    logger.error('Get room by code error:', error);
    throw error;
  }
};

const getRoomById = async (roomId) => {
  try {
    const room = await Room.findOne({ roomId })
      .populate('host', 'userId username avatar')
      .populate('players.userId', 'userId username avatar')
      .populate('spectators.userId', 'userId username avatar');

    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  } catch (error) {
    logger.error('Get room by id error:', error);
    throw error;
  }
};

const joinRoom = async (roomCode, userId, username, socketId, asSpectator = false) => {
  try {
    const room = await Room.findOne({ roomCode });

    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== 'waiting') {
      throw new Error('Room is not accepting new players');
    }

    // Check if already in room
    const isPlayer = room.players.some((p) => p.userId.toString() === userId.toString());
    const isSpectator = room.spectators.some((s) => s.userId.toString() === userId.toString());

    if (isPlayer || isSpectator) {
      throw new Error('Already in room');
    }

    if (asSpectator) {
      if (room.spectators.length >= room.settings.maxSpectators) {
        throw new Error('Room is full for spectators');
      }
      room.spectators.push({
        userId,
        socketId,
        username,
        joinedAt: new Date(),
      });
    } else {
      if (room.players.length >= room.settings.maxPlayers) {
        throw new Error('Room is full');
      }
      room.players.push({
        userId,
        socketId,
        username,
        isReady: false,
        joinedAt: new Date(),
      });
    }

    await room.save();
    
    // Fully populate the room with user data
    const populatedRoom = await Room.findOne({ roomCode })
      .populate('host', 'userId username avatar')
      .populate('players.userId', 'userId username avatar')
      .populate('spectators.userId', 'userId username avatar');
    
    return populatedRoom;
  } catch (error) {
    logger.error('Join room error:', error);
    throw error;
  }
};

const leaveRoom = async (roomCode, userId) => {
  try {
    const room = await Room.findOne({ roomCode });

    if (!room) {
      throw new Error('Room not found');
    }

    // Remove from players
    room.players = room.players.filter((p) => p.userId.toString() !== userId.toString());

    // Remove from spectators
    room.spectators = room.spectators.filter((s) => s.userId.toString() !== userId.toString());

    // If host left and there are players, assign new host
    if (room.host.toString() === userId.toString() && room.players.length > 0) {
      room.host = room.players[0].userId;
    }

    // If room is empty, mark for deletion or keep for a while
    if (room.players.length === 0 && room.spectators.length === 0) {
      room.status = 'finished';
    }

    await room.save();
    return room;
  } catch (error) {
    logger.error('Leave room error:', error);
    throw error;
  }
};

const togglePlayerReady = async (roomCode, userId, isReady) => {
  try {
    const room = await Room.findOne({ roomCode });

    if (!room) {
      throw new Error('Room not found');
    }

    const player = room.players.find((p) => p.userId.toString() === userId.toString());
    if (!player) {
      throw new Error('Player not in room');
    }

    player.isReady = isReady;
    await room.save();

    // Fully populate the room with user data
    const populatedRoom = await Room.findOne({ roomCode })
      .populate('host', 'userId username avatar')
      .populate('players.userId', 'userId username avatar')
      .populate('spectators.userId', 'userId username avatar');
    
    return populatedRoom;
  } catch (error) {
    logger.error('Toggle player ready error:', error);
    throw error;
  }
};

const updateRoomStatus = async (roomId, status) => {
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error('Room not found');
    }

    room.status = status;
    await room.save();

    return room;
  } catch (error) {
    logger.error('Update room status error:', error);
    throw error;
  }
};

module.exports = {
  createRoom,
  getRoomByCode,
  getRoomById,
  joinRoom,
  leaveRoom,
  togglePlayerReady,
  updateRoomStatus,
};

