import { io } from 'socket.io-client';

const socket = io('http://localhost:6969');

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