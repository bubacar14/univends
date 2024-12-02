import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon,
  BookOpenIcon,
  ComputerDesktopIcon,
  HomeIcon,
  MusicalNoteIcon,
  ShoppingBagIcon,
  TruckIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

const categories = [
  { id: 'books', name: 'Livres', icon: BookOpenIcon, color: 'blue' },
  { id: 'electronics', name: 'Électronique', icon: ComputerDesktopIcon, color: 'purple' },
  { id: 'courses', name: 'Cours', icon: AcademicCapIcon, color: 'green' },
  { id: 'furniture', name: 'Mobilier', icon: HomeIcon, color: 'yellow' },
  { id: 'phones', name: 'Téléphones', icon: DevicePhoneMobileIcon, color: 'pink' },
  { id: 'music', name: 'Musique', icon: MusicalNoteIcon, color: 'red' },
  { id: 'clothing', name: 'Vêtements', icon: ShoppingBagIcon, color: 'indigo' },
  { id: 'transport', name: 'Transport', icon: TruckIcon, color: 'orange' },
];

export default function CategoryBrowser() {
  const [popularCategories, setPopularCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredCategory, setFeaturedCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPopularCategories();
    loadFeaturedCategory();
  }, []);

  const loadPopularCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories/popular');
      const data = await response.json();
      
      const enrichedCategories = categories.map(cat => ({
        ...cat,
        count: data.find(d => d.id === cat.id)?.count || 0,
        trending: data.find(d => d.id === cat.id)?.trending || false
      }));
      
      setPopularCategories(enrichedCategories);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories populaires:', error);
      setPopularCategories(categories.map(cat => ({ ...cat, count: 0, trending: false })));
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedCategory = async () => {
    try {
      const response = await fetch('/api/categories/featured');
      const data = await response.json();
      setFeaturedCategory(data);
    } catch (error) {
      console.error('Erreur lors du chargement de la catégorie mise en avant:', error);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/search?category=${categoryId}`);
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200 ring-blue-500/30',
      purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200 ring-purple-500/30',
      green: 'bg-green-100 text-green-700 hover:bg-green-200 ring-green-500/30',
      yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 ring-yellow-500/30',
      pink: 'bg-pink-100 text-pink-700 hover:bg-pink-200 ring-pink-500/30',
      red: 'bg-red-100 text-red-700 hover:bg-red-200 ring-red-500/30',
      indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 ring-indigo-500/30',
      orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200 ring-orange-500/30',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-700 hover:bg-gray-200 ring-gray-500/30';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Featured Category Skeleton */}
        <div className="animate-pulse rounded-xl bg-gray-100 p-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Categories Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex flex-col items-center space-y-2 p-4 rounded-lg bg-gray-100"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Featured Category */}
      {featuredCategory && (
        <div className={`rounded-xl p-6 ${getColorClasses(featuredCategory.color)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium flex items-center gap-2">
                <SparklesIcon className="h-5 w-5" />
                Catégorie en vedette
              </h2>
              <p className="mt-1 text-sm opacity-75">
                {featuredCategory.description}
              </p>
            </div>
            <button
              onClick={() => handleCategoryClick(featuredCategory.id)}
              className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              Explorer
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Parcourir par catégorie
          </h2>
          <button
            onClick={() => navigate('/categories')}
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Voir tout
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all ring-1 ring-inset ${getColorClasses(
                  category.color
                )}`}
              >
                <div className="relative">
                  <Icon className="w-8 h-8" />
                  {category.trending && (
                    <FireIcon className="absolute -top-2 -right-2 w-4 h-4 text-red-500" />
                  )}
                </div>
                <span className="text-sm font-medium">{category.name}</span>
                <span className="text-xs">
                  {category.count.toLocaleString()} annonce{category.count !== 1 ? 's' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-sm text-gray-500">
            ou recherchez un produit spécifique
          </span>
        </div>
      </div>
    </div>
  );
}
