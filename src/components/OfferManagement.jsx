import { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const OFFER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  COMPLETED: 'completed',
};

const STATUS_CONFIG = {
  [OFFER_STATUS.PENDING]: {
    icon: ClockIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'En attente',
  },
  [OFFER_STATUS.ACCEPTED]: {
    icon: CheckCircleIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Acceptée',
  },
  [OFFER_STATUS.REJECTED]: {
    icon: XCircleIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Refusée',
  },
  [OFFER_STATUS.EXPIRED]: {
    icon: ClockIcon,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    label: 'Expirée',
  },
  [OFFER_STATUS.COMPLETED]: {
    icon: ShieldCheckIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Complétée',
  },
};

export default function OfferManagement({ productId, currentUser }) {
  const [offers, setOffers] = useState([]);
  const [newOffer, setNewOffer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [counterOfferAmount, setCounterOfferAmount] = useState('');

  useEffect(() => {
    loadOffers();
    loadProduct();
  }, [productId]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}/offers`);
      const data = await response.json();
      setOffers(data);
    } catch (error) {
      setError('Erreur lors du chargement des offres');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
    }
  };

  const submitOffer = async () => {
    if (!newOffer || isNaN(newOffer)) return;

    try {
      const response = await fetch(`/api/products/${productId}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(newOffer),
          buyerId: currentUser.id,
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la soumission de l\'offre');

      const data = await response.json();
      setOffers((prev) => [...prev, data]);
      setNewOffer('');
    } catch (error) {
      setError('Erreur lors de la soumission de l\'offre');
      console.error('Erreur:', error);
    }
  };

  const handleOfferAction = async (offerId, action) => {
    try {
      const response = await fetch(`/api/offers/${offerId}/${action}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error(`Erreur lors de l'${action} de l'offre`);

      await loadOffers();
    } catch (error) {
      setError(`Erreur lors de l'${action} de l'offre`);
      console.error('Erreur:', error);
    }
  };

  const submitCounterOffer = async (offerId) => {
    if (!counterOfferAmount || isNaN(counterOfferAmount)) return;

    try {
      const response = await fetch(`/api/offers/${offerId}/counter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(counterOfferAmount),
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la contre-offre');

      await loadOffers();
      setShowCounterOffer(false);
      setCounterOfferAmount('');
    } catch (error) {
      setError('Erreur lors de la contre-offre');
      console.error('Erreur:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const getTimeDifference = (timestamp) => {
    const now = new Date();
    const offerTime = new Date(timestamp);
    const diffInHours = Math.floor((now - offerTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - offerTime) / (1000 * 60));
      return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    }
    if (diffInHours < 24) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* En-tête */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Gestion des offres</h2>
        {product && (
          <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
            <span>Prix initial: {formatPrice(product.price)}</span>
            <span>{offers.length} offre(s)</span>
          </div>
        )}
      </div>

      {/* Liste des offres */}
      <div className="divide-y divide-gray-100">
        {offers.map((offer) => {
          const status = STATUS_CONFIG[offer.status];
          const StatusIcon = status.icon;

          return (
            <div key={offer.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={offer.buyer.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {offer.buyer.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getTimeDifference(offer.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-gray-900">
                    {formatPrice(offer.amount)}
                  </span>
                  <div className={`px-3 py-1 rounded-full ${status.bgColor}`}>
                    <div className="flex items-center space-x-1">
                      <StatusIcon className={`h-4 w-4 ${status.color}`} />
                      <span className={`text-sm font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions sur l'offre */}
              {offer.status === OFFER_STATUS.PENDING && (
                <div className="mt-4 flex items-center space-x-4">
                  <button
                    onClick={() => handleOfferAction(offer.id, 'accept')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => setShowCounterOffer(offer.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Contre-offre
                  </button>
                  <button
                    onClick={() => handleOfferAction(offer.id, 'reject')}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Refuser
                  </button>
                </div>
              )}

              {/* Formulaire de contre-offre */}
              {showCounterOffer === offer.id && (
                <div className="mt-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      value={counterOfferAmount}
                      onChange={(e) => setCounterOfferAmount(e.target.value)}
                      placeholder="Montant de la contre-offre"
                      className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={() => submitCounterOffer(offer.id)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      Envoyer
                    </button>
                    <button
                      onClick={() => setShowCounterOffer(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Messages et historique */}
              {offer.messages && offer.messages.length > 0 && (
                <div className="mt-4 pl-14">
                  <div className="text-sm text-gray-500">
                    <ChatBubbleLeftRightIcon className="inline-block h-4 w-4 mr-1" />
                    {offer.messages.length} message(s)
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Formulaire nouvelle offre */}
      {currentUser && product && currentUser.id !== product.sellerId && (
        <div className="p-6 border-t">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="number"
                value={newOffer}
                onChange={(e) => setNewOffer(e.target.value)}
                placeholder="Votre offre"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={submitOffer}
              disabled={!newOffer || isNaN(newOffer)}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Faire une offre
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
