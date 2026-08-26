import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

const apiService = {
  // Chat
  sendMessage: (message, conversationId) => api.post('/chat', { message, conversation_id: conversationId }),
  getConversations: () => api.get('/conversations'),
  getConversation: (id) => api.get(`/conversations/${id}`),
  deleteConversation: (id) => api.delete(`/conversations/${id}`),
  
  // Auth
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  getMe: () => api.get('/auth/me'),
  
  // Feedback
  submitFeedback: (messageId, rating, comment) => api.post('/feedback', { message_id: messageId, rating, comment }),
  getFeedback: () => api.get('/admin/feedback'),
  
  // Documents
  getDocuments: () => api.get('/admin/documents'),
  uploadDocument: (formData) => api.post('/admin/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteDocument: (id) => api.delete(`/admin/documents/${id}`),
  
  // Analytics
  getAnalytics: () => api.get('/admin/analytics'),
  getUnanswered: () => api.get('/admin/unanswered'),
};

export default apiService;
