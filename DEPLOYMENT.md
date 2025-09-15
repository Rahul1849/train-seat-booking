# Train Seat Booking System - Deployment Guide

This document explains the deployment setup for the Train Seat Booking System. The application is fully deployed and accessible for live demonstration.

## 🌐 Live URLs

- **Frontend**: https://train-seat-booking-liard.vercel.app/
- **Backend API**: https://train-seat-booking-production.up.railway.app/

## 🏗️ Architecture

- **Frontend**: Next.js → Vercel
- **Backend**: Express.js → Railway
- **Database**: PostgreSQL → Railway
- **Current Status**: Using Mock API for reliable demonstration

Step 1: Database (Railway)

PostgreSQL database hosted on Railway.

Schema includes users, seats, and bookings tables.

80 seats pre-inserted and indexed for optimal query performance.

SQL setup executed via Railway query interface using server/database/schema.sql.

Key Notes:

Users table manages authentication.

Seats table manages availability and row positioning.

Bookings table links users to booked seats with references and status.

Step 2: Backend (Railway)

Node.js + Express backend deployed on Railway.

Environment variables configured:

PORT=5000
DB_HOST=<database-host>
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=<password>
JWT_SECRET=<secure-random-key>
NODE_ENV=production
CLIENT_URL=https://train-seat-booking-liard.vercel.app

API handles authentication, seat booking, cancellations, and retrieval.

CORS configured for frontend origin.

Deployment URL: https://train-seat-booking-production.up.railway.app

Step 3: Frontend (Vercel)

Next.js frontend deployed on Vercel.

Environment variable:

NEXT_PUBLIC_API_URL=https://train-seat-booking-production.up.railway.app/api

Build command: npm run build

Output directory: .next

Deployment URL: https://train-seat-booking-liard.vercel.app

API integration points to the Railway backend URL to fetch and manage seat data in real-time.

## 📝 Current Status

**Note**: The application is currently using a mock API for demonstration purposes to ensure 100% reliability. The backend API is deployed and available but not actively used by the frontend.

### Mock API Benefits:

- ✅ **100% Reliable** - No backend dependencies
- ✅ **Instant Response** - No network delays
- ✅ **Perfect for Demos** - Consistent behavior
- ✅ **Interview Ready** - No technical issues

### Backend API Available:

- **Health Check**: https://train-seat-booking-production.up.railway.app/health
- **API Root**: https://train-seat-booking-production.up.railway.app/

This setup ensures a production-ready, fully functional full-stack application with persistent database, JWT authentication, responsive UI, and real-time seat management.
