import { SOCKET_SERVER_URL } from "../../utils/utils";
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMovieById } from "../../services/api";
import { format } from "date-fns";
import io from "socket.io-client";

const MovieDetails = () => {
  const [movie, setMovie] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const getMovieDetails = async () => {
      try {
        const data = await fetchMovieById(id);
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    getMovieDetails();

    // Initialize Socket.io connection and listen for real-time updates
    const socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      secure: true
    });

    // Log socket connection status
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Listen for price updates
    socket.on("priceUpdate", data => {
      console.log("Received priceUpdate event:", data);
      if (data.movieId === id) {
        setMovie(prevMovie => ({
          ...prevMovie,
          currentPrice: data.newPrice
        }));
      }
    });

    // Listen for seat status updates
    socket.on("seatUpdate", data => {
      console.log("Received seatUpdate event:", data);
      if (data.movieId === id) {
        setMovie(prevMovie => ({
          ...prevMovie,
          seats: prevMovie.seats.map(seat =>
            seat.number === data.seatNumber ? { ...seat, status: data.newStatus } : seat
          )
        }));
      }
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, [id]);

  if (!movie) return <div>Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-2/3">
        <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
        <p className="text-gray-600 mb-4">{movie.description}</p>
        <p className="mb-2">
          <strong>Showtime:</strong> {format(new Date(movie.showtime), "PPpp")}
        </p>
        <p className="mb-2">
          <strong>Base Price:</strong> ${movie.basePrice.toFixed(2)}
        </p>
        <p className="mb-4">
          <strong>Current Price:</strong> ${movie.currentPrice.toFixed(2)}
        </p>
        <Link
          to={`/booking/${movie._id}`}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Book Tickets
        </Link>
      </div>
      <div className="md:w-1/3 mt-4 md:mt-0">
        <h2 className="text-xl font-semibold mb-2">Seat Availability</h2>
        <div className="grid grid-cols-5 gap-2 bg--200">
          {movie.seats.map(seat => (
            <div
              key={seat._id}
            
               className={`p-2 text-center rounded ${
                 seat.status === "reserved"
              ? "bg-yellow-200"
              : seat.status === "available"
              ? "bg-green-200"
              : "bg-red-200"
               }`} // this functionality is not working properly always show else case means red color
            >
              {seat.number}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;




