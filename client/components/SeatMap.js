import { useState, useEffect } from "react";

const SeatMap = ({ seats, selectedSeats, onSeatSelect, maxSeats = 7 }) => {
  const [seatMap, setSeatMap] = useState({});
  const [bookedCount, setBookedCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);

  useEffect(() => {
    if (seats) {
      setSeatMap(seats);

      // Calculate counts
      let booked = 0;
      let available = 0;

      Object.values(seats)
        .flat()
        .forEach((seat) => {
          if (!seat.isAvailable) {
            booked++;
          } else {
            available++;
          }
        });

      setBookedCount(booked);
      setAvailableCount(available);
    }
  }, [seats]);

  const getSeatStatus = (seat) => {
    if (!seat.isAvailable) {
      return "occupied";
    }
    if (selectedSeats.includes(seat.id)) {
      return "selected";
    }
    return "available";
  };

  const handleSeatClick = (seat) => {
    // In the demo, seats are auto-selected, but we can still allow manual deselection
    if (selectedSeats.includes(seat.id)) {
      // Deselect seat
      onSeatSelect(selectedSeats.filter((id) => id !== seat.id));
    }
    // Don't allow manual selection - only auto-selection through number input
  };

  const getSeatClass = (seat) => {
    const status = getSeatStatus(seat);
    const baseClass =
      "w-12 h-12 rounded-lg border-2 font-semibold text-sm transition-all duration-200";

    switch (status) {
      case "available":
        return `${baseClass} bg-green-500 border-green-600 text-white cursor-default`;
      case "selected":
        return `${baseClass} bg-yellow-500 border-yellow-600 text-white hover:bg-yellow-600 hover:scale-105 cursor-pointer`;
      case "occupied":
        return `${baseClass} bg-red-500 border-red-600 text-white cursor-not-allowed opacity-75`;
      default:
        return `${baseClass} bg-gray-300 border-gray-400 text-gray-600 cursor-not-allowed`;
    }
  };

  if (!seatMap || Object.keys(seatMap).length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading seat map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Seat Map */}
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Ticket Booking
          </h3>
        </div>

        <div className="space-y-3">
          {Object.entries(seatMap)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([rowNumber, rowSeats]) => (
              <div
                key={rowNumber}
                className="flex items-center justify-center space-x-2"
              >
                <div className="flex space-x-2">
                  {rowSeats
                    .sort((a, b) => a.seatPosition - b.seatPosition)
                    .map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        className={getSeatClass(seat)}
                        disabled={!seat.isAvailable}
                        title={`Seat ${seat.seatNumber} - ${
                          seat.isAvailable ? "Available" : "Occupied"
                        }`}
                      >
                        {seat.seatNumber}
                      </button>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Status Counters */}
      <div className="flex justify-center space-x-4">
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold">
          Booked Seats = {bookedCount}
        </div>
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
          Available Seats = {availableCount}
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
