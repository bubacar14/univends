import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD4RxjHfgKd_EnrNJXiEnT_XehawoKHPhM",
  authDomain: "univends.firebaseapp.com",
  projectId: "univends",
  storageBucket: "univends.firebasestorage.app",
  messagingSenderId: "284060181928",
  appId: "1:284060181928:web:44dac3ba7fde0e4298a99d",
  measurementId: "G-HH7J4E79HY"
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
