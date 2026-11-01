import api from "./api";

// Login user
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

  const { token, user } = response.data;

  if (!token) {
    throw new Error("Authentication token was not returned by the server");
  }

  localStorage.setItem("token", token);

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return response.data;
};

// Register user
export const registerUser = async (details) => {
  const response = await api.post("/auth/register", details);
  return response.data;
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Get stored user
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

// Check authentication
export const isAuthenticated = () => {
  return Boolean(localStorage.getItem("token"));
};
