import React, { useState } from 'react';
import { PRODUCT_CATEGORIES } from 'shared/constants';

interface ProductFilterProps {
  onFilterChange: (filters: any) => void;
  initialFilters?: any;
}

/**
 * Komponent filtrów produktów
 */
const ProductFilters: React.FC<ProductFilterProps> = ({ 
  onFilterChange, 
  initialFilters = {} 
}) => {
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    subcategory: initialFilters.subcategory || '',
    isCertified: initialFilters.isCertified || false,
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    ...initialFilters
  });

  /**
   * Obsługa zmiany filtra
   */
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Dla checkboxów pobierz wartość checked zamiast value
    const newValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked
      : value;
    
    // Aktualizacja stanu filtrów
    const updatedFilters = { ...filters, [name]: newValue };
    setFilters(updatedFilters);
    
    // Jeśli zmieniono kategorię, resetuj podkategorię
    if (name === 'category') {
      updatedFilters.subcategory = '';
      setFilters(updatedFilters);
    }
    
    // Przekaż aktualizowane filtry do komponentu nadrzędnego
    onFilterChange(updatedFilters);
  };

  /**
   * Resetuj wszystkie filtry
   */
  const resetFilters = () => {
    const resetedFilters = {
      category: '',
      subcategory: '',
      isCertified: false,
      minPrice: '',
      maxPrice: '',
    };
    setFilters(resetedFilters);
    onFilterChange(resetedFilters);
  };

  /**
   * Zastosuj filtry
   */
  const applyFilters = () => {
    onFilterChange(filters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Filtry</h3>
      
      <div className="space-y-4">
        {/* Kategoria */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Kategoria
          </label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="">Wszystkie kategorie</option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Certyfikaty */}
        <div className="flex items-center">
          <input
            id="isCertified"
            name="isCertified"
            type="checkbox"
            checked={filters.isCertified}
            onChange={handleFilterChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="isCertified" className="ml-2 block text-sm text-gray-700">
            Tylko certyfikowane produkty
          </label>
        </div>

        {/* Zakres cenowy */}
        <div>
          <label htmlFor="price-range" className="block text-sm font-medium text-gray-700">
            Zakres cenowy (PLN)
          </label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                name="minPrice"
                id="minPrice"
                placeholder="Od"
                min="0"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <input
                type="number"
                name="maxPrice"
                id="maxPrice"
                placeholder="Do"
                min="0"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Sortowanie */}
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">
            Sortuj według
          </label>
          <select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy || 'createdAt'}
            onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="createdAt">Najnowsze</option>
            <option value="price">Cena</option>
            <option value="rating">Ocena</option>
            {filters.coordinates && <option value="distance">Odległość</option>}
          </select>
        </div>

        {/* Kierunek sortowania */}
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
            Kolejność
          </label>
          <select
            id="sortOrder"
            name="sortOrder"
            value={filters.sortOrder || 'desc'}
            onChange={handleFilterChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="asc">Rosnąco</option>
            <option value="desc">Malejąco</option>
          </select>
        </div>

        {/* Przyciski akcji */}
        <div className="flex space-x-3 pt-3">
          <button
            type="button"
            onClick={resetFilters}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Resetuj
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Zastosuj
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;