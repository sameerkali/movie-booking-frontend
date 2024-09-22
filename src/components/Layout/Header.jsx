// src/components/Layout/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the token from local storage
    localStorage.removeItem("token");
    // Optionally, redirect to the login page
    navigate('/login');
  };

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
          <button onClick={handleLogout} className="px-4 py-2 rounded hover:bg-blue-700">
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
