import React, { useEffect, useState } from 'react';
import ProductFilters from '../components/ProductFilters';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useLocation } from 'react-router-dom';

const ProductsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || '';
  
  // Stan dla filtrów
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pobieranie produktów za pomocą custom hooka
  const {
    products,
    loading,
    error,
    pagination,
    filters,
    applyFilters,
    loadProducts,
    goToPage,
  } = useProducts({ 
    initialFilters: { 
      category: initialCategory,
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    } 
  });
  
  // Obsługa zmiany filtrów
  const handleFilterChange = (newFilters: any) => {
    applyFilters(newFilters);
  };
  
  // Obsługa zmiany wyszukiwania
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Obsługa wyszukiwania
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchTerm });
  };
  
  // Obsługa zmiany strony
  const handlePageChange = (page: number) => {
    goToPage(page);
  };
  
  // Po zmianie URL aktualizuj filtry
  useEffect(() => {
    const category = queryParams.get('category');
    if (category) {
      applyFilters({ category });
    }
  }, [location.search]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Katalog produktów ekologicznych</h1>
      
      {/* Pasek wyszukiwania */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex w-full">
          <input
            type="text"
            placeholder="Szukaj produktów..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Szukaj
          </button>
        </form>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Filtry boczne */}
        <div className="md:w-1/4 md:pr-6 mb-6 md:mb-0">
          <ProductFilters
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />
        </div>
        
        {/* Lista produktów */}
        <div className="md:w-3/4">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-gray-50 text-gray-600 p-8 rounded-md text-center">
              <h3 className="text-lg font-medium mb-2">Brak produktów</h3>
              <p>Nie znaleziono produktów spełniających wybrane kryteria.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Znaleziono {pagination.total} produktów
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              
              {/* Paginacja */}
              {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="mr-2 px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
                    >
                      &laquo; Poprzednia
                    </button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md ${
                            page === pagination.page
                              ? 'bg-primary text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="ml-2 px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
                    >
                      Następna &raquo;
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;