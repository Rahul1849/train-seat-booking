import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/api/auth/register", userData),
  login: (credentials) => api.post("/api/auth/login", credentials),
  getProfile: () => api.get("/api/auth/profile"),
};

// Seats API
export const seatsAPI = {
  getAllSeats: () => api.get("/api/seats"),
  bookSeats: (seatIds) => api.post("/api/seats/book", { seatIds }),
  getMyBookings: () => api.get("/api/seats/my-bookings"),
  cancelBooking: (bookingId) => api.delete(`/api/seats/cancel/${bookingId}`),
  resetSeats: () => api.post("/api/seats/reset"),
};

export default api;
