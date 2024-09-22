import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieById, reserveSeat, confirmBooking } from '../../services/api';
import { format } from 'date-fns';
import io from 'socket.io-client';
import { SOCKET_SERVER_URL } from '../../utils/utils';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const Booking = () => {
  const [movie, setMovie] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, { transports: ['websocket'], secure: true });
    setSocket(newSocket);

    const getMovieDetails = async () => {
      try {
        const data = await fetchMovieById(id);
        setMovie(data);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      }
    };

    getMovieDetails();

    return () => newSocket.close();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const handleSeatUpdate = (data) => {
      if (data.movieId === id) {
        setMovie(prevMovie => ({
          ...prevMovie,
          seats: prevMovie.seats.map(seat =>
            seat.number === data.seatNumber ? { ...seat, status: data.newStatus } : seat
          )
        }));
      }
    };

    socket.on('seatUpdate', handleSeatUpdate);

    socket.on('priceUpdate', data => {
      if (data.movieId === id) {
        setMovie(prevMovie => ({
          ...prevMovie,
          currentPrice: data.newPrice
        }));
      }
    });

    return () => {
      socket.off('seatUpdate', handleSeatUpdate);
      socket.off('priceUpdate');
    };
  }, [socket, id]);

  const handleSeatSelect = (seatNumber) => {
    const selected = movie.seats.find(seat => seat.number === seatNumber);
    if (selected.status === 'available') {
      setSelectedSeat(seatNumber);
    } else if (selected.status === 'reserved' && selectedSeat === seatNumber) {
      setSelectedSeat(null);
    }
  };

  const handleInvalidToken = () => {
    toast.error('Invalid token. You will be logged out.');
    setTimeout(() => {
      localStorage.removeItem('token');
      navigate('/login');
    }, 2000);
  };

  const handleReserve = async () => {
    if (!selectedSeat) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await reserveSeat(movie._id, selectedSeat);
      setMovie(response.movie);
      socket.emit('seatUpdate', {
        movieId: movie._id,
        seatNumber: selectedSeat,
        newStatus: 'reserved'
      });
    } catch (error) {
      console.error('Error reserving seat:', error);
      if (error.message === 'User not authenticated') {
        toast.error('Please login first.');
      } else if (error.message.includes('Invalid token')) {
        handleInvalidToken();
      } else {
        toast.error('Failed to reserve seat. Someone else may have booked it just now.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSeat) return;

    confirmAlert({
      title: 'Confirm Booking',
      message: `Base Price: $${movie.basePrice.toFixed(2)}, Current Price: $${movie.currentPrice.toFixed(2)}. Do you want to proceed?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              const response = await confirmBooking(movie._id, selectedSeat);
              setMovie(response.movie);
              socket.emit('seatUpdate', {
                movieId: movie._id,
                seatNumber: selectedSeat,
                newStatus: 'booked'
              });
              toast.success('Booking confirmed!');
              setSelectedSeat(null);
            } catch (error) {
              console.error('Error confirming booking:', error);
              if (error.message.includes('Invalid token')) {
                handleInvalidToken();
              }
            }
          }
        },
        {
          label: 'No'
        }
      ]
    });
  };

  if (!movie) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <ToastContainer />
      <button 
        onClick={() => navigate(-1)} 
        className="bg-gray-200 text-gray-800 px-4 py-2 rounded mb-4 hover:bg-gray-300"
      >
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Book Tickets for {movie.title}</h1>
      <p className="mb-4"><strong>Showtime:</strong> {format(new Date(movie.showtime), 'PPpp')}</p>
      <p className="mb-4"><strong>Base Price:</strong> ${movie.basePrice.toFixed(2)}</p>
      <p className="mb-4"><strong>Current Price:</strong> ${movie.currentPrice.toFixed(2)}</p>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Select a Seat</h2>
        <div className="grid grid-cols-5 gap-2">
          {movie.seats.map((seat) => (
            <button
              key={seat._id}
              onClick={() => handleSeatSelect(seat.number)}
              disabled={seat.status !== 'available' && seat.status !== 'reserved'}
              className={`p-2 rounded ${
                seat.status === 'available' 
                  ? selectedSeat === seat.number
                    ? 'bg-blue-500 text-white'
                    : 'bg-green-200 hover:bg-green-300'
                  : seat.status === 'reserved'
                  ? 'bg-yellow-200'
                  : 'bg-red-200'
              } ${seat.status !== 'available' ? 'cursor-not-allowed' : ''}`}
            >
              {seat.number}
            </button>
          ))}
        </div>
      </div>

      {selectedSeat && (
        <div className="mb-4">
          <p>Selected Seat: {selectedSeat}</p>
          {loading ? (
            <button className="bg-gray-500 text-white px-4 py-2 rounded" disabled>
              Reserving...
            </button>
          ) : (
            <>
              {movie.seats.find(seat => seat.number === selectedSeat).status === 'available' && (
                <button onClick={handleReserve} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Reserve Seat
                </button>
              )}
              {movie.seats.find(seat => seat.number === selectedSeat).status === 'reserved' && (
                <button onClick={handleConfirm} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Confirm Booking
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Booking;
