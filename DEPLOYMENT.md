Overview

This document explains the deployment setup for the Train Seat Booking System. The application is fully deployed and accessible for live demonstration.

Architecture:

Frontend: Next.js → Vercel

Backend: Express.js → Railway

Database: PostgreSQL → Railway

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
CLIENT_URL=https://<frontend-url>.vercel.app

API handles authentication, seat booking, cancellations, and retrieval.

CORS configured for frontend origin.

Deployment URL: https://<backend-url>.railway.app

Step 3: Frontend (Vercel)

Next.js frontend deployed on Vercel.

Environment variable:

NEXT_PUBLIC_API_URL=https://<backend-url>.railway.app

Build command: npm run build

Output directory: .next

Deployment URL: https://<frontend-url>.vercel.app

API integration points to the Railway backend URL to fetch and manage seat data in real-time.

This setup ensures a production-ready, fully functional full-stack application with persistent database, JWT authentication, responsive UI, and real-time seat management.
