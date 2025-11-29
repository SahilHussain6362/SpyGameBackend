module.exports = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // Room Events
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_JOINED: 'room_joined',
  ROOM_LEFT: 'room_left',
  ROOM_UPDATED: 'room_updated',
  ROOM_ERROR: 'room_error',
  
  // Game Events
  GAME_START: 'game_start',
  GAME_STATE_UPDATE: 'game_state_update',
  GAME_END: 'game_end',
  ROUND_START: 'round_start',
  ROUND_END: 'round_end',
  
  // Clue Phase
  CLUE_PHASE_START: 'clue_phase_start',
  PLAYER_TURN: 'player_turn',
  SUBMIT_CLUE: 'submit_clue',
  CLUE_SUBMITTED: 'clue_submitted',
  CLUE_PHASE_END: 'clue_phase_end',
  
  // Voting Phase
  VOTING_PHASE_START: 'voting_phase_start',
  CAST_VOTE: 'cast_vote',
  VOTE_CASTED: 'vote_casted',
  VOTING_RESULTS: 'voting_results',
  VOTING_PHASE_END: 'voting_phase_end',
  
  // Spy Guess
  SPY_GUESS_START: 'spy_guess_start',
  SUBMIT_SPY_GUESS: 'submit_spy_guess',
  SPY_GUESS_RESULT: 'spy_guess_result',
  
  // Chat
  SEND_MESSAGE: 'send_message',
  MESSAGE_RECEIVED: 'message_received',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  
  // Voice
  VOICE_OFFER: 'voice_offer',
  VOICE_ANSWER: 'voice_answer',
  VOICE_ICE_CANDIDATE: 'voice_ice_candidate',
  VOICE_ERROR: 'voice_error',
  
  // Throw Things
  THROW_ITEM: 'throw_item',
  ITEM_THROWN: 'item_thrown',
  
  // Player Status
  PLAYER_READY: 'player_ready',
  PLAYER_NOT_READY: 'player_not_ready',
  PLAYER_ELIMINATED: 'player_eliminated',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  
  // Error
  ERROR: 'error',
};

