import axios from "axios";

// In production the Vite build will replace VITE_API_BASE_URL with the
// actual backend URL set in the Render static site environment variables.
// Falls back to localhost for local development.
const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;