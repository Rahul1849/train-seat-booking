/**
 * Mock API for reliable functionality
 * Provides simulated backend responses for development and demonstration
 * Uses in-memory storage for data persistence during session
 */

// In-memory storage for mock data
let allBookings = [];
let bookedSeats = new Set();

/**
 * Authentication API mock
 * Simulates user registration and login with JWT tokens
 */
export const authAPI = {
  register: (userData) =>
    new Promise((resolve) => {
      console.log("Register mock call:", userData);
      setTimeout(() => {
        resolve({
          data: {
            user: { id: 1, username: userData.username, email: userData.email },
            token: "fake-jwt-token",
          },
        });
      }, 500);
    }),

  login: (credentials) =>
    new Promise((resolve) => {
      console.log("Login mock call:", credentials);
      setTimeout(() => {
        resolve({
          data: {
            user: { id: 1, username: "Demo User", email: credentials.email },
            token: "fake-jwt-token",
          },
        });
      }, 500);
    }),
};

/**
 * Seats API mock
 * Handles seat management, booking, and availability
 */
export const seatsAPI = {
  /**
   * Generates 80 seats in 12 rows (11 rows of 7 seats + 1 row of 3 seats)
   * @returns {Promise} - Resolves with seat data structure
   */
  getAllSeats: () =>
    new Promise((resolve) => {
      const seatsPerRow = 7;
      const totalSeats = 80;
      let seatNumber = 1;
      const totalRows = Math.ceil(totalSeats / seatsPerRow);
      const seats = {};

      // Generate seats row by row
      for (let r = 1; r <= totalRows; r++) {
        seats[r] = [];
        for (let c = 1; c <= seatsPerRow && seatNumber <= totalSeats; c++) {
          seats[r].push({
            id: `S${seatNumber}`,
            seatNumber: seatNumber,
            rowNumber: r,
            seatPosition: c,
            isAvailable: !bookedSeats.has(`S${seatNumber}`),
          });
          seatNumber++;
        }
      }
      setTimeout(() => resolve({ data: { seats } }), 300);
    }),

  /**
   * Books selected seats and creates booking record
   * @param {Array} seatIds - Array of seat IDs to book
   * @returns {Promise} - Resolves with booking confirmation
   */
  bookSeats: (seatIds) =>
    new Promise((resolve) => {
      // Mark seats as booked in memory
      seatIds.forEach((id) => bookedSeats.add(id));

      // Create booking record
      const booking = {
        id: "B" + Math.floor(Math.random() * 10000),
        booking_reference: "BK" + Math.floor(Math.random() * 10000),
        seat_numbers: seatIds,
        booking_date: new Date(),
        status: "active",
      };

      allBookings.push(booking);
      console.log("Booked seats:", seatIds);

      setTimeout(() => resolve({ data: { booking } }), 300);
    }),

  getMyBookings: () =>
    new Promise((resolve) => {
      setTimeout(() => resolve({ data: { bookings: allBookings } }), 300);
    }),

  cancelBooking: (bookingId) =>
    new Promise((resolve) => {
      const booking = allBookings.find((b) => b.id === bookingId);
      if (booking) {
        booking.status = "cancelled";
        booking.seat_numbers.forEach((id) => bookedSeats.delete(id));
      }
      setTimeout(() => resolve({ data: { success: true } }), 300);
    }),

  resetSeats: () =>
    new Promise((resolve) => {
      allBookings = [];
      bookedSeats.clear();
      setTimeout(() => resolve({ data: { success: true } }), 300);
    }),
};
