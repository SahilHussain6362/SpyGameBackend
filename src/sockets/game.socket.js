const gameEngineService = require('../services/game-engine.service');
const roomService = require('../services/room.service');
const SOCKET_EVENTS = require('../constants/socket-events');
const GAME_CONSTANTS = require('../constants/game.constants');
const logger = require('../config/logger');

const gameSocket = (io, socket) => {
  // Start game
  socket.on(SOCKET_EVENTS.GAME_START, async (data) => {
    try {
      const { roomCode, category } = data;

      if (!socket.user) {
        return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Authentication required' });
      }

      if (!category || !Object.values(GAME_CONSTANTS.CATEGORIES).includes(category)) {
        return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid category' });
      }

      const room = await roomService.getRoomByCode(roomCode);

      // Check if user is host
      // if (room.host.toString() !== socket.userId) {
      //   return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Only host can start the game' });
      // }

      // Check if enough players
      if (room.players.length < GAME_CONSTANTS.MIN_PLAYERS) {
        return socket.emit(SOCKET_EVENTS.ERROR, {
          message: `Need at least ${GAME_CONSTANTS.MIN_PLAYERS} players to start`,
        });
      }

      // Start game
      const game = await gameEngineService.startGame(room.roomId, category);

      // Broadcast game start
      io.to(roomCode).emit(SOCKET_EVENTS.GAME_START, { game });

      // Start clue phase
      io.to(roomCode).emit(SOCKET_EVENTS.CLUE_PHASE_START, {
        gameId: game.gameId,
        currentTurn: game.currentTurn,
        playerTurn: game.players[game.currentTurn],
      });
    } catch (error) {
      logger.error('Start game socket error:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
    }
  });

  // Submit clue
  socket.on(SOCKET_EVENTS.SUBMIT_CLUE, async (data) => {
    try {
      const { gameId, clue } = data;

      if (!socket.user) {
        return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Authentication required' });
      }

      if (!clue || clue.trim().length === 0) {
        return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Clue cannot be empty' });
      }

      const game = await gameEngineService.submitClue(gameId, socket.userId, clue);

      // Broadcast clue submitted
      io.to(game.roomId).emit(SOCKET_EVENTS.CLUE_SUBMITTED, {
        gameId: game.gameId,
        playerId: socket.userId,
        clue: clue.trim(),
      });

      // If clue phase ended, start voting
      if (game.currentState === GAME_CONSTANTS.GAME_STATES.VOTING_PHASE) {
        io.to(game.roomId).emit(SOCKET_EVENTS.CLUE_PHASE_END, { gameId: game.gameId });
        io.to(game.roomId).emit(SOCKET_EVENTS.VOTING_PHASE_START, {
          gameId: game.gameId,
          players: game.players.filter((p) => p.isAlive),
        });
      } else {
        // Next player's turn
        io.to(game.roomId).emit(SOCKET_EVENTS.PLAYER_TURN, {
          gameId: game.gameId,
          currentTurn: game.currentTurn,
          playerTurn: game.players[game.currentTurn],
        });
      }

      io.to(game.roomId).emit(SOCKET_EVENTS.GAME_STATE_UPDATE, { game });
    } catch (error) {
      logger.error('Submit clue socket error:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
    }
  });

  // Cast vote
  socket.on(SOCKET_EVENTS.CAST_VOTE, async (data) => {
    try {
      const { gameId, votedForId } = data;

      if (!socket.user) {
        return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Authentication required' });
      }

      const game = await gameEngineService.castVote(gameId, socket.userId, votedForId);

      // Broadcast vote casted
      io.to(game.roomId).emit(SOCKET_EVENTS.VOTE_CASTED, {
        gameId: game.gameId,
        voterId: socket.userId,
      });

      // If all votes in, process results
      if (game.currentState === GAME_CONSTANTS.GAME_STATES.SPY_GUESS_PHASE) {
        io.to(game.roomId).emit(SOCKET_EVENTS.VOTING_PHASE_END, { gameId: game.gameId });
        io.to(game.roomId).emit(SOCKET_EVENTS.VOTING_RESULTS, {
          gameId: game.gameId,
          eliminatedPlayer: game.players.find((p) => !p.isAlive),
        });
        io.to(game.roomId).emit(SOCKET_EVENTS.SPY_GUESS_START, {
          gameId: game.gameId,
          timeLimit: GAME_CONSTANTS.SPY_GUESS_TIME_LIMIT,
        });
      } else if (game.currentState === GAME_CONSTANTS.GAME_STATES.GAME_END) {
        io.to(game.roomId).emit(SOCKET_EVENTS.VOTING_PHASE_END, { gameId: game.gameId });
        io.to(game.roomId).emit(SOCKET_EVENTS.VOTING_RESULTS, {
          gameId: game.gameId,
          eliminatedPlayer: game.players.find((p) => !p.isAlive),
        });
        io.to(game.roomId).emit(SOCKET_EVENTS.GAME_END, {
          gameId: game.gameId,
          winner: game.winner,
          game,
        });
      } else {
        // New round starting
        io.to(game.roomId).emit(SOCKET_EVENTS.ROUND_END, { gameId: game.gameId, round: game.currentRound - 1 });
        io.to(game.roomId).emit(SOCKET_EVENTS.ROUND_START, {
          gameId: game.gameId,
          round: game.currentRound,
        });
        io.to(game.roomId).emit(SOCKET_EVENTS.CLUE_PHASE_START, {
          gameId: game.gameId,
          currentTurn: game.currentTurn,
          playerTurn: game.players[game.currentTurn],
        });
      }

      io.to(game.roomId).emit(SOCKET_EVENTS.GAME_STATE_UPDATE, { game });
    } catch (error) {
      logger.error('Cast vote socket error:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
    }
  });

  // Submit spy guess
  socket.on(SOCKET_EVENTS.SUBMIT_SPY_GUESS, async (data) => {
    try {
      const { gameId, guess } = data;

      if (!socket.user) {
        return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Authentication required' });
      }

      if (!guess || guess.trim().length === 0) {
        return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Guess cannot be empty' });
      }

      const game = await gameEngineService.submitSpyGuess(gameId, guess.trim());

      // Broadcast spy guess result
      io.to(game.roomId).emit(SOCKET_EVENTS.SPY_GUESS_RESULT, {
        gameId: game.gameId,
        guess: guess.trim(),
        isCorrect: game.rounds[game.currentRound - 1].spyGuessCorrect,
        winner: game.winner,
      });

      io.to(game.roomId).emit(SOCKET_EVENTS.GAME_END, {
        gameId: game.gameId,
        winner: game.winner,
        game,
      });

      io.to(game.roomId).emit(SOCKET_EVENTS.GAME_STATE_UPDATE, { game });
    } catch (error) {
      logger.error('Submit spy guess socket error:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
    }
  });

  // Throw things (emoji/props)
  socket.on(SOCKET_EVENTS.THROW_ITEM, (data) => {
    try {
      const { roomCode, item, targetUserId } = data;

      if (!item) {
        return socket.emit(SOCKET_EVENTS.ERROR, { message: 'Item is required' });
      }

      // Broadcast item thrown
      io.to(roomCode).emit(SOCKET_EVENTS.ITEM_THROWN, {
        fromUserId: socket.userId,
        fromUsername: socket.user?.username,
        item,
        targetUserId,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Throw item socket error:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
    }
  });
};

module.exports = gameSocket;

