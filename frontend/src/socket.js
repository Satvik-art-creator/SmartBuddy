import { io } from 'socket.io-client';

let socket = null;
let isConnecting = false;
const listeners = new Map();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export function connectSocket() {
  if (socket || isConnecting) return socket;
  isConnecting = true;
  const token = localStorage.getItem('token');
  socket = io(BACKEND_URL, {
    transports: ['websocket'],
    auth: {},
    autoConnect: true,
    withCredentials: true,
  });

  socket.on('connect', () => {
    // Authenticate after connection established
    if (token) {
      socket.emit('authenticate', token);
    }
    // Optional: heartbeat or pings can be added here
    // console.log('Socket connected', socket.id);
  });

  socket.on('authenticated', (data) => {
    // console.log('Socket authenticated as', data);
  });

  socket.on('unauthorized', (data) => {
    // console.warn('Socket unauthorized', data);
  });

  socket.on('disconnect', () => {
    // console.log('Socket disconnected');
  });

  isConnecting = false;
  return socket;
}

export function getSocket() {
  if (!socket) {
    return connectSocket();
  }
  return socket;
}

export function on(event, handler) {
  const s = getSocket();
  s.on(event, handler);
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
}

export function off(event, handler) {
  if (!socket) return;
  socket.off(event, handler);
  if (listeners.has(event)) listeners.get(event).delete(handler);
}

export function disconnectSocket() {
  if (socket) {
    listeners.forEach((handlers, event) => {
      handlers.forEach((h) => socket.off(event, h));
    });
    listeners.clear();
    socket.disconnect();
    socket = null;
  }
}
