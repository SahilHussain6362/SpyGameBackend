// Voice signaling service for WebRTC peer connections
// Handles offer/answer/ICE candidate exchange

class VoiceSignalingService {
  constructor() {
    this.peers = new Map(); // socketId -> { offers: [], answers: [], iceCandidates: [] }
  }

  addOffer(socketId, offer) {
    if (!this.peers.has(socketId)) {
      this.peers.set(socketId, {
        offers: [],
        answers: [],
        iceCandidates: [],
      });
    }
    this.peers.get(socketId).offers.push(offer);
  }

  addAnswer(socketId, answer) {
    if (!this.peers.has(socketId)) {
      this.peers.set(socketId, {
        offers: [],
        answers: [],
        iceCandidates: [],
      });
    }
    this.peers.get(socketId).answers.push(answer);
  }

  addICECandidate(socketId, candidate) {
    if (!this.peers.has(socketId)) {
      this.peers.set(socketId, {
        offers: [],
        answers: [],
        iceCandidates: [],
      });
    }
    this.peers.get(socketId).iceCandidates.push(candidate);
  }

  getPeerData(socketId) {
    return this.peers.get(socketId) || {
      offers: [],
      answers: [],
      iceCandidates: [],
    };
  }

  removePeer(socketId) {
    this.peers.delete(socketId);
  }
}

module.exports = new VoiceSignalingService();

