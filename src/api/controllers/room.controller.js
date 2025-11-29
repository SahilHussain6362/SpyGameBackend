const roomService = require('../../services/room.service');
const logger = require('../../config/logger');

const createRoom = async (req, res, next) => {
  try {
    const hostId = req.user._id;
    const settings = req.body;

    const room = await roomService.createRoom(hostId, settings);

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

    const room = await roomService.joinRoom(roomCode, userId, username, null, asSpectator);

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

    const room = await roomService.leaveRoom(roomCode, userId);

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

