const mongoose = require('mongoose');
const GAME_CONSTANTS = require('../constants/game.constants');
const ROLES = require('../constants/roles');

const gameSchema = new mongoose.Schema(
  {
    gameId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(GAME_CONSTANTS.CATEGORIES),
      required: true,
    },
    villagerWord: {
      type: String,
      required: true,
    },
    spyWord: {
      type: String,
      required: true,
    },
    players: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        username: String,
        role: {
          type: String,
          enum: [ROLES.SPY, ROLES.VILLAGER],
        },
        word: String, // Secret word assigned to this player
        isAlive: {
          type: Boolean,
          default: true,
        },
        clues: [
          {
            clue: String,
            submittedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        votes: [
          {
            votedFor: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            },
            round: Number,
            votedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
    spectators: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        username: String,
      },
    ],
    currentRound: {
      type: Number,
      default: 1,
    },
    currentState: {
      type: String,
      enum: Object.values(GAME_CONSTANTS.GAME_STATES),
      default: GAME_CONSTANTS.GAME_STATES.WAITING,
    },
    currentTurn: {
      type: Number,
      default: 0, // Index in players array
    },
    rounds: [
      {
        roundNumber: Number,
        state: String,
        clues: [
          {
            playerId: mongoose.Schema.Types.ObjectId,
            clue: String,
            submittedAt: Date,
          },
        ],
        votes: [
          {
            voterId: mongoose.Schema.Types.ObjectId,
            votedForId: mongoose.Schema.Types.ObjectId,
            votedAt: Date,
          },
        ],
        eliminatedPlayerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },
        spyGuess: {
          type: String,
          default: null,
        },
        spyGuessCorrect: {
          type: Boolean,
          default: null,
        },
        roundEndReason: {
          type: String,
          enum: ['spy_caught', 'villager_eliminated', 'spy_won', 'villagers_won'],
        },
        startedAt: Date,
        endedAt: Date,
      },
    ],
    winner: {
      type: String,
      enum: ['spy', 'villagers', null],
      default: null,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
gameSchema.index({ roomId: 1 });
gameSchema.index({ gameId: 1 });
gameSchema.index({ currentState: 1 });

module.exports = mongoose.model('Game', gameSchema);

