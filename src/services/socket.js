import { io } from 'socket.io-client';
import { SOCKET_SERVER_URL } from '../utils/utils';

const socket = io(SOCKET_SERVER_URL);

export const setupWebSocket = (movieId, updateCallback) => {
  socket.emit('join', movieId);

  socket.on('seatUpdate', (updatedMovie) => {
    updateCallback(updatedMovie);
  });

  return () => {
    socket.off('seatUpdate');
    socket.emit('leave', movieId);
  };
};