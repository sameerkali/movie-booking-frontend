// src/components/Layout/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Movie Booking
        </Link>
        <div>
          <Link to="/login" className="px-4 py-2 rounded hover:bg-blue-700">
            Login
          </Link>
          <Link to="/register" className="px-4 py-2 rounded hover:bg-blue-700">
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;