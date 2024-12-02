import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import { api } from '../services/api';
import { 
  trackPageView, 
  trackProductView, 
  trackProductSearch 
} from '../config/analytics';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    sortBy: 'recent'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Tracker la vue de page
    trackPageView('Home');
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.products.getAll();
      setProducts(response);
      
      // Tracker la recherche si un terme est utilisé
      if (searchTerm) {
        trackProductSearch(searchTerm);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
      setError('Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  const handleProductView = (productId, productName) => {
    // Tracker la vue d'un produit
    trackProductView(productId, productName);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchBar 
        onSearch={handleSearch} 
        onFilterToggle={() => setIsFilterOpen(true)} 
      />
      
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div
                key={product._id}
                onClick={() => handleProductView(product._id, product.title)}
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
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {product.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-lg font-medium text-primary-600">
                      {product.price}€
                    </p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {product.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
