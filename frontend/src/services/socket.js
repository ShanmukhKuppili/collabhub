import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

/**
 * Initialize Socket.IO connection
 */
export const initSocket = (token) => {
  // Disconnect existing socket if any
  if (socket?.connected) {
    console.log('Socket already connected, reusing connection');
    return socket;
  }

  // Clean up old socket
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 10000,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
      // Server disconnected, try to reconnect
      socket.connect();
    }
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_error', (error) => {
    console.error('❌ Socket reconnection error:', error.message);
  });

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = () => {
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Join a group room
 */
export const joinGroupRoom = (groupId) => {
  if (socket?.connected) {
    socket.emit('group:join', groupId);
  }
};

/**
 * Leave a group room
 */
export const leaveGroupRoom = (groupId) => {
  if (socket?.connected) {
    socket.emit('group:leave', groupId);
  }
};

/**
 * Send typing indicator
 */
export const sendTypingIndicator = (groupId, userId, isTyping) => {
  if (socket?.connected) {
    socket.emit(isTyping ? 'typing:start' : 'typing:stop', { groupId, userId });
  }
};

/**
 * Send DM typing indicator
 */
export const sendDMTypingIndicator = (receiverId, isTyping) => {
  if (socket?.connected) {
    socket.emit(isTyping ? 'dm:typing:start' : 'dm:typing:stop', { receiverId });
  }
};

/**
 * Listen to socket events
 */
export const onSocketEvent = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  }
};

/**
 * Remove socket event listener
 */
export const offSocketEvent = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
  }
};

/**
 * Emit socket event
 */
export const emitSocketEvent = (event, data) => {
  if (socket?.connected) {
    socket.emit(event, data);
  }
};
