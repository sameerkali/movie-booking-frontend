import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchMovieById, reserveSeat, confirmBooking } from '../../services/api';
import { format } from 'date-fns';
import io from 'socket.io-client';
import { SOCKET_SERVER_URL } from '../../utils/utils';

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

    return () => {
      socket.off('seatUpdate', handleSeatUpdate);
    };
  }, [socket, id]);

  const handleSeatSelect = (seatNumber) => {
    if (movie.seats.find(seat => seat.number === seatNumber).status === 'available') {
      setSelectedSeat(seatNumber);
    }
  };

  const handleReserve = async () => {
    if (!selectedSeat) return;
    setLoading(true);

    try {
      const response = await reserveSeat(movie._id, selectedSeat);
      setMovie(response.movie);

      // Emit the seat update to all clients
      socket.emit('seatUpdate', {
        movieId: movie._id,
        seatNumber: selectedSeat,
        newStatus: 'reserved'
      });

      // Start a timer for reservation expiration (e.g., 2 minutes)
      setTimeout(() => {
        setMovie(prevMovie => {
          const updatedSeats = prevMovie.seats.map(seat =>
            seat.number === selectedSeat && seat.status === 'reserved'
              ? { ...seat, status: 'available' }
              : seat
          );
          if (updatedSeats.some(seat => seat.number === selectedSeat && seat.status === 'available')) {
            socket.emit('seatUpdate', {
              movieId: movie._id,
              seatNumber: selectedSeat,
              newStatus: 'available'
            });
          }
          return { ...prevMovie, seats: updatedSeats };
        });
        setSelectedSeat(null);
      }, 120000);
    } catch (error) {
      console.error('Error reserving seat:', error);
      alert('Failed to reserve seat. Someone else may have booked it just now.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSeat) return;

    try {
      const response = await confirmBooking(movie._id, selectedSeat);
      setMovie(response.movie);

      // Emit the seat update to all clients
      socket.emit('seatUpdate', {
        movieId: movie._id,
        seatNumber: selectedSeat,
        newStatus: 'booked'
      });

      alert("Booking confirmed!");
      // navigate('/confirmation');
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };
  const handleclick = () => {
    navigate(-1)
  }

  if (!movie) return <div>Loading...</div>;

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6"><h1 onClick={handleclick}>{`<`}</h1>Book Tickets for {movie.title}</h1>
      <p className="mb-4"><strong>Showtime:</strong> {format(new Date(movie.showtime), 'PPpp')}</p>
      <p className="mb-4"><strong>Current Price:</strong> ${movie.currentPrice.toFixed(2)}</p>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Select a Seat</h2>
        <div className="grid grid-cols-5 gap-2">
          {movie.seats.map((seat) => (
            <button
              key={seat._id}
              onClick={() => handleSeatSelect(seat.number)}
              disabled={seat.status !== 'available'}
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

      {movie.seats.find(seat => seat.number === selectedSeat)?.status === 'booked' && (
        <p className="text-green-600 font-semibold">Booking confirmed!</p>
      )}
    </div>
  );
};

export default Booking;




