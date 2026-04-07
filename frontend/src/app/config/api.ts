// WARNING: Do NOT change the DEV address to Render. Your Render server cannot connect to MongoDB.
// To test the admin panel locally, you MUST use the local backend.
export const BACKEND_URL = import.meta.env.DEV
  ? 'http://localhost:5000'
  : (import.meta.env.VITE_API_BASE_URL || 'https://gritek-solutions.onrender.com');
export const API_BASE_URL = `${BACKEND_URL}/api`;
