const express = require('express');
const friendsController = require('../controllers/friends.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Send friend request
router.post('/request', friendsController.sendFriendRequest);

// Accept friend request
router.post('/accept', friendsController.acceptFriendRequest);

// Reject friend request
router.post('/reject', friendsController.rejectFriendRequest);

// Get friends
router.get('/', friendsController.getFriends);

// Get friend requests
router.get('/requests', friendsController.getFriendRequests);

// Remove friend
router.delete('/:friendId', friendsController.removeFriend);

module.exports = router;

