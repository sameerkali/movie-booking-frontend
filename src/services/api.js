import axios from 'axios';
import { API_BASE_URL } from '../utils/utils';

const authAxios = axios.create({
  baseURL: API_BASE_URL,
});

authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const fetchMovies = async () => {
  const response = await authAxios.get('/bookings/movies');
  return response.data;
};

export const fetchMovieById = async (id) => {
  const response = await authAxios.get(`/bookings/movies/${id}`);
  return response.data;
};

export const reserveSeat = async (movieId, seatNumber) => {
  console.log("api paramiters reserveSeat: ", movieId," : ", seatNumber)
  const response = await authAxios.post('/bookings/reserve', { movieId, seatNumber });
  return response.data;
};

export const confirmBooking = async (movieId, seatNumber) => {
  const response = await authAxios.post('/bookings/confirm', { movieId, seatNumber });
  return response.data;
};

export const register = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/users/register`, userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/users/login`, credentials);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};