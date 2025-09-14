-- Create database (run this manually)
-- CREATE DATABASE train_booking;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seats table (80 seats: 11 rows of 7 seats + 1 row of 3 seats)
CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    seat_number VARCHAR(10) UNIQUE NOT NULL,
    row_number INTEGER NOT NULL,
    seat_position INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    seat_ids INTEGER[] NOT NULL,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert 80 seats (numbered 1-80)
INSERT INTO seats (seat_number, row_number, seat_position) VALUES
-- Row 1 (7 seats: 1-7)
('1', 1, 1), ('2', 1, 2), ('3', 1, 3), ('4', 1, 4), ('5', 1, 5), ('6', 1, 6), ('7', 1, 7),
-- Row 2 (7 seats: 8-14)
('8', 2, 1), ('9', 2, 2), ('10', 2, 3), ('11', 2, 4), ('12', 2, 5), ('13', 2, 6), ('14', 2, 7),
-- Row 3 (7 seats: 15-21)
('15', 3, 1), ('16', 3, 2), ('17', 3, 3), ('18', 3, 4), ('19', 3, 5), ('20', 3, 6), ('21', 3, 7),
-- Row 4 (7 seats: 22-28)
('22', 4, 1), ('23', 4, 2), ('24', 4, 3), ('25', 4, 4), ('26', 4, 5), ('27', 4, 6), ('28', 4, 7),
-- Row 5 (7 seats: 29-35)
('29', 5, 1), ('30', 5, 2), ('31', 5, 3), ('32', 5, 4), ('33', 5, 5), ('34', 5, 6), ('35', 5, 7),
-- Row 6 (7 seats: 36-42)
('36', 6, 1), ('37', 6, 2), ('38', 6, 3), ('39', 6, 4), ('40', 6, 5), ('41', 6, 6), ('42', 6, 7),
-- Row 7 (7 seats: 43-49)
('43', 7, 1), ('44', 7, 2), ('45', 7, 3), ('46', 7, 4), ('47', 7, 5), ('48', 7, 6), ('49', 7, 7),
-- Row 8 (7 seats: 50-56)
('50', 8, 1), ('51', 8, 2), ('52', 8, 3), ('53', 8, 4), ('54', 8, 5), ('55', 8, 6), ('56', 8, 7),
-- Row 9 (7 seats: 57-63)
('57', 9, 1), ('58', 9, 2), ('59', 9, 3), ('60', 9, 4), ('61', 9, 5), ('62', 9, 6), ('63', 9, 7),
-- Row 10 (7 seats: 64-70)
('64', 10, 1), ('65', 10, 2), ('66', 10, 3), ('67', 10, 4), ('68', 10, 5), ('69', 10, 6), ('70', 10, 7),
-- Row 11 (7 seats: 71-77)
('71', 11, 1), ('72', 11, 2), ('73', 11, 3), ('74', 11, 4), ('75', 11, 5), ('76', 11, 6), ('77', 11, 7),
-- Row 12 (3 seats: 78-80)
('78', 12, 1), ('79', 12, 2), ('80', 12, 3);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seats_row_number ON seats(row_number);
CREATE INDEX IF NOT EXISTS idx_seats_is_available ON seats(is_available);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

