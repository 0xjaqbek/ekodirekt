import React from 'react';
import { useFiltersStore } from '../../stores/filterStore';
import { PRODUCT_CATEGORIES, PRODUCT_SUBCATEGORIES } from 'shared/constants';

interface ProductFiltersSidebarProps {
  className?: string;
}

const ProductFiltersSidebar: React.FC<ProductFiltersSidebarProps> = ({ className = '' }) => {
  const {
    category,
    subcategory,
    isCertified,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    setCategoryWithReset,
    setFilter,
    resetFilters,
    toggleCertified
  } = useFiltersStore();

  // Stan lokalny dla pól formularza
  const [priceRange, setPriceRange] = React.useState({
    min: minPrice?.toString() || '',
    max: maxPrice?.toString() || ''
  });

  // Obsługa zmiany ceny
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({ ...prev, [name]: value }));
  };

  // Zastosowanie filtrów ceny
  const applyPriceFilter = () => {
    setFilter('minPrice', priceRange.min ? Number(priceRange.min) : undefined);
    setFilter('maxPrice', priceRange.max ? Number(priceRange.max) : undefined);
  };

  // Dostępne podkategorie dla wybranej kategorii
  const availableSubcategories = category
    ? PRODUCT_SUBCATEGORIES[category as keyof typeof PRODUCT_SUBCATEGORIES] || []
    : [];

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtry</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-primary hover:text-primary-dark"
        >
          Resetuj
        </button>
      </div>

      {/* Kategorie */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Kategoria</h4>
        <div className="space-y-1">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="category"
              checked={category === ''}
              onChange={() => setCategoryWithReset('')}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Wszystkie kategorie</span>
          </label>

          {PRODUCT_CATEGORIES.map((cat) => (
            <label key={cat} className="inline-flex items-center">
              <input
                type="radio"
                name="category"
                checked={category === cat}
                onChange={() => setCategoryWithReset(cat)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Podkategorie (jeśli wybrano kategorię) */}
      {category && availableSubcategories.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Podkategoria</h4>
          <div className="space-y-1">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="subcategory"
                checked={subcategory === ''}
                onChange={() => setFilter('subcategory', '')}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Wszystkie podkategorie</span>
            </label>

            {availableSubcategories.map((subcat) => (
              <label key={subcat} className="inline-flex items-center">
                <input
                  type="radio"
                  name="subcategory"
                  checked={subcategory === subcat}
                  onChange={() => setFilter('subcategory', subcat)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{subcat}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Certyfikaty */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Certyfikaty</h4>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={isCertified}
            onChange={toggleCertified}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Tylko certyfikowane produkty</span>
        </label>
      </div>

      {/* Zakres cenowy */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Zakres cenowy (PLN)</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              name="min"
              placeholder="Od"
              min="0"
              value={priceRange.min}
              onChange={handlePriceChange}
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <input
              type="number"
              name="max"
              placeholder="Do"
              min="0"
              value={priceRange.max}
              onChange={handlePriceChange}
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        <button
          onClick={applyPriceFilter}
          className="mt-2 w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
        >
          Zastosuj
        </button>
      </div>

      {/* Sortowanie */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Sortuj według</h4>
        <select
          id="sortBy"
          name="sortBy"
          value={sortBy || 'createdAt'}
          onChange={(e) => setFilter('sortBy', e.target.value as any)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
        >
          <option value="createdAt">Data dodania</option>
          <option value="price">Cena</option>
          <option value="rating">Ocena</option>
        </select>

        <div className="mt-2 flex">
          <label className="inline-flex items-center mr-4">
            <input
              type="radio"
              name="sortOrder"
              checked={sortOrder === 'asc'}
              onChange={() => setFilter('sortOrder', 'asc')}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Rosnąco</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="sortOrder"
              checked={sortOrder === 'desc'}
              onChange={() => setFilter('sortOrder', 'desc')}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Malejąco</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductFiltersSidebar;