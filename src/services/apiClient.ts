import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Replace with your backend's base URL
  timeout: 50000, // Set a timeout (in milliseconds)
  headers: {
    'Content-Type': 'application/json', // Set default headers
  },
});

// Add a request interceptor (e.g., for adding Authorization token)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token'); // Retrieve token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token to request headers if present
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); // Handle request errors
  }
);

// Add a response interceptor (e.g., to handle errors globally)
apiClient.interceptors.response.use(
  (response) => response, // Simply return the response if successful
  (error) => {
    // Handle errors globally (e.g., unauthorized or network issues)
    if (error.response?.status === 401) {
      console.error('Unauthorized - Redirecting to login');
      // Clear the token and redirect to login page if the user is unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/login';  // You can use Vue Router for better navigation
    } else if (error.response?.status === 500) {
      console.error('Internal Server Error - Please try again later');
      // Handle internal server errors (optional)
    } else if (!error.response) {
      console.error('Network Error - Please check your connection');
      // Handle network-related errors (optional)
    }
    return Promise.reject(error);
  }
);

export default apiClient;
