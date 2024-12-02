import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { statisticsService } from '../services/statistics';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function SellerDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [salesStats, setSalesStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    loadDashboardData();
  }, [currentUser, selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [generalStats, topProductsData, salesData] = await Promise.all([
        statisticsService.getSellerStats(currentUser.uid),
        statisticsService.getTopProducts(currentUser.uid),
        statisticsService.getSalesStats(currentUser.uid, selectedPeriod)
      ]);

      setStats(generalStats);
      setTopProducts(topProductsData);
      setSalesStats(salesData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const salesChartData = {
    labels: Object.keys(salesStats?.salesByDay || {}),
    datasets: [
      {
        label: 'Ventes (€)',
        data: Object.values(salesStats?.salesByDay || {}),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      }
    ]
  };

  const conversionChartData = {
    labels: ['Vendus', 'En vente'],
    datasets: [
      {
        data: [
          stats?.totalProducts - stats?.activeListings || 0,
          stats?.activeListings || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(59, 130, 246, 0.5)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)'
        ],
        borderWidth: 1,
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Tableau de bord vendeur</h1>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total des produits</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Vues totales</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalViews}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Likes totaux</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalLikes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Revenu total</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalRevenue}€</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Évolution des ventes</h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="year">12 derniers mois</option>
            </select>
          </div>
          <Line data={salesChartData} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Taux de conversion</h3>
          <div className="h-64">
            <Doughnut data={conversionChartData} />
          </div>
        </div>
      </div>

      {/* Meilleurs produits */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Meilleurs produits</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {topProducts?.topViewed.map((product) => (
            <div key={product.id} className="px-6 py-4">
              <div className="flex items-center">
                <img
                  src={product.images[0]?.url}
                  alt={product.title}
                  className="h-16 w-16 object-cover rounded"
                />
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">{product.title}</h4>
                  <p className="text-sm text-gray-500">{product.views} vues</p>
                </div>
                <div className="ml-auto">
                  <p className="text-sm font-medium text-gray-900">{product.price}€</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
