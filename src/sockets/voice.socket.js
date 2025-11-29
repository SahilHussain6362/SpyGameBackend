const voiceSignalingService = require('../services/voice-signaling.service');
const websocketService = require('../services/websocket.service');
const SOCKET_EVENTS = require('../constants/socket-events');
const logger = require('../config/logger');

const voiceSocket = (io, socket) => {
  // Voice offer (WebRTC)
  socket.on(SOCKET_EVENTS.VOICE_OFFER, (data) => {
    try {
      const { roomCode, offer, targetSocketId } = data;

      if (!offer) {
        return socket.emit(SOCKET_EVENTS.VOICE_ERROR, { message: 'Offer is required' });
      }

      voiceSignalingService.addOffer(socket.id, offer);

      // Send offer to target or broadcast to room
      if (targetSocketId) {
        io.to(targetSocketId).emit(SOCKET_EVENTS.VOICE_OFFER, {
          offer,
          fromSocketId: socket.id,
        });
      } else {
        socket.to(roomCode).emit(SOCKET_EVENTS.VOICE_OFFER, {
          offer,
          fromSocketId: socket.id,
        });
      }
    } catch (error) {
      logger.error('Voice offer socket error:', error);
      socket.emit(SOCKET_EVENTS.VOICE_ERROR, { message: error.message });
    }
  });

  // Voice answer (WebRTC)
  socket.on(SOCKET_EVENTS.VOICE_ANSWER, (data) => {
    try {
      const { answer, targetSocketId } = data;

      if (!answer) {
        return socket.emit(SOCKET_EVENTS.VOICE_ERROR, { message: 'Answer is required' });
      }

      voiceSignalingService.addAnswer(socket.id, answer);

      // Send answer to target
      if (targetSocketId) {
        io.to(targetSocketId).emit(SOCKET_EVENTS.VOICE_ANSWER, {
          answer,
          fromSocketId: socket.id,
        });
      }
    } catch (error) {
      logger.error('Voice answer socket error:', error);
      socket.emit(SOCKET_EVENTS.VOICE_ERROR, { message: error.message });
    }
  });

  // ICE candidate (WebRTC)
  socket.on(SOCKET_EVENTS.VOICE_ICE_CANDIDATE, (data) => {
    try {
      const { candidate, targetSocketId } = data;

      if (!candidate) {
        return socket.emit(SOCKET_EVENTS.VOICE_ERROR, { message: 'ICE candidate is required' });
      }

      voiceSignalingService.addICECandidate(socket.id, candidate);

      // Send ICE candidate to target
      if (targetSocketId) {
        io.to(targetSocketId).emit(SOCKET_EVENTS.VOICE_ICE_CANDIDATE, {
          candidate,
          fromSocketId: socket.id,
        });
      }
    } catch (error) {
      logger.error('ICE candidate socket error:', error);
      socket.emit(SOCKET_EVENTS.VOICE_ERROR, { message: error.message });
    }
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    voiceSignalingService.removePeer(socket.id);
  });
};

module.exports = voiceSocket;

