import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import productService from '@/services/productService';
import { ProductResponse, ProductListResponse } from 'shared/types/api';
import { useFiltersStore } from './filtersStore';

// Interfejs dla stanu produktów
interface ProductsState {
  // Stan
  products: ProductResponse[];
  featuredProducts: ProductResponse[];
  recentlyViewed: ProductResponse[];
  selectedProduct: ProductResponse | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  
  // Akcje
  fetchProducts: () => Promise<ProductListResponse | null>;
  fetchProductById: (id: string) => Promise<ProductResponse | null>;
  fetchFeaturedProducts: () => Promise<ProductResponse[]>;
  setSelectedProduct: (product: ProductResponse | null) => void;
  addToRecentlyViewed: (product: ProductResponse) => void;
  clearRecentlyViewed: () => void;
  setError: (error: string | null) => void;
}

// Tworzenie sklepu produktów
export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      // Stan początkowy
      products: [],
      featuredProducts: [],
      recentlyViewed: [],
      selectedProduct: null,
      loading: false,
      error: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 12,
        pages: 0
      },
      
      // Akcje
      fetchProducts: async () => {
        try {
          set({ loading: true, error: null });
          
          // Pobierz filtry ze sklepu filtrów
          const filters = useFiltersStore.getState();
          
          const response = await productService.getProducts(filters);
          
          if (response.success) {
            set({ 
              products: response.products,
              pagination: response.pagination,
              loading: false
            });
            return response;
          } else {
            set({ 
              error: 'Nie udało się pobrać produktów', 
              loading: false 
            });
            return null;
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Wystąpił błąd podczas pobierania produktów', 
            loading: false 
          });
          return null;
        }
      },
      
      fetchProductById: async (id: string) => {
        try {
          set({ loading: true, error: null });
          
          const response = await productService.getProductById(id);
          
          if (response.success) {
            const product = response.product;
            set({ 
              selectedProduct: product,
              loading: false
            });
            
            // Dodaj do ostatnio oglądanych
            get().addToRecentlyViewed(product);
            
            return product;
          } else {
            set({ 
              error: 'Nie udało się pobrać produktu', 
              loading: false 
            });
            return null;
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Wystąpił błąd podczas pobierania produktu', 
            loading: false 
          });
          return null;
        }
      },
      
      fetchFeaturedProducts: async () => {
        try {
          set({ loading: true, error: null });
          
          // Filtr dla wyróżnionych produktów (np. certyfikowane lub najlepiej oceniane)
          const filters = {
            isCertified: true,
            sortBy: 'rating',
            sortOrder: 'desc',
            limit: 6
          };
          
          const response = await productService.getProducts(filters);
          
          if (response.success) {
            set({ 
              featuredProducts: response.products,
              loading: false
            });
            return response.products;
          } else {
            set({ 
              error: 'Nie udało się pobrać wyróżnionych produktów', 
              loading: false 
            });
            return [];
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Wystąpił błąd podczas pobierania wyróżnionych produktów', 
            loading: false 
          });
          return [];
        }
      },
      
      setSelectedProduct: (product: ProductResponse | null) => {
        set({ selectedProduct: product });
        
        if (product) {
          get().addToRecentlyViewed(product);
        }
      },
      
      addToRecentlyViewed: (product: ProductResponse) => {
        const { recentlyViewed } = get();
        
        // Sprawdź, czy produkt już istnieje w ostatnio oglądanych
        const existingIndex = recentlyViewed.findIndex(p => p._id === product._id);
        
        if (existingIndex !== -1) {
          // Usuń istniejący element, aby dodać go na początek listy
          const updatedList = [...recentlyViewed];
          updatedList.splice(existingIndex, 1);
          
          set({ recentlyViewed: [product, ...updatedList].slice(0, 10) }); // Ogranicz do 10 elementów
        } else {
          set({ 
            recentlyViewed: [product, ...recentlyViewed].slice(0, 10) // Ogranicz do 10 elementów
          });
        }
      },
      
      clearRecentlyViewed: () => {
        set({ recentlyViewed: [] });
      },
      
      setError: (error: string | null) => {
        set({ error });
      }
    }),
    {
      name: 'ekodirekt-products-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        recentlyViewed: state.recentlyViewed.slice(0, 10)
      }),
    }
  )
);

/**
 * Hook kompozycyjny do pobierania produktów z filtrowaniem
 * Automatycznie synchronizuje stan filtrów z listą produktów
 */
export const useFilteredProducts = () => {
  const { 
    products, 
    loading, 
    error, 
    pagination, 
    fetchProducts
  } = useProductsStore();
  
  const filters = useFiltersStore(state => ({
    category: state.category,
    subcategory: state.subcategory,
    isCertified: state.isCertified,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    page: state.page,
    search: state.search
  }));
  
  // Ładuj produkty przy zmianie filtrów
  React.useEffect(() => {
    fetchProducts();
  }, [
    filters.category,
    filters.subcategory,
    filters.isCertified,
    filters.minPrice,
    filters.maxPrice,
    filters.sortBy,
    filters.sortOrder,
    filters.page,
    filters.search,
    fetchProducts
  ]);
  
  return {
    products,
    loading,
    error,
    pagination,
    filters,
    refetch: fetchProducts
  };
};

/**
 * Hook do pobierania szczegółów produktu
 */
export const useProductDetails = (productId: string | undefined) => {
  const { 
    selectedProduct, 
    loading, 
    error, 
    fetchProductById 
  } = useProductsStore();
  
  // Ładuj produkt po ID
  React.useEffect(() => {
    if (productId) {
      fetchProductById(productId);
    }
  }, [productId, fetchProductById]);
  
  return {
    product: selectedProduct,
    loading,
    error,
    refetch: () => productId ? fetchProductById(productId) : Promise.resolve(null)
  };
};