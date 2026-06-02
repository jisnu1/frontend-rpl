import axios from 'axios';

// Membuat instance Axios yang murni dikonfigurasi menggunakan Environment Variable
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
