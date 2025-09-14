import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import SeatMap from "../components/SeatMap";
import { seatsAPI } from "../lib/api";
import { isAuthenticated } from "../lib/auth";
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function BookSeats() {
  const [seats, setSeats] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    fetchSeats();
  }, [router]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const response = await seatsAPI.getAllSeats();
      setSeats(response.data.seats);
    } catch (error) {
      console.error("Error fetching seats:", error);
      toast.error("Failed to load seat map. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seatIds) => {
    setSelectedSeats(seatIds);
  };

  const handleNumberOfSeatsChange = (numberOfSeats) => {
    if (numberOfSeats < 1 || numberOfSeats > 7) {
      return;
    }

    // Auto-select seats based on guidelines
    const availableSeats = Object.values(seats || {})
      .flat()
      .filter((seat) => seat.isAvailable && !selectedSeats.includes(seat.id))
      .sort((a, b) => {
        // Sort by row number first, then by seat position
        if (a.rowNumber !== b.rowNumber) {
          return a.rowNumber - b.rowNumber;
        }
        return a.seatPosition - b.seatPosition;
      });

    if (availableSeats.length < numberOfSeats) {
      toast.error(`Only ${availableSeats.length} seats available`);
      return;
    }

    // Try to find seats in the same row first
    let selectedSeatIds = [];
    const rowGroups = {};

    // Group available seats by row
    availableSeats.forEach((seat) => {
      if (!rowGroups[seat.rowNumber]) {
        rowGroups[seat.rowNumber] = [];
      }
      rowGroups[seat.rowNumber].push(seat);
    });

    // Find the best row with enough seats
    let bestRow = null;
    let bestRowSeats = [];

    Object.entries(rowGroups).forEach(([rowNumber, rowSeats]) => {
      if (rowSeats.length >= numberOfSeats) {
        if (!bestRow || rowSeats.length > bestRowSeats.length) {
          bestRow = parseInt(rowNumber);
          bestRowSeats = rowSeats.slice(0, numberOfSeats);
        }
      }
    });

    if (bestRowSeats.length === numberOfSeats) {
      // Found seats in same row
      selectedSeatIds = bestRowSeats.map((seat) => seat.id);
    } else {
      // Select nearby seats if same row not available
      selectedSeatIds = availableSeats
        .slice(0, numberOfSeats)
        .map((seat) => seat.id);
    }

    setSelectedSeats(selectedSeatIds);
  };

  const handleBookSeats = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }

    try {
      setBooking(true);
      const response = await seatsAPI.bookSeats(selectedSeats);

      setBookingData(response.data.booking);
      setBookingSuccess(true);
      setSelectedSeats([]);

      toast.success("Seats booked successfully!");

      // Refresh seat map
      await fetchSeats();
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to book seats. Please try again.";
      toast.error(errorMessage);
    } finally {
      setBooking(false);
    }
  };

  const handleResetSeats = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all seats? This will cancel all active bookings."
      )
    ) {
      return;
    }

    try {
      await seatsAPI.resetSeats();
      toast.success("All seats have been reset");
      await fetchSeats();
    } catch (error) {
      console.error("Reset error:", error);
      toast.error("Failed to reset seats");
    }
  };

  if (!isAuthenticated()) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seat map...</p>
        </div>
      </div>
    );
  }

  if (bookingSuccess && bookingData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-green-700 mb-6">
            Your seats have been successfully booked.
          </p>

          <div className="bg-white rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">
              Booking Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Reference:</span>
                <span className="font-mono font-semibold">
                  {bookingData.reference}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seats Booked:</span>
                <span className="font-semibold">{selectedSeats.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Date:</span>
                <span className="font-semibold">
                  {new Date(bookingData.bookingDate).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setBookingSuccess(false);
                setBookingData(null);
              }}
              className="btn-primary"
            >
              Book More Seats
            </button>
            <button
              onClick={() => router.push("/bookings")}
              className="btn-secondary"
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Seat Map */}
          <div className="space-y-6">
            <SeatMap
              seats={seats}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              maxSeats={7}
            />
          </div>

          {/* Right Side - Booking Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Book Seats
              </h2>

              {/* Number of Seats Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Seats
                </label>
                <input
                  type="number"
                  value={selectedSeats.length}
                  onChange={(e) =>
                    handleNumberOfSeatsChange(parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="7"
                />
              </div>

              {/* Auto-Selected Seats Display */}
              {selectedSeats.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Book Seats:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map((seatId) => {
                      const seat = Object.values(seats || {})
                        .flat()
                        .find((s) => s.id === seatId);
                      return seat ? (
                        <button
                          key={seatId}
                          className="bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors"
                          onClick={() =>
                            handleSeatSelect(
                              selectedSeats.filter((id) => id !== seatId)
                            )
                          }
                        >
                          {seat.seatNumber}
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Booking Actions */}
              <div className="space-y-4">
                <button
                  onClick={handleBookSeats}
                  disabled={selectedSeats.length === 0 || booking}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {booking ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Booking...
                    </div>
                  ) : (
                    "Book"
                  )}
                </button>

                <button
                  onClick={handleResetSeats}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Reset Booking
                </button>
              </div>
            </div>

            {/* Booking Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Booking Guidelines:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>You can book between 1 and 7 seats at once</li>
                    <li>Priority is given to booking seats in the same row</li>
                    <li>
                      If same-row seats are not available, nearby seats will be
                      selected
                    </li>
                    <li>
                      Selected seats will be reserved for you until booking is
                      confirmed
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
