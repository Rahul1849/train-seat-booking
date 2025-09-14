const express = require("express");
const pool = require("../database/connection");
const { authenticateToken } = require("../middleware/auth");
const { validateBooking } = require("../middleware/validation");

const router = express.Router();

// Get all seats with availability status
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.seat_number,
        s.row_number,
        s.seat_position,
        s.is_available,
        CASE 
          WHEN b.id IS NOT NULL THEN b.booking_reference
          ELSE NULL
        END as booking_reference
      FROM seats s
      LEFT JOIN bookings b ON s.id = ANY(b.seat_ids) AND b.status = 'active'
      ORDER BY s.row_number, s.seat_position
    `);

    // Group seats by row for easier frontend handling
    const seatsByRow = {};
    result.rows.forEach((seat) => {
      if (!seatsByRow[seat.row_number]) {
        seatsByRow[seat.row_number] = [];
      }
      seatsByRow[seat.row_number].push({
        id: seat.id,
        seatNumber: seat.seat_number,
        rowNumber: seat.row_number,
        seatPosition: seat.seat_position,
        isAvailable: seat.is_available && !seat.booking_reference,
        bookingReference: seat.booking_reference,
      });
    });

    res.json({ seats: seatsByRow });
  } catch (error) {
    console.error("Error fetching seats:", error);
    res.status(500).json({ error: "Failed to fetch seats" });
  }
});

// Book seats
router.post("/book", authenticateToken, validateBooking, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { seatIds } = req.body;
    const userId = req.user.id;

    // Validate seat IDs are within valid range (1-80)
    const validSeatIds = seatIds.filter((id) => id >= 1 && id <= 80);
    if (validSeatIds.length !== seatIds.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Invalid seat IDs provided" });
    }

    // Check if all seats are available
    const seatCheckResult = await client.query(
      `
      SELECT s.id, s.seat_number, s.is_available, b.id as booking_id
      FROM seats s
      LEFT JOIN bookings b ON s.id = ANY(b.seat_ids) AND b.status = 'active'
      WHERE s.id = ANY($1)
    `,
      [seatIds]
    );

    const unavailableSeats = seatCheckResult.rows.filter(
      (seat) => !seat.is_available || seat.booking_id
    );

    if (unavailableSeats.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Some seats are not available",
        unavailableSeats: unavailableSeats.map((s) => s.seat_number),
      });
    }

    // Generate booking reference
    const bookingReference =
      "TB" + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

    // Create booking
    const bookingResult = await client.query(
      `
      INSERT INTO bookings (user_id, seat_ids, booking_reference)
      VALUES ($1, $2, $3)
      RETURNING id, booking_reference, booking_date
    `,
      [userId, seatIds, bookingReference]
    );

    // Update seat availability
    await client.query(
      `
      UPDATE seats 
      SET is_available = false 
      WHERE id = ANY($1)
    `,
      [seatIds]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Seats booked successfully",
      booking: {
        id: bookingResult.rows[0].id,
        reference: bookingResult.rows[0].booking_reference,
        seatIds: seatIds,
        bookingDate: bookingResult.rows[0].booking_date,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Booking error:", error);
    res.status(500).json({ error: "Failed to book seats" });
  } finally {
    client.release();
  }
});

// Get user's bookings
router.get("/my-bookings", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        b.id,
        b.booking_reference,
        b.booking_date,
        b.status,
        array_agg(s.seat_number ORDER BY s.seat_position) as seat_numbers
      FROM bookings b
      JOIN unnest(b.seat_ids) WITH ORDINALITY AS seat_id(id, ord) ON true
      JOIN seats s ON s.id = seat_id.id
      WHERE b.user_id = $1
      GROUP BY b.id, b.booking_reference, b.booking_date, b.status
      ORDER BY b.booking_date DESC
    `,
      [req.user.id]
    );

    res.json({ bookings: result.rows });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Cancel booking
router.delete("/cancel/:bookingId", authenticateToken, async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { bookingId } = req.params;
    const userId = req.user.id;

    // Get booking details
    const bookingResult = await client.query(
      `
      SELECT id, seat_ids, status 
      FROM bookings 
      WHERE id = $1 AND user_id = $2
    `,
      [bookingId, userId]
    );

    if (bookingResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== "active") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Booking is already cancelled" });
    }

    // Update booking status
    await client.query(
      `
      UPDATE bookings 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `,
      [bookingId]
    );

    // Make seats available again
    await client.query(
      `
      UPDATE seats 
      SET is_available = true 
      WHERE id = ANY($1)
    `,
      [booking.seat_ids]
    );

    await client.query("COMMIT");

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Cancel booking error:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  } finally {
    client.release();
  }
});

// Reset all seats (admin function - for testing)
router.post("/reset", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Cancel all active bookings
    await client.query(`
      UPDATE bookings 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'active'
    `);

    // Make all seats available
    await client.query(`
      UPDATE seats 
      SET is_available = true
    `);

    await client.query("COMMIT");

    res.json({ message: "All seats have been reset" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Reset error:", error);
    res.status(500).json({ error: "Failed to reset seats" });
  } finally {
    client.release();
  }
});

module.exports = router;
