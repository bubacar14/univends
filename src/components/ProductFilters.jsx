import { Fragment, useState, useEffect } from 'react';
import { Dialog, Disclosure, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const sortOptions = [
  { name: 'Plus récents', value: 'newest' },
  { name: 'Prix croissant', value: 'price-asc' },
  { name: 'Prix décroissant', value: 'price-desc' },
  { name: 'Plus populaires', value: 'popularity' },
  { name: 'Mieux notés', value: 'rating' },
  { name: 'Distance', value: 'distance' },
];

const defaultFilters = [
  {
    id: 'category',
    name: 'Catégorie',
    options: [
      { value: 'books', label: 'Livres' },
      { value: 'electronics', label: 'Électronique' },
      { value: 'courses', label: 'Cours' },
      { value: 'furniture', label: 'Mobilier' },
      { value: 'phones', label: 'Téléphones' },
      { value: 'music', label: 'Musique' },
      { value: 'clothing', label: 'Vêtements' },
      { value: 'transport', label: 'Transport' },
    ],
  },
  {
    id: 'condition',
    name: 'État',
    options: [
      { value: 'new', label: 'Neuf' },
      { value: 'like-new', label: 'Comme neuf' },
      { value: 'good', label: 'Bon état' },
      { value: 'fair', label: 'État correct' },
    ],
  },
  {
    id: 'price',
    name: 'Prix',
    type: 'range',
    min: 0,
    max: 1000,
    step: 10,
  },
  {
    id: 'location',
    name: 'Distance',
    type: 'range',
    min: 0,
    max: 50,
    step: 5,
    unit: 'km',
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ProductFilters({
  mobileFiltersOpen,
  setMobileFiltersOpen,
  selectedFilters,
  onFilterChange,
  onSortChange,
  selectedSort,
}) {
  const [filters, setFilters] = useState(defaultFilters);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadDynamicFilters();
  }, []);

  useEffect(() => {
    // Calculer le nombre de filtres actifs
    const count = Object.entries(selectedFilters).reduce((acc, [key, value]) => {
      if (Array.isArray(value)) {
        return acc + value.length;
      }
      return acc + (value ? 1 : 0);
    }, 0);
    setActiveFiltersCount(count);
  }, [selectedFilters]);

  const loadDynamicFilters = async () => {
    try {
      const response = await fetch('/api/filters/options');
      const data = await response.json();
      setFilters(prevFilters => 
        prevFilters.map(filter => ({
          ...filter,
          options: data[filter.id]?.options || filter.options,
          min: data[filter.id]?.min ?? filter.min,
          max: data[filter.id]?.max ?? filter.max,
        }))
      );
    } catch (error) {
      console.error('Erreur lors du chargement des options de filtres:', error);
    }
  };

  const handleFilterChange = (filterId, value, type = 'checkbox') => {
    const newFilters = { ...selectedFilters };
    
    if (type === 'range') {
      newFilters[filterId] = value;
    } else {
      if (newFilters[filterId]?.includes(value)) {
        newFilters[filterId] = newFilters[filterId].filter((v) => v !== value);
      } else {
        newFilters[filterId] = [...(newFilters[filterId] || []), value];
      }
    }
    
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setIsResetting(true);
    onFilterChange({});
    onSortChange('newest');
    setTimeout(() => setIsResetting(false), 1000);
  };

  const renderFilterContent = (section) => {
    if (section.type === 'range') {
      return (
        <div className="pt-6">
          <div className="flex items-center justify-between">
            <input
              type="range"
              min={section.min}
              max={section.max}
              step={section.step}
              value={selectedFilters[section.id] || section.min}
              onChange={(e) => handleFilterChange(section.id, e.target.value, 'range')}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
            <span>{section.min}{section.unit}</span>
            <span>{selectedFilters[section.id] || section.min}{section.unit}</span>
            <span>{section.max}{section.unit}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {section.options.map((option, optionIdx) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`filter-${section.id}-${optionIdx}`}
              name={`${section.id}[]`}
              value={option.value}
              type="checkbox"
              checked={selectedFilters[section.id]?.includes(option.value)}
              onChange={() => handleFilterChange(section.id, option.value)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label
              htmlFor={`filter-${section.id}-${optionIdx}`}
              className="ml-3 text-sm text-gray-600"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white">
      {/* Mobile filter dialog */}
      <Transition.Root show={mobileFiltersOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 lg:hidden"
          onClose={setMobileFiltersOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900">Filtres</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Filters */}
                <form className="mt-4">
                  {filters.map((section) => (
                    <Disclosure
                      as="div"
                      key={section.name}
                      className="border-t border-gray-200 px-4 py-6"
                    >
                      {({ open }) => (
                        <>
                          <h3 className="-mx-2 -my-3 flow-root">
                            <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400">
                              <span className="font-medium text-gray-900">
                                {section.name}
                              </span>
                              <span className="ml-6 flex items-center">
                                <ChevronDownIcon
                                  className={classNames(
                                    open ? '-rotate-180' : 'rotate-0',
                                    'h-5 w-5 transform'
                                  )}
                                />
                              </span>
                            </Disclosure.Button>
                          </h3>
                          <Disclosure.Panel className="pt-6">
                            {renderFilterContent(section)}
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  ))}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop filters */}
      <section aria-labelledby="filter-heading" className="pb-6 pt-6">
        <h2 id="filter-heading" className="sr-only">
          Filtres des produits
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flow-root">
              <select
                value={selectedSort}
                onChange={(e) => onSortChange(e.target.value)}
                className="rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowPathIcon
                  className={`mr-1.5 h-4 w-4 ${isResetting ? 'animate-spin' : ''}`}
                />
                Réinitialiser
              </button>
            )}
          </div>

          <button
            type="button"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 sm:hidden"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <FunnelIcon className="mr-1.5 h-4 w-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="ml-1.5 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="hidden sm:block">
          <div className="space-y-6 divide-y divide-gray-200">
            {filters.map((section, sectionIdx) => (
              <div
                key={section.name}
                className={sectionIdx === 0 ? 'pt-0' : 'pt-6'}
              >
                <fieldset>
                  <legend className="text-sm font-medium text-gray-900">
                    {section.name}
                  </legend>
                  <div className="mt-4">
                    {renderFilterContent(section)}
                  </div>
                </fieldset>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
