import React from 'react';
import { useCartStore } from '@/stores/cartStore';
import { ProductResponse } from 'shared/types/api';
import { formatPrice } from 'shared/utils';

interface CartDrawerProps {
  className?: string;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ className = '' }) => {
  const { items, isOpen, totalItems, totalPrice, closeCart, removeItem, updateQuantity } = useCartStore();
  
  // Zamykanie koszyka po kliknięciu poza nim
  const drawerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        closeCart();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, closeCart]);
  
  // Zablokowanie przewijania strony gdy koszyk jest otwarty
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Obsługa zmiany ilości produktu
  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end">
      <div 
        ref={drawerRef}
        className={`w-full max-w-md bg-white h-full shadow-lg flex flex-col ${className}`}
      >
        {/* Nagłówek koszyka */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Twój koszyk ({totalItems})
          </h2>
          <button 
            onClick={closeCart}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Lista produktów */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500">Twój koszyk jest pusty</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            {items.map((item) => (
              <div 
                key={item.productId} 
                className="mb-4 border-b border-gray-100 pb-4"
              >
                <div className="flex items-center mb-2">
                  {/* Zdjęcie produktu */}
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  
                  {/* Informacje o produkcie */}
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-xs text-gray-500">
                      {formatPrice(item.product.price)} / {item.product.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      Rolnik: {item.product.owner.fullName}
                    </p>
                  </div>
                  
                  {/* Przycisk usuwania */}
                  <button 
                    onClick={() => removeItem(item.productId)}
                    className="p-1 ml-2 text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                {/* Kontrola ilości */}
                <div className="flex items-center justify-end">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button 
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-2 min-w-[40px] text-center">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                      disabled={item.quantity >= item.product.quantity}
                    >
                      +
                    </button>
                  </div>
                  
                  <span className="ml-4 font-medium">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Podsumowanie i przyciski akcji */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Razem:</span>
            <span className="font-semibold text-lg">{formatPrice(totalPrice)}</span>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={closeCart}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Kontynuuj zakupy
            </button>
            
            <button 
              disabled={items.length === 0}
              className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              onClick={() => {
                closeCart();
                // Przekieruj do strony kasy/zamówienia
                // Można tu użyć navigate('/checkout') z react-router-dom
              }}
            >
              Przejdź do kasy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;