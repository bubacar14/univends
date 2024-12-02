import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return null;
};

const createAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Fonction utilitaire pour les requêtes
const fetchWithAuth = async (endpoint, options = {}) => {
  const headers = await createAuthHeaders();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Une erreur est survenue');
  }

  return response.json();
};

// API Products
export const productsApi = {
  getAll: () => fetchWithAuth('/products'),
  create: (productData) => fetchWithAuth('/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  }),
  update: (id, productData) => fetchWithAuth(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  }),
  delete: (id) => fetchWithAuth(`/products/${id}`, {
    method: 'DELETE'
  }),
  like: (id) => fetchWithAuth(`/products/${id}/like`, {
    method: 'POST'
  })
};

// API User Profile
export const userApi = {
  getProfile: () => fetchWithAuth('/users/profile'),
  updateProfile: (profileData) => fetchWithAuth('/users/profile', {
    method: 'POST',
    body: productData
  }),
  getFavorites: () => fetchWithAuth('/users/favorites'),
  getUserProducts: () => fetchWithAuth('/users/products')
};

// API Conversations
export const conversationsApi = {
  getAll: () => fetchWithAuth('/conversations'),
  create: (conversationData) => fetchWithAuth('/conversations', {
    method: 'POST',
    body: JSON.stringify(conversationData)
  }),
  getMessages: (conversationId) => fetchWithAuth(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, messageData) => fetchWithAuth(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify(messageData)
  })
};
