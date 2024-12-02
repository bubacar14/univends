import { getFirestore, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { app } from '../config/firebase';

const db = getFirestore(app);

export const recommendationsService = {
  // Obtenir les produits similaires basés sur la catégorie et le prix
  getSimilarProducts: async (productId, category, price, limit = 4) => {
    try {
      const productsRef = collection(db, 'products');
      const priceRange = {
        min: price * 0.7, // 30% moins cher
        max: price * 1.3  // 30% plus cher
      };

      const similarQuery = query(
        productsRef,
        where('category', '==', category),
        where('price', '>=', priceRange.min),
        where('price', '<=', priceRange.max),
        where('id', '!=', productId),
        limit(limit)
      );

      const snapshot = await getDocs(similarQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des produits similaires:', error);
      throw error;
    }
  },

  // Obtenir les recommandations personnalisées basées sur l'historique
  getPersonalizedRecommendations: async (userId, limit = 10) => {
    try {
      // Récupérer l'historique des vues et des likes de l'utilisateur
      const userHistoryRef = collection(db, 'userHistory');
      const historyQuery = query(
        userHistoryRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      const historySnapshot = await getDocs(historyQuery);
      const userHistory = historySnapshot.docs.map(doc => doc.data());

      // Analyser les préférences de l'utilisateur
      const preferences = userHistory.reduce((acc, item) => {
        if (item.category) {
          acc.categories[item.category] = (acc.categories[item.category] || 0) + 1;
        }
        if (item.price) {
          acc.totalPrice += item.price;
          acc.priceCount++;
        }
        return acc;
      }, { categories: {}, totalPrice: 0, priceCount: 0 });

      // Trouver la catégorie préférée
      const favoriteCategory = Object.entries(preferences.categories)
        .sort(([,a], [,b]) => b - a)[0]?.[0];

      // Calculer le prix moyen
      const averagePrice = preferences.priceCount > 0
        ? preferences.totalPrice / preferences.priceCount
        : 0;

      // Obtenir les recommandations
      const recommendationsQuery = query(
        collection(db, 'products'),
        where('category', '==', favoriteCategory),
        where('price', '>=', averagePrice * 0.7),
        where('price', '<=', averagePrice * 1.3),
        where('sold', '==', false),
        limit(limit)
      );

      const recommendationsSnapshot = await getDocs(recommendationsQuery);
      return recommendationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error);
      throw error;
    }
  },

  // Obtenir les produits tendance
  getTrendingProducts: async (limit = 10) => {
    try {
      const productsRef = collection(db, 'products');
      const trendingQuery = query(
        productsRef,
        where('sold', '==', false),
        orderBy('views', 'desc'),
        limit(limit)
      );

      const snapshot = await getDocs(trendingQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des produits tendance:', error);
      throw error;
    }
  },

  // Sauvegarder l'interaction de l'utilisateur pour améliorer les recommandations
  saveUserInteraction: async (userId, productId, interactionType) => {
    try {
      const userHistoryRef = collection(db, 'userHistory');
      await addDoc(userHistoryRef, {
        userId,
        productId,
        interactionType, // 'view', 'like', 'purchase'
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'interaction:', error);
      throw error;
    }
  }
};
