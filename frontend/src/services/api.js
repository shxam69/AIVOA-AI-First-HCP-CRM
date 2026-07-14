import axios from "axios";

// In production the frontend is served by FastAPI on the same origin,
// so a relative /api path works. In local dev the Vite dev server runs
// on a different port, so we fall back to the full localhost URL.
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : "/api");

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
