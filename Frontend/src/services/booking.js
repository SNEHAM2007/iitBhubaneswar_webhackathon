import api from "./api";

// Submit a new room booking request
export const createBooking = async (bookingData) => {
  const response = await api.post("/bookings", bookingData);
  return response.data;
};

// Get all booking requests
export const getBookings = async () => {
  const response = await api.get("/bookings");
  return response.data;
};

// Get a booking by ID
export const getBookingById = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};
