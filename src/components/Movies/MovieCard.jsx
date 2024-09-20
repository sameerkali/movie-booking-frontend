import React from 'react';

const MovieCard = ({ movie }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{movie.title}</h2>
        <p className="text-gray-600">{movie.genre}</p>
      </div>
    </div>
  );
};

export default MovieCard;