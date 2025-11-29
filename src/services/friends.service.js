const User = require('../models/user.model');
const Friend = require('../models/friend.model');
const logger = require('../config/logger');

const sendFriendRequest = async (fromUserId, toUserId) => {
  try {
    if (fromUserId.toString() === toUserId.toString()) {
      throw new Error('Cannot send friend request to yourself');
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      throw new Error('User not found');
    }

    // Check if friendship already exists
    const existingFriendship = await Friend.findOne({
      $or: [
        { user1: fromUserId, user2: toUserId },
        { user1: toUserId, user2: fromUserId },
      ],
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        throw new Error('Already friends');
      }
      if (existingFriendship.status === 'pending') {
        throw new Error('Friend request already pending');
      }
    }

    // Create or update friend request
    const friendship = await Friend.findOneAndUpdate(
      {
        $or: [
          { user1: fromUserId, user2: toUserId },
          { user1: toUserId, user2: fromUserId },
        ],
      },
      {
        user1: fromUserId,
        user2: toUserId,
        status: 'pending',
        requestedBy: fromUserId,
      },
      { upsert: true, new: true }
    ).populate('user1 user2', 'userId username avatar isOnline');

    return friendship;
  } catch (error) {
    logger.error('Send friend request error:', error);
    throw error;
  }
};

const acceptFriendRequest = async (userId, friendRequestId) => {
  try {
    const friendship = await Friend.findById(friendRequestId);

    if (!friendship) {
      throw new Error('Friend request not found');
    }

    if (friendship.user2.toString() !== userId.toString()) {
      throw new Error('Unauthorized to accept this request');
    }

    if (friendship.status !== 'pending') {
      throw new Error('Friend request already processed');
    }

    friendship.status = 'accepted';
    await friendship.save();

    // Add to each user's friends array
    await User.findByIdAndUpdate(friendship.user1, {
      $addToSet: { friends: friendship.user2 },
    });
    await User.findByIdAndUpdate(friendship.user2, {
      $addToSet: { friends: friendship.user1 },
    });

    return friendship.populate('user1 user2', 'userId username avatar isOnline');
  } catch (error) {
    logger.error('Accept friend request error:', error);
    throw error;
  }
};

const rejectFriendRequest = async (userId, friendRequestId) => {
  try {
    const friendship = await Friend.findById(friendRequestId);

    if (!friendship) {
      throw new Error('Friend request not found');
    }

    if (friendship.user2.toString() !== userId.toString()) {
      throw new Error('Unauthorized to reject this request');
    }

    await Friend.findByIdAndDelete(friendRequestId);

    return { message: 'Friend request rejected' };
  } catch (error) {
    logger.error('Reject friend request error:', error);
    throw error;
  }
};

const getFriends = async (userId) => {
  try {
    const user = await User.findById(userId).populate('friends', 'userId username avatar isOnline lastSeen');

    if (!user) {
      throw new Error('User not found');
    }

    return user.friends;
  } catch (error) {
    logger.error('Get friends error:', error);
    throw error;
  }
};

const getFriendRequests = async (userId) => {
  try {
    const requests = await Friend.find({
      user2: userId,
      status: 'pending',
    })
      .populate('user1', 'userId username avatar isOnline')
      .sort({ createdAt: -1 });

    return requests;
  } catch (error) {
    logger.error('Get friend requests error:', error);
    throw error;
  }
};

const removeFriend = async (userId, friendId) => {
  try {
    const friendship = await Friend.findOne({
      $or: [
        { user1: userId, user2: friendId },
        { user1: friendId, user2: userId },
      ],
    });

    if (!friendship) {
      throw new Error('Friendship not found');
    }

    await Friend.findByIdAndDelete(friendship._id);

    // Remove from each user's friends array
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    return { message: 'Friend removed' };
  } catch (error) {
    logger.error('Remove friend error:', error);
    throw error;
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

