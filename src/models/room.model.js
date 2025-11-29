const mongoose = require('mongoose');
const GAME_CONSTANTS = require('../constants/game.constants');
const ROLES = require('../constants/roles');

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    roomCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    players: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        socketId: String,
        username: String,
        isReady: {
          type: Boolean,
          default: false,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    spectators: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        socketId: String,
        username: String,
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      default: null,
    },
    settings: {
      maxPlayers: {
        type: Number,
        default: GAME_CONSTANTS.MAX_PLAYERS,
        min: GAME_CONSTANTS.MIN_PLAYERS,
        max: GAME_CONSTANTS.MAX_PLAYERS,
      },
      maxSpectators: {
        type: Number,
        default: GAME_CONSTANTS.MAX_SPECTATORS,
      },
      isPrivate: {
        type: Boolean,
        default: false,
      },
    },
    inviteLink: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['waiting', 'in_game', 'finished'],
      default: 'waiting',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
roomSchema.index({ roomCode: 1 });
roomSchema.index({ host: 1 });
roomSchema.index({ status: 1 });

module.exports = mongoose.model('Room', roomSchema);

