import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8090/api',
  timeout: 0, // Disable client-side timeout to support large file transfers (upload/download) and long AI recap processing
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
