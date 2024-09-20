import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMovies } from '../services/api';
import MovieCard from '../components/Movies/MovieCard';

const Home = () => {
  const [movies, setMovies] = useState([]);
  console.log("movies ::", movies)

  useEffect(() => {
    const getMovies = async () => {
      try {
        const data = await fetchMovies();
        setMovies(data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };
    getMovies();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Now Showing</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <Link key={movie._id} to={`/movie/${movie._id}`}>
            <MovieCard movie={movie} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;