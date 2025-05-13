import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProductResponse } from 'shared/types/api';

// Interface dla elementu koszyka
export interface CartItem {
  productId: string;
  product: ProductResponse;
  quantity: number;
  addedAt: Date;
}

// Interface dla stanu koszyka
interface CartState {
  // Stan
  items: CartItem[];
  isOpen: boolean;
  
  // Gettery
  totalItems: number;
  totalPrice: number;
  
  // Akcje
  addItem: (product: ProductResponse, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

// Tworzenie sklepu koszyka z persystencją
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Stan początkowy
      items: [],
      isOpen: false,
      
      // Gettery
      get totalItems() {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      get totalPrice() {
        return get().items.reduce(
          (total, item) => total + (item.product.price * item.quantity),
          0
        );
      },
      
      // Akcje
      addItem: (product: ProductResponse, quantity: number) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(item => item.productId === product._id);
        
        if (existingItemIndex !== -1) {
          // Produkt już istnieje w koszyku - zaktualizuj ilość
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
          
          // Sprawdź, czy nie przekraczamy dostępnej ilości
          if (updatedItems[existingItemIndex].quantity > product.quantity) {
            updatedItems[existingItemIndex].quantity = product.quantity;
          }
          
          set({ items: updatedItems });
        } else {
          // Dodaj nowy produkt do koszyka
          const newItem: CartItem = {
            productId: product._id,
            product,
            quantity: Math.min(quantity, product.quantity), // Nie więcej niż dostępna ilość
            addedAt: new Date(),
          };
          
          set({ items: [...items, newItem] });
        }
        
        // Automatycznie otwórz koszyk
        set({ isOpen: true });
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(item => item.productId === productId);
        
        if (existingItemIndex !== -1) {
          const updatedItems = [...items];
          const product = updatedItems[existingItemIndex].product;
          
          if (quantity <= 0) {
            // Jeśli ilość <= 0, usuń produkt z koszyka
            updatedItems.splice(existingItemIndex, 1);
          } else {
            // Zaktualizuj ilość, nie przekraczając dostępnej ilości produktu
            updatedItems[existingItemIndex].quantity = Math.min(quantity, product.quantity);
          }
          
          set({ items: updatedItems });
        }
      },
      
      removeItem: (productId: string) => {
        const { items } = get();
        set({ items: items.filter(item => item.productId !== productId) });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      openCart: () => {
        set({ isOpen: true });
      },
      
      closeCart: () => {
        set({ isOpen: false });
      },
      
      toggleCart: () => {
        const { isOpen } = get();
        set({ isOpen: !isOpen });
      },
    }),
    {
      name: 'ekodirekt-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        items: state.items 
      }),
    }
  )
);

// Hook sprawdzający aktualność produktów w koszyku przy starcie aplikacji
export const useCartProductsCheck = (fetchProduct: (id: string) => Promise<ProductResponse | null>) => {
  const items = useCartStore(state => state.items);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  
  React.useEffect(() => {
    const checkProductsAvailability = async () => {
      for (const item of items) {
        try {
          // Sprawdź aktualny stan produktu
          const updatedProduct = await fetchProduct(item.productId);
          
          if (!updatedProduct) {
            // Produkt już nie istnieje - usuń z koszyka
            removeItem(item.productId);
          } else if (updatedProduct.status !== 'available' || updatedProduct.quantity === 0) {
            // Produkt niedostępny - usuń z koszyka
            removeItem(item.productId);
          } else if (item.quantity > updatedProduct.quantity) {
            // Dostępna ilość się zmniejszyła - zaktualizuj
            updateQuantity(item.productId, updatedProduct.quantity);
          }
        } catch (error) {
          console.error(`Błąd podczas sprawdzania produktu ${item.productId}:`, error);
        }
      }
    };
    
    checkProductsAvailability();
  }, [items, updateQuantity, removeItem, fetchProduct]);
};