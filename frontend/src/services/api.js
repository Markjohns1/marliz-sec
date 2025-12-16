import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to inject API Key
api.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('admin_api_key');
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});

// Articles
export const getArticles = async ({
  page = 1,
  limit = 12,
  search = '',
  threat_level = '',
  sort_by = 'date'
} = {}) => {
  const params = { page, limit };
  if (search) params.search = search;
  if (threat_level) params.threat_level = threat_level;
  if (sort_by) params.sort_by = sort_by;

  const { data } = await api.get('/api/articles/', { params });
  return data;
};

export const getArticle = async (slug) => {
  const { data } = await api.get(`/api/articles/${slug}`);
  return data;
};

export const getRelatedArticles = async (articleId) => {
  const { data } = await api.get(`/api/articles/related/${articleId}`);
  return data;
};

// Categories
export const getCategories = async () => {
  const { data } = await api.get('/api/categories/');
  return data;
};

export const getCategory = async (slug) => {
  const { data } = await api.get(`/api/categories/${slug}`);
  return data;
};

// Subscribers
export const subscribe = async (email) => {
  const { data } = await api.post('/api/subscribers/', { email });
  return data;
};

// Admin
export const login = async (key) => {
  // We verified the key by trying to fetch stats. 
  // If it fails (401), the key is invalid.
  localStorage.setItem('admin_api_key', key);
  try {
    const { data } = await api.get('/api/articles/stats/dashboard');
    return true;
  } catch (error) {
    localStorage.removeItem('admin_api_key');
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('admin_api_key');
};

export const triggerNewsFetch = async () => {
  const { data } = await api.post('/api/admin/fetch-news');
  return data;
};

export const triggerSimplify = async () => {
  const { data } = await api.post('/api/admin/simplify');
  return data;
};

// Stats
export const getDashboardStats = async () => {
  const { data } = await api.get('/api/articles/stats/dashboard');
  return data;
};

export default api;