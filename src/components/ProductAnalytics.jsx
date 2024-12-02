import { useState, useEffect } from 'react';
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
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

// Enregistrer les composants Chart.js nécessaires
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

export default function ProductAnalytics({ productId }) {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [productId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/products/${productId}/analytics?range=${timeRange}`
      );
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Erreur lors du chargement des analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      name: 'Vues totales',
      value: analytics?.totalViews || 0,
      change: analytics?.viewsChange || 0,
      icon: EyeIcon,
    },
    {
      name: 'Favoris',
      value: analytics?.totalFavorites || 0,
      change: analytics?.favoritesChange || 0,
      icon: HeartIcon,
    },
    {
      name: 'Messages reçus',
      value: analytics?.totalMessages || 0,
      change: analytics?.messagesChange || 0,
      icon: ChatBubbleLeftIcon,
    },
    {
      name: 'Taux de conversion',
      value: `${analytics?.conversionRate || 0}%`,
      change: analytics?.conversionChange || 0,
      icon: ArrowTrendingUpIcon,
    },
  ];

  const viewsChartData = {
    labels: analytics?.viewsData?.labels || [],
    datasets: [
      {
        label: 'Vues',
        data: analytics?.viewsData?.values || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  };

  const interactionsChartData = {
    labels: ['Messages', 'Favoris', 'Partages'],
    datasets: [
      {
        data: [
          analytics?.totalMessages || 0,
          analytics?.totalFavorites || 0,
          analytics?.totalShares || 0,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
      },
    ],
  };

  const trafficSourcesData = {
    labels: analytics?.trafficSources?.map((source) => source.name) || [],
    datasets: [
      {
        data: analytics?.trafficSources?.map((source) => source.value) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white overflow-hidden rounded-lg shadow px-4 py-5"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="ml-5 w-full">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="mt-2 h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sélecteur de période */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-md shadow-sm">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${
                range === 'week'
                  ? 'rounded-l-md'
                  : range === 'year'
                  ? 'rounded-r-md'
                  : ''
              } border border-gray-300`}
            >
              {range === 'week'
                ? 'Semaine'
                : range === 'month'
                ? 'Mois'
                : 'Année'}
            </button>
          ))}
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      {stat.change !== 0 && (
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.change > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {stat.change > 0 ? '+' : ''}
                          {stat.change}%
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique des vues */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Évolution des vues
          </h3>
          <div className="h-64">
            <Line
              data={viewsChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Graphique des interactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Répartition des interactions
          </h3>
          <div className="h-64">
            <Doughnut
              data={interactionsChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Sources de trafic */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Sources de trafic
          </h3>
          <div className="h-64">
            <Bar
              data={{
                labels: trafficSourcesData.labels,
                datasets: [
                  {
                    ...trafficSourcesData.datasets[0],
                    label: 'Visites',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Carte de chaleur des horaires */}
        {analytics?.heatmapData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Horaires de forte activité
            </h3>
            <div className="grid grid-cols-7 gap-1">
              {analytics.heatmapData.map((day, dayIndex) => (
                <div key={dayIndex} className="space-y-1">
                  {day.hours.map((value, hourIndex) => (
                    <div
                      key={hourIndex}
                      className={`h-4 rounded ${
                        value === 0
                          ? 'bg-gray-100'
                          : value < 0.3
                          ? 'bg-blue-100'
                          : value < 0.6
                          ? 'bg-blue-300'
                          : 'bg-blue-500'
                      }`}
                      title={`${day.name} ${hourIndex}h: ${value * 100}%`}
                    />
                  ))}
                  <div className="text-xs text-gray-500 text-center">
                    {day.name.slice(0, 3)}
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
