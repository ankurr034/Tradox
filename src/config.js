import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '' : `http://${window.location.hostname}:8000`);

// Centralized Axios Configuration
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export { API_BASE_URL };

