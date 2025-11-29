const { v4: uuidv4 } = require('uuid');
const GAME_CONSTANTS = require('../constants/game.constants');

const generateRoomCode = () => {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < GAME_CONSTANTS.ROOM_CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const generateUserId = () => {
  return uuidv4();
};

const generateGameId = () => {
  return uuidv4();
};

const generateRoomId = () => {
  return uuidv4();
};

module.exports = {
  generateRoomCode,
  generateUserId,
  generateGameId,
  generateRoomId,
};

