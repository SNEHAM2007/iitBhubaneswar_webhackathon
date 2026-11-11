
import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");
const isLocalhost = !rawApiUrl || rawApiUrl.includes("localhost") || rawApiUrl.includes("127.0.0.1");

const apiBaseUrl = import.meta.env.PROD
  ? (!isLocalhost && rawApiUrl
      ? (rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`)
      : "https://iitbhubaneswar-webhackathon.onrender.com/api")
  : (rawApiUrl
      ? (rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`)
      : "http://localhost:5000/api");

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Attach JWT token to authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle common API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
  }
);

export default api;
