module.exports = {
  MIN_PLAYERS: 4,
  MAX_PLAYERS: 8,
  MAX_SPECTATORS: 10,
  ROOM_CODE_LENGTH: 6,
  
  GAME_STATES: {
    WAITING: 'waiting',
    STARTING: 'starting',
    CLUE_PHASE: 'clue_phase',
    VOTING_PHASE: 'voting_phase',
    SPY_GUESS_PHASE: 'spy_guess_phase',
    ROUND_END: 'round_end',
    GAME_END: 'game_end',
  },
  
  CATEGORIES: {
    FOOD: 'food',
    ANIMALS: 'animals',
    PLACES: 'places',
    MOVIES: 'movies',
    JOBS: 'jobs',
    SPORTS: 'sports',
    COUNTRIES: 'countries',
    OBJECTS: 'objects',
  },
  
  CLUE_TIME_LIMIT: 60000, // 60 seconds per player
  VOTING_TIME_LIMIT: 30000, // 30 seconds
  SPY_GUESS_TIME_LIMIT: 30000, // 30 seconds
  
  MIN_PLAYERS_FOR_NEXT_ROUND: 2,
};

