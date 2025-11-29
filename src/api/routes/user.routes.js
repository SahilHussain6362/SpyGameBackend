const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get profile
router.get('/profile', userController.getProfile);

// Update profile
router.patch('/profile', userController.updateProfile);

// Get stats
router.get('/stats', userController.getStats);

module.exports = router;

