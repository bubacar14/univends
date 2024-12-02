import { useState, useEffect } from 'react';
import { XMarkIcon, BellIcon, BellSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function SavedSearches() {
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadSavedSearches();
    }
  }, [currentUser]);

  const loadSavedSearches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${currentUser.uid}/saved-searches`);
      const data = await response.json();
      setSavedSearches(data);
    } catch (error) {
      console.error('Erreur lors du chargement des recherches sauvegardées:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async (searchId) => {
    try {
      const search = savedSearches.find((s) => s.id === searchId);
      const response = await fetch(`/api/saved-searches/${searchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationsEnabled: !search.notificationsEnabled,
        }),
      });

      if (response.ok) {
        setSavedSearches((prev) =>
          prev.map((s) =>
            s.id === searchId
              ? { ...s, notificationsEnabled: !s.notificationsEnabled }
              : s
          )
        );
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notifications:', error);
    }
  };

  const deleteSearch = async (searchId) => {
    try {
      const response = await fetch(`/api/saved-searches/${searchId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedSearches((prev) => prev.filter((s) => s.id !== searchId));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la recherche:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!savedSearches.length) {
    return (
      <div className="text-center py-12">
        <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Aucune recherche sauvegardée
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Commencez par sauvegarder une recherche pour recevoir des notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Recherches sauvegardées
      </h3>

      <div className="space-y-4">
        {savedSearches.map((search) => (
          <div
            key={search.id}
            className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h4 className="text-sm font-medium text-gray-900">
                  {search.name || 'Recherche sans nom'}
                </h4>
                {search.newResults > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {search.newResults} nouveau{search.newResults > 1 ? 'x' : ''}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {Object.entries(search.criteria)
                  .filter(([_, value]) => value)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(' • ')}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => toggleNotifications(search.id)}
                className="text-gray-400 hover:text-gray-500"
              >
                {search.notificationsEnabled ? (
                  <BellIcon className="h-5 w-5" />
                ) : (
                  <BellSlashIcon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => deleteSearch(search.id)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
