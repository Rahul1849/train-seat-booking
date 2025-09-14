const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const seatRoutes = require("./routes/seats");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("CORS Request from origin:", origin);
      console.log("NODE_ENV:", process.env.NODE_ENV);

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        console.log("No origin, allowing request");
        return callback(null, true);
      }

      // In production, allow all Vercel domains
      if (process.env.NODE_ENV === "production") {
        console.log("Production environment detected");

        // Allow any vercel.app domain
        if (origin.includes(".vercel.app")) {
          console.log("Vercel domain detected, allowing:", origin);
          return callback(null, true);
        }

        // Allow specific domains from environment variable
        const allowedDomains = process.env.ALLOWED_ORIGINS
          ? process.env.ALLOWED_ORIGINS.split(",")
          : [];

        if (allowedDomains.includes(origin)) {
          console.log("Environment domain matched, allowing:", origin);
          return callback(null, true);
        }

        // Also allow the specific domain you mentioned
        if (origin === "https://train-seat-booking-liard.vercel.app") {
          console.log("Specific domain matched, allowing:", origin);
          return callback(null, true);
        }

        console.log("Origin not allowed:", origin);
      } else {
        // In development, allow localhost
        if (origin === "http://localhost:3000") {
          console.log("Localhost allowed in development");
          return callback(null, true);
        }
        console.log("Development origin not allowed:", origin);
      }

      console.log("CORS Error: Origin not allowed:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/seats", seatRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  // Don't leak error details in production
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : error.message;

  res.status(error.status || 500).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
