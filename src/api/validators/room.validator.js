const GAME_CONSTANTS = require('../../constants/game.constants');

const validateCreateRoom = (req, res, next) => {
  const { maxPlayers, isPrivate } = req.body;

  if (maxPlayers !== undefined) {
    if (
      typeof maxPlayers !== 'number' ||
      maxPlayers < GAME_CONSTANTS.MIN_PLAYERS ||
      maxPlayers > GAME_CONSTANTS.MAX_PLAYERS
    ) {
      return res.status(400).json({
        message: `Max players must be between ${GAME_CONSTANTS.MIN_PLAYERS} and ${GAME_CONSTANTS.MAX_PLAYERS}`,
      });
    }
  }

  if (isPrivate !== undefined && typeof isPrivate !== 'boolean') {
    return res.status(400).json({ message: 'isPrivate must be a boolean' });
  }

  next();
};

const validateJoinRoom = (req, res, next) => {
  const { roomCode } = req.body;

  if (!roomCode) {
    return res.status(400).json({ message: 'Room code is required' });
  }

  if (typeof roomCode !== 'string' || roomCode.length !== GAME_CONSTANTS.ROOM_CODE_LENGTH) {
    return res.status(400).json({ message: `Room code must be ${GAME_CONSTANTS.ROOM_CODE_LENGTH} digits` });
  }

  next();
};

module.exports = {
  validateCreateRoom,
  validateJoinRoom,
};

