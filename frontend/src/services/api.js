import config from '../config';

const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 60000, // 60 seconds for AI processing
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
  category = '',
  search = '',
  threat_level = '',
  sort_by = 'date'
} = {}) => {
  const params = { page, limit };
  if (category) params.category = category;  // CRITICAL: Pass category to API
  if (search) params.search = search;
  if (threat_level) params.threat_level = threat_level;
  if (sort_by) params.sort_by = sort_by;

  const { data } = await api.get('/api/articles/', { params });
  return data;
};

export const getAdminArticles = async ({
  page = 1,
  limit = 20,
  category = '',
  status = '',
  sort_by = 'date',
  search = ''
} = {}) => {
  const params = { page, limit, sort_by };
  if (category) params.category = category;
  if (status) params.status = status;
  if (search) params.search = search;

  const { data } = await api.get('/api/articles/admin/list', { params });
  return data;
};

export const getArticle = async (slug) => {
  const { data } = await api.get(`/api/articles/${slug}`);
  return data;
};

export const updateArticle = async (id, updates) => {
  const { data } = await api.put(`/api/articles/${id}`, updates);
  return data;
};

export const publishArticle = async (id) => {
  const { data } = await api.post(`/api/articles/${id}/publish`);
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