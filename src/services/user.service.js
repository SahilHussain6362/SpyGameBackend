const User = require('../models/user.model');
const logger = require('../config/logger');

const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId)
      .select('-password')
      .populate('friends', 'userId username avatar isOnline');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    logger.error('Get user profile error:', error);
    throw error;
  }
};

const updateUserProfile = async (userId, updateData) => {
  try {
    const allowedUpdates = ['username', 'avatar'];
    const updates = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    logger.error('Update user profile error:', error);
    throw error;
  }
};

const updateOnlineStatus = async (userId, isOnline) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isOnline,
        lastSeen: new Date(),
      },
      { new: true }
    ).select('-password');

    return user;
  } catch (error) {
    logger.error('Update online status error:', error);
    throw error;
  }
};

const getUserStats = async (userId) => {
  try {
    const user = await User.findById(userId).select('stats gameHistory');

    if (!user) {
      throw new Error('User not found');
    }

    return {
      stats: user.stats,
      recentGames: user.gameHistory.slice(0, 10), // Last 10 games
    };
  } catch (error) {
    logger.error('Get user stats error:', error);
    throw error;
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateOnlineStatus,
  getUserStats,
};

