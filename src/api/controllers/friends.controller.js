const friendsService = require('../../services/friends.service');
const logger = require('../../config/logger');

const sendFriendRequest = async (req, res, next) => {
  try {
    const fromUserId = req.user._id;
    const { toUserId } = req.body;

    const result = await friendsService.sendFriendRequest(fromUserId, toUserId);

    res.status(201).json({
      message: 'Friend request sent',
      data: result,
    });
  } catch (error) {
    logger.error('Send friend request controller error:', error);
    next(error);
  }
};

const acceptFriendRequest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { friendRequestId } = req.body;

    const result = await friendsService.acceptFriendRequest(userId, friendRequestId);

    res.status(200).json({
      message: 'Friend request accepted',
      data: result,
    });
  } catch (error) {
    logger.error('Accept friend request controller error:', error);
    next(error);
  }
};

const rejectFriendRequest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { friendRequestId } = req.body;

    const result = await friendsService.rejectFriendRequest(userId, friendRequestId);

    res.status(200).json({
      message: 'Friend request rejected',
      data: result,
    });
  } catch (error) {
    logger.error('Reject friend request controller error:', error);
    next(error);
  }
};

const getFriends = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const friends = await friendsService.getFriends(userId);

    res.status(200).json({
      message: 'Friends retrieved successfully',
      data: friends,
    });
  } catch (error) {
    logger.error('Get friends controller error:', error);
    next(error);
  }
};

const getFriendRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const requests = await friendsService.getFriendRequests(userId);

    res.status(200).json({
      message: 'Friend requests retrieved successfully',
      data: requests,
    });
  } catch (error) {
    logger.error('Get friend requests controller error:', error);
    next(error);
  }
};

const removeFriend = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { friendId } = req.params;

    const result = await friendsService.removeFriend(userId, friendId);

    res.status(200).json({
      message: 'Friend removed',
      data: result,
    });
  } catch (error) {
    logger.error('Remove friend controller error:', error);
    next(error);
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  getFriendRequests,
  removeFriend,
};

