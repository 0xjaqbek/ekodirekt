import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';
import { 
  ProductResponse, 
  ProductListResponse,
  ProductsFilterRequest,
  CreateProductRequest
} from 'shared/types/api';

interface UseProductsProps {
  initialFilters?: ProductsFilterRequest;
  autoLoad?: boolean;
}

/**
 * Hook do zarządzania produktami
 */
export const useProducts = ({ initialFilters, autoLoad = true }: UseProductsProps = {}) => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductsFilterRequest & { search?: string }>(initialFilters || {});
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0
  });
  
  const navigate = useNavigate();
  
  // Pobierz produkty po zmianie filtrów
  useEffect(() => {
    if (autoLoad) {
      loadProducts();
    }
  }, [filters.page, filters.limit, autoLoad]);
  
  /**
   * Pobierz produkty
   */
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getProducts(filters);
      
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Wystąpił błąd podczas pobierania produktów');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Zastosuj filtry
   */
  const applyFilters = (newFilters: Partial<ProductsFilterRequest & { search?: string }>) => {
    // Resetuj stronę przy zmianie filtrów
    setFilters({ ...filters, ...newFilters, page: 1 });
  };
  
  /**
   * Zmień stronę
   */
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.pages) return;
    setFilters({ ...filters, page });
  };
  
  /**
   * Pobierz produkt po ID
   */
  const getProductById = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getProductById(productId);
      return response.product;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Wystąpił błąd podczas pobierania produktu');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Dodaj nowy produkt
   */
  const createProduct = async (productData: FormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.createProduct(productData);
      
      // Po pomyślnym dodaniu, przejdź do szczegółów produktu
      navigate(`/products/${response.product._id}`);
      
      return response.product;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Wystąpił błąd podczas dodawania produktu');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Aktualizuj produkt
   */
  const updateProduct = async (productId: string, productData: FormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.updateProduct(productId, productData);
      
      // Aktualizuj produkt w liście jeśli istnieje
      setProducts(currentProducts => 
        currentProducts.map(p => 
          p._id === productId ? response.product : p
        )
      );
      
      return response.product;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Wystąpił błąd podczas aktualizacji produktu');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Usuń produkt
   */
  const deleteProduct = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await productService.deleteProduct(productId);
      
      // Usuń produkt z listy
      setProducts(currentProducts => 
        currentProducts.filter(p => p._id !== productId)
      );
      
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Wystąpił błąd podczas usuwania produktu');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Aktualizuj status produktu
   */
  const updateProductStatus = async (productId: string, status: string, note?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.updateProductStatus(productId, status, note);
      
      // Aktualizuj produkt w liście jeśli istnieje
      setProducts(currentProducts => 
        currentProducts.map(p => 
          p._id === productId ? response.product : p
        )
      );
      
      return response.product;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Wystąpił błąd podczas aktualizacji statusu produktu');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Pobierz produkty rolnika
   */
  const getFarmerProducts = async (farmerId: string, page = 1, limit = 12, status?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getFarmerProducts(farmerId, page, limit, status);
      
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Wystąpił błąd podczas pobierania produktów rolnika');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Pobierz produkty w pobliżu
   */
  const getNearbyProducts = async (latitude: number, longitude: number, radius: number = 50, category?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getNearbyProducts(latitude, longitude, radius, category);
      
      return response.products;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Wystąpił błąd podczas pobierania pobliskich produktów');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Pobierz historię śledzenia produktu
   */
  const getProductTracking = async (trackingId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getProductTracking(trackingId);
      
      return response.tracking;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Wystąpił błąd podczas pobierania historii śledzenia');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Wyszukaj produkty
   */
  const searchProducts = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      
      applyFilters({ search: query });
      await loadProducts();
      
      return products;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Wystąpił błąd podczas wyszukiwania produktów');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  return {
    products,
    loading,
    error,
    pagination,
    filters,
    loadProducts,
    applyFilters,
    goToPage,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    getFarmerProducts,
    getNearbyProducts,
    getProductTracking,
    searchProducts,
  };
};