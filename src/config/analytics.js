import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Configuration Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Fonctions utilitaires pour les événements Analytics
export const trackPageView = (pageName) => {
  logEvent(analytics, 'page_view', {
    page_title: pageName,
    page_location: window.location.href
  });
};

export const trackProductView = (productId, productName) => {
  logEvent(analytics, 'view_item', {
    item_id: productId,
    item_name: productName
  });
};

export const trackProductSearch = (searchTerm) => {
  logEvent(analytics, 'search', {
    search_term: searchTerm
  });
};

export const trackProductLike = (productId) => {
  logEvent(analytics, 'add_to_wishlist', {
    item_id: productId
  });
};

export const trackUserAction = (actionName, additionalParams = {}) => {
  logEvent(analytics, actionName, additionalParams);
};

export default analytics;
