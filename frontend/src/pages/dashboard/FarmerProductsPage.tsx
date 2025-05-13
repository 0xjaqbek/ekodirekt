import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../hooks/useAuth';
import ProductCard from '../../components/ProductCard';

const FarmerProductsPage: React.FC = () => {
  const { user } = useAuth();
  const { getFarmerProducts, loading, error } = useProducts({ autoLoad: false });
  
  // Stan dla produktów rolnika
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  
  // Stan dla filtrów
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Pobierz produkty po zmianie filtrów
  useEffect(() => {
    loadFarmerProducts();
  }, [pagination.page, activeTab]);
  
  // Pobierz produkty rolnika
  const loadFarmerProducts = async () => {
    if (!user) return;
    
    // Mapuj aktywny tab na status produktu
    let status;
    switch (activeTab) {
      case 'available':
        status = 'available';
        break;
      case 'unavailable':
        status = 'unavailable';
        break;
      // Inne statusy...
      default:
        status = undefined; // 'all'
    }
    
    const response = await getFarmerProducts(user._id, pagination.page, pagination.limit, status);
    if (response) {
      setProducts(response.products);
      setPagination(response.pagination);
    }
  };
  
  // Zmień stronę
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  // Zmień aktywny tab
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset strony przy zmianie filtra
  };
  
  // Sprawdź, czy użytkownik jest rolnikiem
  if (user && user.role !== 'farmer' && user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          Brak uprawnień. Ta strona jest dostępna tylko dla rolników.
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Twoje produkty</h1>
        <Link
          to="/dashboard/products/new"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          Dodaj nowy produkt
        </Link>
      </div>
      
      {/* Filtry (zakładki) */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'all'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Wszystkie
          </button>
          <button
            onClick={() => handleTabChange('available')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'available'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dostępne
          </button>
          <button
            onClick={() => handleTabChange('unavailable')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'unavailable'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Niedostępne
          </button>
          {/* Można dodać więcej zakładek dla innych statusów */}
        </div>
      </div>
      
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
        <div className="bg-gray-50 p-8 rounded-md text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Brak produktów</h3>
          <p className="text-gray-600 mb-6">
            Nie dodałeś jeszcze żadnych produktów do swojej oferty.
          </p>
          <Link
            to="/dashboard/products/new"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Dodaj pierwszy produkt
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} isFarmerView={true} />
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
  );
};

export default FarmerProductsPage;