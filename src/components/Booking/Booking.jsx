import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieById, reserveSeat, confirmBooking } from '../../services/api';
import { format } from 'date-fns';

const Booking = () => {
  const [movie, setMovie] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [reservationStatus, setReservationStatus] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getMovieDetails = async () => {
      try {
        const data = await fetchMovieById(id);
        setMovie(data);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      }
    };
    getMovieDetails();
  }, [id]);

  const handleSeatSelect = (seatNumber) => {
    setSelectedSeat(seatNumber);
  };

  const handleReserve = async () => {
    if (!selectedSeat) return;
    try {
      const response = await reserveSeat(movie._id, selectedSeat);
      setMovie(response.movie);
      setReservationStatus('reserved');
      // Start a timer for reservation expiration (e.g., 2 minutes)
      setTimeout(() => {
        if (reservationStatus === 'reserved') {
          setReservationStatus(null);
          setSelectedSeat(null);
        }
      }, 120000);
    } catch (error) {
      console.error('Error reserving seat:', error);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSeat) return;
    try {
      const response = await confirmBooking(movie._id, selectedSeat);
      setMovie(response.movie);
      setReservationStatus('confirmed');
      // Navigate to a confirmation page or show a confirmation message
      navigate('/confirmation');
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };

  if (!movie) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Book Tickets for {movie.title}</h1>
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
          {reservationStatus === null && (
            <button onClick={handleReserve} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Reserve Seat
            </button>
          )}
          {reservationStatus === 'reserved' && (
            <button onClick={handleConfirm} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Confirm Booking
            </button>
          )}
        </div>
      )}

      {reservationStatus === 'confirmed' && (
        <p className="text-green-600 font-semibold">Booking confirmed!</p>
      )}
    </div>
  );
};

export default Booking;