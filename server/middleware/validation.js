const { body, validationResult } = require("express-validator");

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body("username")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  handleValidationErrors,
];

// User login validation
const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Seat booking validation
const validateBooking = [
  body("seatIds")
    .isArray({ min: 1, max: 7 })
    .withMessage("Must select between 1 and 7 seats"),
  body("seatIds.*")
    .isInt({ min: 1 })
    .withMessage("All seat IDs must be valid integers"),
  handleValidationErrors,
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateBooking,
  handleValidationErrors,
};



