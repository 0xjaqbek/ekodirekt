import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PRODUCT_CATEGORIES } from 'shared/constants';
import { ProductsFilterRequest } from 'shared/types/api';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Interfejs dla stanu filtrów
interface FiltersState extends ProductsFilterRequest {
  // Dodatkowe pola filtrów
  search?: string;
  
  // Akcje
  setFilter: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  setFilters: (filters: Partial<FiltersState>) => void;
  resetFilters: () => void;
  toggleCertified: () => void;
  setCategoryWithReset: (category: string) => void;
}

// Domyślny stan filtrów
const DEFAULT_FILTERS: Omit<FiltersState, 'setFilter' | 'setFilters' | 'resetFilters' | 'toggleCertified' | 'setCategoryWithReset'> = {
  category: '',
  subcategory: '',
  isCertified: false,
  minPrice: undefined,
  maxPrice: undefined,
  radius: undefined,
  coordinates: undefined,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 12,
  search: '',
};

// Tworzenie sklepu filtrów z persystencją
export const useFiltersStore = create<FiltersState>()(
  persist(
    (set, get) => ({
      // Stan początkowy
      ...DEFAULT_FILTERS,
      
      // Akcje
      setFilter: (key, value) => {
        // Przy zmianie strony, ustawia na stronę 1 (oprócz bezpośredniej zmiany page)
        if (key !== 'page') {
          set({ [key]: value, page: 1 } as any);
        } else {
          set({ [key]: value } as any);
        }
      },
      
      setFilters: (filters) => {
        // Przy zmianie filtrów, resetuj paginację
        if (Object.keys(filters).some(key => key !== 'page')) {
          set({ ...filters, page: 1 });
        } else {
          set(filters);
        }
      },
      
      resetFilters: () => {
        set(DEFAULT_FILTERS);
      },
      
      toggleCertified: () => {
        const { isCertified } = get();
        set({ isCertified: !isCertified, page: 1 });
      },
      
      setCategoryWithReset: (category) => {
        // Zmiana kategorii resetuje podkategorię
        set({ 
          category, 
          subcategory: '', 
          page: 1 
        });
      },
    }),
    {
      name: 'ekodirekt-filters-storage',
      storage: createJSONStorage(() => sessionStorage), // Używamy sessionStorage dla filtrów
      partialize: (state) => {
        // Filtrujemy tylko te pola, które chcemy zapisać
        const { 
          setFilter, setFilters, resetFilters, toggleCertified, setCategoryWithReset, 
          ...rest 
        } = state;
        return rest;
      },
    }
  )
);

// Hook do synchronizacji filtrów z URL
export const useFiltersSync = () => {
  const filters = useFiltersStore(state => ({
    category: state.category,
    subcategory: state.subcategory,
    isCertified: state.isCertified,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    page: state.page,
    search: state.search,
  }));
  const setFilters = useFiltersStore(state => state.setFilters);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Synchronizacja filtrów z URL przy zmianie lokalizacji
  React.useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlFilters: Partial<FiltersState> = {};
    
    // Pobierz wartości z URL
    if (queryParams.has('category')) urlFilters.category = queryParams.get('category') || '';
    if (queryParams.has('subcategory')) urlFilters.subcategory = queryParams.get('subcategory') || '';
    if (queryParams.has('isCertified')) urlFilters.isCertified = queryParams.get('isCertified') === 'true';
    if (queryParams.has('minPrice')) urlFilters.minPrice = Number(queryParams.get('minPrice')) || undefined;
    if (queryParams.has('maxPrice')) urlFilters.maxPrice = Number(queryParams.get('maxPrice')) || undefined;
    if (queryParams.has('sortBy')) urlFilters.sortBy = queryParams.get('sortBy') as any || 'createdAt';
    if (queryParams.has('sortOrder')) urlFilters.sortOrder = queryParams.get('sortOrder') as any || 'desc';
    if (queryParams.has('page')) urlFilters.page = Number(queryParams.get('page')) || 1;
    if (queryParams.has('search')) urlFilters.search = queryParams.get('search') || '';
    
    // Aktualizuj stan filtrów, tylko jeśli są różne od obecnych
    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters);
    }
  }, [location.search, setFilters]);
  
  // Aktualizacja URL przy zmianie filtrów
  React.useEffect(() => {
    const queryParams = new URLSearchParams();
    
    // Dodaj do URL tylko niepuste filtry
    if (filters.category) queryParams.set('category', filters.category);
    if (filters.subcategory) queryParams.set('subcategory', filters.subcategory);
    if (filters.isCertified) queryParams.set('isCertified', 'true');
    if (filters.minPrice !== undefined) queryParams.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) queryParams.set('maxPrice', filters.maxPrice.toString());
    if (filters.sortBy && filters.sortBy !== 'createdAt') queryParams.set('sortBy', filters.sortBy);
    if (filters.sortOrder && filters.sortOrder !== 'desc') queryParams.set('sortOrder', filters.sortOrder);
    if (filters.page && filters.page > 1) queryParams.set('page', filters.page.toString());
    if (filters.search) queryParams.set('search', filters.search);
    
    // Aktualizuj URL
    const search = queryParams.toString();
    if (search !== location.search.replace('?', '')) {
      navigate({
        search: search ? `?${search}` : '',
      }, { replace: true });
    }
  }, [filters, navigate, location.pathname]);
  
  return filters;
};