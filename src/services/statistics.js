import { getFirestore, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { app } from '../config/firebase';

const db = getFirestore(app);

export const statisticsService = {
  // Obtenir les statistiques générales d'un vendeur
  getSellerStats: async (userId) => {
    try {
      const productsRef = collection(db, 'products');
      const userProductsQuery = query(
        productsRef,
        where('sellerId', '==', userId)
      );
      const productsSnapshot = await getDocs(userProductsQuery);
      
      let totalProducts = 0;
      let totalViews = 0;
      let totalLikes = 0;
      let totalRevenue = 0;
      let activeListings = 0;

      productsSnapshot.forEach((doc) => {
        const product = doc.data();
        totalProducts++;
        totalViews += product.views || 0;
        totalLikes += product.likes?.length || 0;
        totalRevenue += product.sold ? product.price : 0;
        if (!product.sold) activeListings++;
      });

      return {
        totalProducts,
        totalViews,
        totalLikes,
        totalRevenue,
        activeListings,
        conversionRate: totalProducts > 0 ? ((totalProducts - activeListings) / totalProducts) * 100 : 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  // Obtenir les produits les plus performants
  getTopProducts: async (userId) => {
    try {
      const productsRef = collection(db, 'products');
      const topViewedQuery = query(
        productsRef,
        where('sellerId', '==', userId),
        orderBy('views', 'desc'),
        limit(5)
      );
      
      const topLikedQuery = query(
        productsRef,
        where('sellerId', '==', userId),
        orderBy('likes', 'desc'),
        limit(5)
      );

      const [viewedSnapshot, likedSnapshot] = await Promise.all([
        getDocs(topViewedQuery),
        getDocs(topLikedQuery)
      ]);

      const topViewed = viewedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const topLiked = likedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { topViewed, topLiked };
    } catch (error) {
      console.error('Erreur lors de la récupération des meilleurs produits:', error);
      throw error;
    }
  },

  // Obtenir les statistiques de vente par période
  getSalesStats: async (userId, period = 'month') => {
    try {
      const productsRef = collection(db, 'products');
      const startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 1);
      }

      const salesQuery = query(
        productsRef,
        where('sellerId', '==', userId),
        where('soldAt', '>=', startDate),
        where('sold', '==', true)
      );

      const salesSnapshot = await getDocs(salesQuery);
      const sales = salesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Grouper les ventes par jour
      const salesByDay = sales.reduce((acc, sale) => {
        const date = new Date(sale.soldAt.toDate()).toLocaleDateString();
        acc[date] = (acc[date] || 0) + sale.price;
        return acc;
      }, {});

      return {
        totalSales: sales.length,
        totalRevenue: sales.reduce((sum, sale) => sum + sale.price, 0),
        salesByDay
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de vente:', error);
      throw error;
    }
  }
};
