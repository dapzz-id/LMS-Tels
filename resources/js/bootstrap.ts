import axios from 'axios';

// Setup axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_URL,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  }
});

// Set CSRF token
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) {
  axiosInstance.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

window.axios = axiosInstance;