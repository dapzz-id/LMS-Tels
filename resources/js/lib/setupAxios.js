// axios.ts / setupAxios.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_APP_URL || 'http://localhost:8000/'

axios.defaults.withCredentials = true;
axios.defaults.baseURL = BASE_URL; // sesuaikan

// Get CSRF token from meta tag
const token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    
}

export default axios;
