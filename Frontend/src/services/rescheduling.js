import api from "./api";

// Fetch all rescheduling requests
export const getReschedulingRequests = async (params = {}) => {
  const response = await api.get("/rescheduling", { params });
  return response.data;
};

// Fetch one request
export const getReschedulingRequestById = async (requestId) => {
  const response = await api.get(`/rescheduling/${requestId}`);
  return response.data;
};

// Submit a rescheduling request
export const createReschedulingRequest = async (requestData) => {
  const response = await api.post("/rescheduling", requestData);
  return response.data;
};

// Approve a request
export const approveReschedulingRequest = async (requestId) => {
  const response = await api.patch(`/rescheduling/${requestId}/approve`);
  return response.data;
};

// Reject a request
export const rejectReschedulingRequest = async (requestId, reason = "") => {
  const response = await api.patch(`/rescheduling/${requestId}/reject`, {
    reason,
  });
  return response.data;
};

export default {
  getReschedulingRequests,
  getReschedulingRequestById,
  createReschedulingRequest,
  approveReschedulingRequest,
  rejectReschedulingRequest,
};
