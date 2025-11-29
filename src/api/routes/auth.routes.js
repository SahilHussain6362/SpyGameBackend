const express = require('express');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { googleClientId, googleClientSecret, googleCallbackUrl } = require('../../config/env');
const authController = require('../controllers/auth.controller');
const { validateLogin, validateRegister, validateGuest } = require('../validators/auth.validator');
const { authenticate } = require('../middlewares/auth.middleware');
const User = require('../../models/user.model');

const router = express.Router();

// Configure Google OAuth Strategy
if (googleClientId && googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          return done(null, profile);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// Register
router.post('/register', validateRegister, authController.register);

// Login
router.post('/login', validateLogin, authController.login);

// Guest
router.post('/guest', validateGuest, authController.createGuest);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleCallback
);

// Logout (requires authentication)
router.post('/logout', authenticate, authController.logout);

module.exports = router;

