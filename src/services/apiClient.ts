import axios from 'axios';
import router from '@/router';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        console.error('Unauthorized - Redirecting to login');
        localStorage.removeItem('auth_token');
        router.push('/login'); // Use Vue Router
      } else if (status === 403) {
        console.error('Forbidden - You do not have permission');
      } else if (status === 404) {
        console.error('Not Found - The requested resource does not exist');
      } else if (status === 422) {
        console.error('Validation Error - Check your input data');
      } else if (status === 500) {
        console.error('Internal Server Error - Please try again later');
      }
    } else {
      console.error('Network Error - Please check your connection');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
