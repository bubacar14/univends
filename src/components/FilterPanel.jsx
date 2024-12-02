import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const categories = ['Tous', 'Livres', 'Électronique', 'Meubles', 'Vêtements', 'Autres'];
const priceRanges = [
  { id: 'all', label: 'Tous les prix' },
  { id: '0-20', label: '0€ - 20€' },
  { id: '20-50', label: '20€ - 50€' },
  { id: '50-100', label: '50€ - 100€' },
  { id: '100+', label: 'Plus de 100€' }
];

export default function FilterPanel({ isOpen, onClose, filters, onFilterChange }) {
  const handleCategoryChange = (category) => {
    onFilterChange({
      ...filters,
      category: category === 'Tous' ? '' : category
    });
  };

  const handlePriceRangeChange = (range) => {
    onFilterChange({
      ...filters,
      priceRange: range === 'all' ? '' : range
    });
  };

  const handleSortChange = (e) => {
    onFilterChange({
      ...filters,
      sortBy: e.target.value
    });
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Filtres
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={onClose}
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          {/* Catégories */}
                          <div className="mb-8">
                            <h3 className="text-sm font-medium text-gray-900 mb-4">
                              Catégories
                            </h3>
                            <div className="space-y-2">
                              {categories.map((category) => (
                                <button
                                  key={category}
                                  onClick={() => handleCategoryChange(category)}
                                  className={`block w-full text-left px-3 py-2 rounded-lg ${
                                    (category === 'Tous' && !filters.category) ||
                                    filters.category === category
                                      ? 'bg-primary-100 text-primary-800'
                                      : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  {category}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Fourchette de prix */}
                          <div className="mb-8">
                            <h3 className="text-sm font-medium text-gray-900 mb-4">
                              Prix
                            </h3>
                            <div className="space-y-2">
                              {priceRanges.map((range) => (
                                <button
                                  key={range.id}
                                  onClick={() => handlePriceRangeChange(range.id)}
                                  className={`block w-full text-left px-3 py-2 rounded-lg ${
                                    (range.id === 'all' && !filters.priceRange) ||
                                    filters.priceRange === range.id
                                      ? 'bg-primary-100 text-primary-800'
                                      : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  {range.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Tri */}
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-4">
                              Trier par
                            </h3>
                            <select
                              value={filters.sortBy}
                              onChange={handleSortChange}
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-lg"
                            >
                              <option value="recent">Plus récents</option>
                              <option value="price_asc">Prix croissant</option>
                              <option value="price_desc">Prix décroissant</option>
                              <option value="popular">Popularité</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                      <button
                        onClick={onClose}
                        className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Appliquer les filtres
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
