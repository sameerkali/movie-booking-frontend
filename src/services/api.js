import axios from 'axios';
import { API_BASE_URL } from '../utils/utils';


export const fetchMovies = async () => {
  const response = await axios.get(`${API_BASE_URL}/bookings/movies`);
  return response.data;
};

export const fetchMovieById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/bookings/movies/${id}`);
  return response.data;
};

export const reserveSeat = async (movieId, seatNumber) => {
  const response = await axios.post(`${API_BASE_URL}/bookings/reserve`, { movieId, seatNumber });
  return response.data;
};

export const confirmBooking = async (movieId, seatNumber) => {
  const response = await axios.post(`${API_BASE_URL}/bookings/confirm`, { movieId, seatNumber });
  return response.data;
};

export const register = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/register`, userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/login`, credentials);
  return response.data;
};