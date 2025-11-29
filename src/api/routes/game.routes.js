const express = require('express');
const gameController = require('../controllers/game.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get game state
router.get('/:gameId', gameController.getGameState);

module.exports = router;

