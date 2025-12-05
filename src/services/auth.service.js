const User = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/hashing');
const { generateToken } = require('../utils/jwt');
const { generateUserId } = require('../utils/id-generator');
const logger = require('../config/logger');

const register = async (username, email, password, avatar = null) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new Error('User already exists with this email or username');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      userId: generateUserId(),
      username,
      email,
      password: hashedPassword,
      avatar: avatar || null,
      isGuest: false,
    });

    // Generate token
    const token = generateToken({ userId: user._id, email: user.email });

    return {
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isGuest: user.isGuest,
      },
      token,
    };
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
};

const login = async (email, password) => {
  try {
    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = generateToken({ userId: user._id, email: user.email });

    return {
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
        avatar: user.avatar,
      },
      token,
    };
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
};

const createGuest = async (username, avatar = null) => {
  try {
    // Create guest user
    const user = await User.create({
      userId: generateUserId(),
      username,
      avatar: avatar || null,
      isGuest: true,
      isOnline: true,
    });

    // Generate token (guests also get tokens for session management)
    const token = generateToken({ userId: user._id, isGuest: true });

    return {
      user: {
        userId: user.userId,
        username: user.username,
        avatar: user.avatar,
        isGuest: user.isGuest,
      },
      token,
    };
  } catch (error) {
    logger.error('Guest creation error:', error);
    throw error;
  }
};

const googleAuth = async (profile) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      // Update online status
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();
    } else {
      // Check if email exists
      user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.avatar = profile.photos[0].value;
        user.isGuest = false;
        user.isOnline = true;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          userId: generateUserId(),
          username: profile.displayName || profile.emails[0].value.split('@')[0],
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0].value,
          isGuest: false,
          isOnline: true,
        });
      }
    }

    const token = generateToken({ userId: user._id, email: user.email });

    return {
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
        avatar: user.avatar,
      },
      token,
    };
  } catch (error) {
    logger.error('Google auth error:', error);
    throw error;
  }
};

module.exports = {
  register,
  login,
  createGuest,
  googleAuth,
};

