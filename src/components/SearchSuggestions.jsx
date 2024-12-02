import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function SearchSuggestions({ onSearch }) {
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSearchData();
    loadRecentSearches();
  }, []);

  const loadSearchData = async () => {
    try {
      setLoading(true);
      const [trendingResponse, tagsResponse] = await Promise.all([
        fetch('/api/searches/trending'),
        fetch('/api/tags/popular')
      ]);
      
      const trendingData = await trendingResponse.json();
      const tagsData = await tagsResponse.json();
      
      setTrendingSearches(trendingData);
      setPopularTags(tagsData);
    } catch (error) {
      console.error('Erreur lors du chargement des suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentSearches = () => {
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(searches.slice(0, 5));
  };

  const handleSearch = (term) => {
    // Sauvegarder dans l'historique récent
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const newSearches = [term, ...searches.filter(s => s !== term)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
    
    // Déclencher la recherche
    onSearch(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const removeRecentSearch = (term, e) => {
    e.stopPropagation();
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const newSearches = searches.filter(s => s !== term);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
    setRecentSearches(newSearches);
  };

  const getTagColor = (index) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tags populaires */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
          <ArrowTrendingUpIcon className="h-4 w-4" />
          Tags populaires
        </h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag, index) => (
            <button
              key={tag.id}
              onClick={() => handleSearch(tag.name)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(
                index
              )} hover:opacity-90 transition-opacity flex items-center gap-1`}
            >
              {tag.name}
              {tag.count > 0 && (
                <span className="text-xs opacity-75">({tag.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Recherches récentes */}
      {recentSearches.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <ClockIcon className="h-4 w-4" />
            Recherches récentes
          </h3>
          <div className="space-y-2">
            {recentSearches.map((search, index) => (
              <div
                key={index}
                onClick={() => handleSearch(search)}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{search}</span>
                </div>
                <button
                  onClick={(e) => removeRecentSearch(search, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recherches tendance */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
          <ArrowTrendingUpIcon className="h-4 w-4" />
          Tendances
        </h3>
        <div className="space-y-2">
          {trendingSearches.map((search, index) => (
            <div
              key={search.id}
              onClick={() => handleSearch(search.term)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <span className="font-medium text-gray-400 w-4 text-center">
                {index + 1}
              </span>
              <div className="flex-1">
                <span className="text-sm text-gray-700">{search.term}</span>
                {search.growth > 0 && (
                  <span className="ml-2 text-xs text-green-600">
                    +{search.growth}%
                  </span>
                )}
              </div>
              {search.isNew && (
                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                  Nouveau
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
