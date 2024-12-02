import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserCircleIcon, PencilIcon } from '@heroicons/react/24/outline';
import SellerDashboard from '../components/SellerDashboard';

export default function Profile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    profileImage: null
  });
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profil' },
    { id: 'dashboard', name: 'Tableau de bord' },
    { id: 'listings', name: 'Mes annonces' },
    { id: 'favorites', name: 'Favoris' }
  ];

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      
      const [profileData, productsData, favoritesData] = await Promise.all([
        api.getProfile(token),
        api.getUserProducts(token),
        api.getFavorites(token)
      ]);

      setProfile(profileData);
      setUserProducts(productsData);
      setFavorites(favoritesData);
      
      setFormData({
        fullName: profileData.fullName || '',
        phone: profileData.phone || ''
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Impossible de charger les données du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profileImage' && files[0]) {
      setFormData(prev => ({
        ...prev,
        profileImage: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('phone', formData.phone);
      if (formData.profileImage) {
        formDataToSend.append('profileImage', formData.profileImage);
      }

      const updatedProfile = await api.updateProfile(formDataToSend, token);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setError('Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête du profil */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            {profile?.profileImage?.url ? (
              <img
                src={profile.profileImage.url}
                alt={profile.fullName}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-16 w-16 text-gray-400" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.fullName || 'Utilisateur'}
              </h1>
              <p className="text-sm text-gray-500">{profile?.email}</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="ml-auto p-2 text-gray-400 hover:text-gray-500"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu de l'onglet */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Formulaire d'édition */}
            {isEditing && (
              <div className="px-4 py-5 sm:px-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Photo de profil
                    </label>
                    <input
                      type="file"
                      name="profileImage"
                      accept="image/*"
                      onChange={handleChange}
                      className="mt-1 block w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="mt-1 input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 input-field"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Statistiques */}
            <div className="border-t border-gray-200">
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 p-4">
                <div className="text-center">
                  <dt className="text-sm font-medium text-gray-500">Annonces</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {userProducts.length}
                  </dd>
                </div>
                <div className="text-center">
                  <dt className="text-sm font-medium text-gray-500">Favoris</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {favorites.length}
                  </dd>
                </div>
                <div className="text-center">
                  <dt className="text-sm font-medium text-gray-500">Date d'inscription</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(profile?.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Annonces de l'utilisateur */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Mes annonces</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userProducts.map(product => (
                  <div
                    key={product._id}
                    className="relative bg-white border rounded-lg overflow-hidden"
                  >
                    <img
                      src={product.images[0]?.url}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {product.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {product.price}€
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Favoris */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Mes favoris</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.map(product => (
                  <div
                    key={product._id}
                    className="relative bg-white border rounded-lg overflow-hidden"
                  >
                    <img
                      src={product.images[0]?.url}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {product.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {product.price}€
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'dashboard' && <SellerDashboard />}
        {activeTab === 'listings' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900">Mes annonces</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userProducts.map(product => (
                <div
                  key={product._id}
                  className="relative bg-white border rounded-lg overflow-hidden"
                >
                  <img
                    src={product.images[0]?.url}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {product.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {product.price}€
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900">Mes favoris</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map(product => (
                <div
                  key={product._id}
                  className="relative bg-white border rounded-lg overflow-hidden"
                >
                  <img
                    src={product.images[0]?.url}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {product.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {product.price}€
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
