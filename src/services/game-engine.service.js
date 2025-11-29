const Game = require('../models/game.model');
const Room = require('../models/room.model');
const { generateGameId } = require('../utils/id-generator');
const GAME_CONSTANTS = require('../constants/game.constants');
const ROLES = require('../constants/roles');
const { wordPairs } = require('../constants/word-pairs');
const logger = require('../config/logger');

// Select random spy from players
const selectSpy = (playerCount) => {
  return Math.floor(Math.random() * playerCount);
};

// Get word pair for category
const getWordPair = (category) => {
  const categoryWords = wordPairs[category];
  if (!categoryWords || categoryWords.length === 0) {
    throw new Error(`No word pairs found for category: ${category}`);
  }
  const randomPair = categoryWords[Math.floor(Math.random() * categoryWords.length)];
  return {
    villagerWord: randomPair.villager,
    spyWord: randomPair.spy,
  };
};

// Start a new game
const startGame = async (roomId, category) => {
  try {
    const room = await Room.findOne({ roomId }).populate('players.userId');

    if (!room) {
      throw new Error('Room not found');
    }

    if (room.players.length < GAME_CONSTANTS.MIN_PLAYERS) {
      throw new Error(`Need at least ${GAME_CONSTANTS.MIN_PLAYERS} players to start`);
    }

    // Get word pair
    const { villagerWord, spyWord } = getWordPair(category);

    // Select spy
    const spyIndex = selectSpy(room.players.length);

    // Create game players array
    const gamePlayers = room.players.map((player, index) => {
      const isSpy = index === spyIndex;
      return {
        userId: player.userId._id,
        username: player.username,
        role: isSpy ? ROLES.SPY : ROLES.VILLAGER,
        word: isSpy ? spyWord : villagerWord,
        isAlive: true,
        clues: [],
        votes: [],
      };
    });

    // Create game
    const game = await Game.create({
      gameId: generateGameId(),
      roomId: room.roomId,
      category,
      villagerWord,
      spyWord,
      players: gamePlayers,
      spectators: room.spectators.map((spec) => ({
        userId: spec.userId,
        username: spec.username,
      })),
      currentRound: 1,
      currentState: GAME_CONSTANTS.GAME_STATES.CLUE_PHASE,
      currentTurn: 0,
      rounds: [
        {
          roundNumber: 1,
          state: GAME_CONSTANTS.GAME_STATES.CLUE_PHASE,
          clues: [],
          votes: [],
          startedAt: new Date(),
        },
      ],
    });

    // Update room
    room.gameId = game._id;
    room.status = 'in_game';
    await room.save();

    return game;
  } catch (error) {
    logger.error('Start game error:', error);
    throw error;
  }
};

// Submit clue
const submitClue = async (gameId, userId, clue) => {
  try {
    const game = await Game.findOne({ gameId });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.currentState !== GAME_CONSTANTS.GAME_STATES.CLUE_PHASE) {
      throw new Error('Not in clue phase');
    }

    const player = game.players.find(
      (p) => p.userId.toString() === userId.toString() && p.isAlive
    );

    if (!player) {
      throw new Error('Player not found or eliminated');
    }

    // Check if it's player's turn
    const currentPlayerIndex = game.players.findIndex(
      (p) => p.userId.toString() === userId.toString() && p.isAlive
    );

    if (currentPlayerIndex !== game.currentTurn) {
      throw new Error('Not your turn');
    }

    // Add clue
    player.clues.push({
      clue: clue.trim(),
      submittedAt: new Date(),
    });

    game.rounds[game.currentRound - 1].clues.push({
      playerId: player.userId,
      clue: clue.trim(),
      submittedAt: new Date(),
    });

    // Move to next turn
    let nextTurn = game.currentTurn + 1;
    while (nextTurn < game.players.length && !game.players[nextTurn].isAlive) {
      nextTurn++;
    }

    // Check if all alive players have given clues
    const alivePlayers = game.players.filter((p) => p.isAlive);
    if (nextTurn >= alivePlayers.length) {
      // All clues submitted, move to voting phase
      game.currentState = GAME_CONSTANTS.GAME_STATES.VOTING_PHASE;
      game.rounds[game.currentRound - 1].state = GAME_CONSTANTS.GAME_STATES.VOTING_PHASE;
      game.currentTurn = 0;
    } else {
      game.currentTurn = nextTurn;
    }

    await game.save();
    return game;
  } catch (error) {
    logger.error('Submit clue error:', error);
    throw error;
  }
};

// Cast vote
const castVote = async (gameId, voterId, votedForId) => {
  try {
    const game = await Game.findOne({ gameId });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.currentState !== GAME_CONSTANTS.GAME_STATES.VOTING_PHASE) {
      throw new Error('Not in voting phase');
    }

    const voter = game.players.find(
      (p) => p.userId.toString() === voterId.toString() && p.isAlive
    );

    if (!voter) {
      throw new Error('Voter not found or eliminated');
    }

    const votedFor = game.players.find((p) => p.userId.toString() === votedForId.toString());

    if (!votedFor) {
      throw new Error('Player to vote for not found');
    }

    // Check if already voted this round
    const roundVotes = voter.votes.filter((v) => v.round === game.currentRound);
    if (roundVotes.length > 0) {
      throw new Error('Already voted this round');
    }

    // Add vote
    voter.votes.push({
      votedFor: votedFor.userId,
      round: game.currentRound,
      votedAt: new Date(),
    });

    game.rounds[game.currentRound - 1].votes.push({
      voterId: voter.userId,
      votedForId: votedFor.userId,
      votedAt: new Date(),
    });

    await game.save();

    // Check if all alive players have voted
    const alivePlayers = game.players.filter((p) => p.isAlive);
    const votesThisRound = game.rounds[game.currentRound - 1].votes.filter(
      (v) => v.round === game.currentRound
    );

    if (votesThisRound.length >= alivePlayers.length) {
      // All votes in, process results
      return processVotingResults(game);
    }

    return game;
  } catch (error) {
    logger.error('Cast vote error:', error);
    throw error;
  }
};

// Process voting results
const processVotingResults = async (game) => {
  try {
    const round = game.rounds[game.currentRound - 1];
    const votes = round.votes;

    // Count votes
    const voteCount = {};
    votes.forEach((vote) => {
      const votedForId = vote.votedForId.toString();
      voteCount[votedForId] = (voteCount[votedForId] || 0) + 1;
    });

    // Find player with most votes
    let maxVotes = 0;
    let eliminatedPlayerId = null;

    Object.keys(voteCount).forEach((playerId) => {
      if (voteCount[playerId] > maxVotes) {
        maxVotes = voteCount[playerId];
        eliminatedPlayerId = playerId;
      }
    });

    // Handle ties (random selection from tied players)
    const tiedPlayers = Object.keys(voteCount).filter(
      (id) => voteCount[id] === maxVotes
    );
    if (tiedPlayers.length > 1) {
      eliminatedPlayerId = tiedPlayers[Math.floor(Math.random() * tiedPlayers.length)];
    }

    const eliminatedPlayer = game.players.find(
      (p) => p.userId.toString() === eliminatedPlayerId
    );

    if (!eliminatedPlayer) {
      throw new Error('Eliminated player not found');
    }

    eliminatedPlayer.isAlive = false;
    round.eliminatedPlayerId = eliminatedPlayer.userId;
    round.endedAt = new Date();

    // Check if spy was eliminated
    if (eliminatedPlayer.role === ROLES.SPY) {
      // Spy caught - move to spy guess phase
      game.currentState = GAME_CONSTANTS.GAME_STATES.SPY_GUESS_PHASE;
      round.roundEndReason = 'spy_caught';
    } else {
      // Villager eliminated - check if game continues
      const alivePlayers = game.players.filter((p) => p.isAlive);

      if (alivePlayers.length < GAME_CONSTANTS.MIN_PLAYERS_FOR_NEXT_ROUND) {
        // Not enough players, spy wins
        game.currentState = GAME_CONSTANTS.GAME_STATES.GAME_END;
        game.winner = 'spy';
        game.endedAt = new Date();
        round.roundEndReason = 'spy_won';
      } else {
        // Start new round
        game.currentRound++;
        game.currentState = GAME_CONSTANTS.GAME_STATES.CLUE_PHASE;
        game.currentTurn = 0;
        game.rounds.push({
          roundNumber: game.currentRound,
          state: GAME_CONSTANTS.GAME_STATES.CLUE_PHASE,
          clues: [],
          votes: [],
          startedAt: new Date(),
        });
        round.roundEndReason = 'villager_eliminated';
      }
    }

    await game.save();
    return game;
  } catch (error) {
    logger.error('Process voting results error:', error);
    throw error;
  }
};

// Submit spy guess
const submitSpyGuess = async (gameId, guess) => {
  try {
    const game = await Game.findOne({ gameId });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.currentState !== GAME_CONSTANTS.GAME_STATES.SPY_GUESS_PHASE) {
      throw new Error('Not in spy guess phase');
    }

    const spy = game.players.find((p) => p.role === ROLES.SPY);

    if (!spy) {
      throw new Error('Spy not found');
    }

    const round = game.rounds[game.currentRound - 1];
    const isCorrect = guess.trim().toLowerCase() === game.villagerWord.toLowerCase();

    round.spyGuess = guess.trim();
    round.spyGuessCorrect = isCorrect;
    round.endedAt = new Date();

    if (isCorrect) {
      game.winner = 'spy';
      round.roundEndReason = 'spy_won';
    } else {
      game.winner = 'villagers';
      round.roundEndReason = 'villagers_won';
    }

    game.currentState = GAME_CONSTANTS.GAME_STATES.GAME_END;
    game.endedAt = new Date();

    await game.save();

    // Update player stats
    await updatePlayerStats(game);

    return game;
  } catch (error) {
    logger.error('Submit spy guess error:', error);
    throw error;
  }
};

// Update player stats
const updatePlayerStats = async (game) => {
  try {
    const User = require('../models/user.model');

    for (const player of game.players) {
      const user = await User.findById(player.userId);
      if (user) {
        user.stats.gamesPlayed++;

        if (game.winner === 'spy' && player.role === ROLES.SPY) {
          user.stats.gamesWon++;
          user.stats.spyWins++;
        } else if (game.winner === 'villagers' && player.role === ROLES.VILLAGER) {
          user.stats.gamesWon++;
          user.stats.villagerWins++;
        }

        user.gameHistory.push({
          gameId: game.gameId,
          role: player.role,
          result: (game.winner === 'spy' && player.role === ROLES.SPY) ||
                  (game.winner === 'villagers' && player.role === ROLES.VILLAGER)
            ? 'win'
            : 'loss',
          playedAt: game.endedAt,
        });

        await user.save();
      }
    }
  } catch (error) {
    logger.error('Update player stats error:', error);
  }
};

// Get game state
const getGameState = async (gameId, userId) => {
  try {
    const game = await Game.findOne({ gameId });

    if (!game) {
      throw new Error('Game not found');
    }

    // Find player
    const player = game.players.find((p) => p.userId.toString() === userId.toString());
    const isSpectator = game.spectators.some((s) => s.userId.toString() === userId.toString());

    if (!player && !isSpectator) {
      throw new Error('Not a participant in this game');
    }

    // Prepare game state (hide words from other players)
    const gameState = {
      gameId: game.gameId,
      roomId: game.roomId,
      category: game.category,
      currentRound: game.currentRound,
      currentState: game.currentState,
      currentTurn: game.currentTurn,
      players: game.players.map((p) => {
        const playerData = {
          userId: p.userId,
          username: p.username,
          role: p.role,
          isAlive: p.isAlive,
          clues: p.clues,
        };

        // Only show word to the player themselves or after game ends
        if (
          (p.userId.toString() === userId.toString()) ||
          game.currentState === GAME_CONSTANTS.GAME_STATES.GAME_END
        ) {
          playerData.word = p.word;
        }

        return playerData;
      }),
      rounds: game.rounds,
      winner: game.winner,
      startedAt: game.startedAt,
      endedAt: game.endedAt,
    };

    // Spectators can see words after round ends
    if (isSpectator && game.currentState === GAME_CONSTANTS.GAME_STATES.GAME_END) {
      gameState.villagerWord = game.villagerWord;
      gameState.spyWord = game.spyWord;
    }

    return gameState;
  } catch (error) {
    logger.error('Get game state error:', error);
    throw error;
  }
};

module.exports = {
  startGame,
  submitClue,
  castVote,
  submitSpyGuess,
  getGameState,
};

