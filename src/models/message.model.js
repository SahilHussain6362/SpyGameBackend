const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    messageType: {
      type: String,
      enum: ['chat', 'clue', 'system'],
      default: 'chat',
    },
    gameId: {
      type: String,
      default: null,
    },
    roundNumber: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ gameId: 1, roundNumber: 1 });

module.exports = mongoose.model('Message', messageSchema);

