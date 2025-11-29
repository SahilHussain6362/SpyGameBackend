// This service manages WebSocket connections and room mappings
// It's used by socket handlers to track connections

class WebSocketService {
  constructor() {
    this.rooms = new Map(); // roomCode -> Set of socketIds
    this.socketToRoom = new Map(); // socketId -> roomCode
    this.socketToUser = new Map(); // socketId -> userId
    this.userToSocket = new Map(); // userId -> socketId
  }

  joinRoom(socketId, roomCode, userId) {
    if (!this.rooms.has(roomCode)) {
      this.rooms.set(roomCode, new Set());
    }

    this.rooms.get(roomCode).add(socketId);
    this.socketToRoom.set(socketId, roomCode);
    this.socketToUser.set(socketId, userId);
    this.userToSocket.set(userId, socketId);
  }

  leaveRoom(socketId) {
    const roomCode = this.socketToRoom.get(socketId);
    if (roomCode) {
      const room = this.rooms.get(roomCode);
      if (room) {
        room.delete(socketId);
        if (room.size === 0) {
          this.rooms.delete(roomCode);
        }
      }
    }

    const userId = this.socketToUser.get(socketId);
    if (userId) {
      this.userToSocket.delete(userId);
    }

    this.socketToRoom.delete(socketId);
    this.socketToUser.delete(socketId);
  }

  getRoomSockets(roomCode) {
    return this.rooms.get(roomCode) || new Set();
  }

  getSocketRoom(socketId) {
    return this.socketToRoom.get(socketId);
  }

  getSocketUser(socketId) {
    return this.socketToUser.get(socketId);
  }

  getUserSocket(userId) {
    return this.userToSocket.get(userId);
  }

  getRoomUsers(roomCode) {
    const sockets = this.getRoomSockets(roomCode);
    const users = [];
    sockets.forEach((socketId) => {
      const userId = this.socketToUser.get(socketId);
      if (userId) {
        users.push({ socketId, userId });
      }
    });
    return users;
  }
}

module.exports = new WebSocketService();

