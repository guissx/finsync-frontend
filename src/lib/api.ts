import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://express-backend-sd.vercel.app/', 
  withCredentials: true,
  timeout: 10000
});

// Add error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    return Promise.reject(error);
  }
);