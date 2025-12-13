import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Articles
export const getArticles = async (params = {}) => {
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

// Stats
export const getDashboardStats = async () => {
  const { data } = await api.get('/api/articles/stats/dashboard');
  return data;
};

export default api;