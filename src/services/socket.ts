import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://schoolsafe.onrender.com';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('schoolsafe_access_token') : null;
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token },
    });
  } else if (token) {
    (socket as any).auth = { token };
  }
  return socket;
};
