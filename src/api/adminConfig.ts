import axios from "axios";
import { BACKEND_API } from "./config";

const client = axios.create({
  baseURL: BACKEND_API,
  timeout: 5000,
});

// Attach token automatically
client.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export { client };