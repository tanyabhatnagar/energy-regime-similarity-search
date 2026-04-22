import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  checkHealth: async () => {
    const response = await client.get('/health');
    return response.data;
  },

  getSystemStats: async () => {
    const response = await client.get('/data/stats');
    return response.data;
  },

  register: async (username, password) => {
    const response = await client.post('/auth/register', { username, password });
    return response.data;
  },

  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const response = await client.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  },

  loadData: async (useDefault = true) => {
    const response = await client.post('/data/load', { use_default: useDefault });
    return response.data;
  },
  
  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await client.post('/data/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  preprocessData: async () => {
    const response = await client.post('/data/preprocess');
    return response.data;
  },

  trainModel: async () => {
    const response = await client.post('/model/train');
    return response.data;
  },

  getRegimes: async () => {
    const response = await client.get('/model/regimes');
    return response.data;
  },

  searchSimilar: async (startTime, endTime, topK = 5) => {
    const response = await client.post('/similarity/search', {
      start_time: startTime,
      end_time: endTime,
      top_k: topK
    });
    return response.data;
  },

  getSearchHistory: async () => {
    const response = await client.get('/similarity/history');
    return response.data;
  },

  getWindow: async (id) => {
    const response = await client.get(`/windows/${id}`);
    return response.data;
  },

  getTransitionMatrix: async () => {
    const response = await client.get('/model/transition-matrix');
    return response.data;
  }
};

export default api;
