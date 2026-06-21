import axios from "axios";

// 🔹 Main API base (student + teacher endpoints)
export const API_BASE =
  (import.meta as any).env.VITE_API_BASE;

export const BACKEND_API =
  (import.meta as any).env.VITE_BACKEND_API || "http://localhost:3000";

// 🔹 Separate base for the standalone QR attendance microservice.
// This is its own deployed service (see qr-attendance-service), not a
// path under the main backend — set VITE_QR_API_BASE accordingly,
// e.g. http://localhost:4001 in development.
export const QR_API_BASE =
  (import.meta as any).env.VITE_QR_API_BASE || "http://localhost:4001";

// 🔹 Reusable Axios client for general APIs (student + teacher + admin)
export const apiClient = axios.create({
  baseURL: BACKEND_API,
  timeout: 10000,
});

// 🔹 Reusable Axios client for the QR microservice. Same token, forwarded
// the same way — the QR service has no auth of its own, it just passes
// the Authorization header straight through to the main backend.
export const qrClient = axios.create({
  baseURL: QR_API_BASE,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

qrClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
