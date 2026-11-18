import axios from 'axios';

// When deployed on Render or Vercel, VITE_API_URL can be set to e.g. "https://campusconnect-backend.onrender.com"
export const API_BASE_URL = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL.replace(/\/$/, '') + '/api')
  : '/api';

export const getCertificateDownloadUrl = (certNum) => `${API_BASE_URL}/certificates/download/${certNum}`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and we had a token, remove it
      if (localStorage.getItem('cc_token')) {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
