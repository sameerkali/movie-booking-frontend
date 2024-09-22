import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Movie Booking
        </Link>
        <div>
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="px-4 py-2 rounded hover:bg-blue-700">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 rounded hover:bg-blue-700">
                Register
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} className="px-4 py-2 rounded hover:bg-blue-700">
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
