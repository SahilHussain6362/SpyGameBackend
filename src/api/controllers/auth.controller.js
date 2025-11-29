const authService = require('../../services/auth.service');
const logger = require('../../config/logger');

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.register(username, email, password);

    res.status(201).json({
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    logger.error('Register controller error:', error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.status(200).json({
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    logger.error('Login controller error:', error);
    next(error);
  }
};

const createGuest = async (req, res, next) => {
  try {
    const { username } = req.body;
    const result = await authService.createGuest(username);

    res.status(201).json({
      message: 'Guest user created',
      data: result,
    });
  } catch (error) {
    logger.error('Create guest controller error:', error);
    next(error);
  }
};

const googleCallback = async (req, res, next) => {
  try {
    // This will be handled by passport middleware
    // The user profile will be in req.user
    const profile = req.user;
    const result = await authService.googleAuth(profile);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${result.token}`);
  } catch (error) {
    logger.error('Google callback controller error:', error);
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userService = require('../../services/user.service');

    // Update user's online status to false and update lastSeen
    await userService.updateOnlineStatus(userId, false);

    res.status(200).json({
      message: 'Logout successful',
      data: {
        userId: req.user.userId,
        username: req.user.username,
      },
    });
  } catch (error) {
    logger.error('Logout controller error:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  createGuest,
  googleCallback,
  logout,
};

