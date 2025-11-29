const express = require('express');
const roomController = require('../controllers/room.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { validateCreateRoom, validateJoinRoom } = require('../validators/room.validator');

const router = express.Router();

// Create room (requires auth)
router.post('/', authenticate, validateCreateRoom, roomController.createRoom);

// Get room (optional auth for spectators)
router.get('/:roomCode', optionalAuth, roomController.getRoom);

// Join room (requires auth)
router.post('/join', authenticate, validateJoinRoom, roomController.joinRoom);

// Leave room (requires auth)
router.post('/leave', authenticate, roomController.leaveRoom);

// Toggle ready (requires auth)
router.post('/ready', authenticate, roomController.toggleReady);

module.exports = router;

