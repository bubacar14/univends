import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { recommendationsService } from '../services/recommendations';

export default function ProductRecommendations({ currentProductId, category, price }) {
  const { currentUser } = useAuth();
  const [recommendations, setRecommendations] = useState({
    similar: [],
    personalized: [],
    trending: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [currentProductId, currentUser]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const [similar, personalized, trending] = await Promise.all([
        recommendationsService.getSimilarProducts(currentProductId, category, price),
        currentUser ? recommendationsService.getPersonalizedRecommendations(currentUser.uid) : [],
        recommendationsService.getTrendingProducts()
      ]);

      setRecommendations({
        similar,
        personalized,
        trending
      });
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const RecommendationSection = ({ title, products }) => (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-w-3 aspect-h-2">
              <img
                src={product.images[0]?.url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {product.title}
              </h4>
              <p className="mt-1 text-sm font-medium text-primary-600">
                {product.price}€
              </p>
              <div className="mt-2 flex items-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                  {product.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {recommendations.similar.length > 0 && (
        <RecommendationSection
          title="Produits similaires"
          products={recommendations.similar}
        />
      )}

      {currentUser && recommendations.personalized.length > 0 && (
        <RecommendationSection
          title="Recommandé pour vous"
          products={recommendations.personalized}
        />
      )}

      {recommendations.trending.length > 0 && (
        <RecommendationSection
          title="Produits tendance"
          products={recommendations.trending}
        />
      )}
    </div>
  );
}
