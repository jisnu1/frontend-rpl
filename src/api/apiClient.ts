import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 0, // Disable client-side timeout to support large file transfers (upload/download) and long AI recap processing
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
