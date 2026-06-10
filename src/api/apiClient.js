import axios from 'axios';

// Membuat instance Axios yang dikonfigurasi menggunakan Environment Variable dengan timeout 3 detik
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;

