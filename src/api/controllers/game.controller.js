const gameEngineService = require('../../services/game-engine.service');
const logger = require('../../config/logger');

const getGameState = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const userId = req.user._id;

    const gameState = await gameEngineService.getGameState(gameId, userId);

    res.status(200).json({
      message: 'Game state retrieved successfully',
      data: gameState,
    });
  } catch (error) {
    logger.error('Get game state controller error:', error);
    next(error);
  }
};

module.exports = {
  getGameState,
};

