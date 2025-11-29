const mongoose = require('mongoose');
const ROLES = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // Allows null/undefined but enforces uniqueness when present
    },
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    isGuest: {
      type: Boolean,
      default: true,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    friendRequests: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    gameHistory: [
      {
        gameId: String,
        role: {
          type: String,
          enum: [ROLES.SPY, ROLES.VILLAGER, ROLES.SPECTATOR],
        },
        result: {
          type: String,
          enum: ['win', 'loss'],
        },
        playedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    stats: {
      gamesPlayed: {
        type: Number,
        default: 0,
      },
      gamesWon: {
        type: Number,
        default: 0,
      },
      spyWins: {
        type: Number,
        default: 0,
      },
      villagerWins: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ isOnline: 1 });

module.exports = mongoose.model('User', userSchema);

