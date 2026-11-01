import api from "./api";

// Fetch all rooms
export const getRooms = async (params = {}) => {
  const response = await api.get("/rooms", { params });
  return response.data;
};

// Fetch a single room
export const getRoomById = async (roomId) => {
  const response = await api.get(`/rooms/${roomId}`);
  return response.data;
};

// Create a room
export const createRoom = async (roomData) => {
  const response = await api.post("/rooms", roomData);
  return response.data;
};

// Update room information
export const updateRoom = async (roomId, roomData) => {
  const response = await api.patch(`/rooms/${roomId}`, roomData);
  return response.data;
};

// Delete a room
export const deleteRoom = async (roomId) => {
  const response = await api.delete(`/rooms/${roomId}`);
  return response.data;
};

export default {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
