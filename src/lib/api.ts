import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Check for token in localStorage (client-side) or environment variable (fallback)
    let token: string | null = null;

    if (typeof window !== 'undefined') {
      token = localStorage.getItem('api_token');
    }

    // Fallback to env var if not in local storage or if we are server-side (though this specific interceptor logic is mostly client-centric)
    if (!token) {
      token = process.env.NEXT_PUBLIC_API_TOKEN || null;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('api_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
