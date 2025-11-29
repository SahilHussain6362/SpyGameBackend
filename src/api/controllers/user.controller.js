const userService = require('../../services/user.service');
const logger = require('../../config/logger');

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await userService.getUserProfile(userId);

    res.status(200).json({
      message: 'Profile retrieved successfully',
      data: profile,
    });
  } catch (error) {
    logger.error('Get profile controller error:', error);
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;
    const updatedProfile = await userService.updateUserProfile(userId, updateData);

    res.status(200).json({
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    logger.error('Update profile controller error:', error);
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const stats = await userService.getUserStats(userId);

    res.status(200).json({
      message: 'Stats retrieved successfully',
      data: stats,
    });
  } catch (error) {
    logger.error('Get stats controller error:', error);
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getStats,
};

