import axios from 'axios';

const api = axios.create({
  baseURL: '', // Relative paths for Next.js same-origin API routes
  withCredentials: true,
});

export default api;
