import React, { ReactNode } from 'react';
import { useAuthCheck } from '@/stores/authStore';
import { useCartProductsCheck } from '@/stores/cartStore';
import productService from '@/services/productService';

interface StoreProvidersProps {
  children: ReactNode;
}

/**
 * Provider dla wszystkich sklepów Zustand
 * Inicjalizuje niezbędne sprawdzenia dla stanów
 */
export const StoreProviders: React.FC<StoreProvidersProps> = ({ children }) => {
  // Sprawdza i inicjalizuje stan autentykacji
  useAuthCheck();
  
  // Sprawdza produkty w koszyku
  useCartProductsCheck(async (id) => {
    try {
      const response = await productService.getProductById(id);
      return response.success ? response.product : null;
    } catch (error) {
      console.error(`Błąd podczas pobierania produktu ${id}:`, error);
      return null;
    }
  });
  
  return <>{children}</>;
};

/**
 * Hook do resetowania stanów sklepów przy wylogowaniu
 */
export const useResetStores = () => {
  const resetFilters = useFiltersStore(state => state.resetFilters);
  const clearCart = useCartStore(state => state.clearCart);
  
  return () => {
    // Resetuj stan filtrów
    resetFilters();
    
    // Wyczyść koszyk
    clearCart();
    
    // Tu można dodać resetowanie innych sklepów
  };
};