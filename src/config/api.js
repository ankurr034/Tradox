import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:8000`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default API_BASE_URL;
