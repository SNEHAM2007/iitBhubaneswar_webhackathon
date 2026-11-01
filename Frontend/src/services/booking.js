import api from "./api";

// Turn an English or Hinglish venue request into an editable booking draft
export const parseBookingRequest = async (text) => {
  const response = await api.post(
    "/bookings/parse",
    { text },
    { timeout: 35000 },
  );
  return response.data;
};

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
