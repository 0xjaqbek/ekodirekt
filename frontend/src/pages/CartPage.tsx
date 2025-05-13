import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from 'shared/utils';

const CartPage: React.FC = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State for special instructions or notes
  const [orderNotes, setOrderNotes] = useState('');
  
  // Handle quantity changes
  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };
  
  // Handle product removal
  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };
  
  // Proceed to checkout
  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      // If not authenticated, redirect to login with return URL
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };
  
  // Clear the cart
  const handleClearCart = () => {
    if (window.confirm('Czy na pewno chcesz opróżnić koszyk?')) {
      clearCart();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Twój koszyk</h1>
      
      {items.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <svg 
            className="mx-auto mb-4 h-16 w-16 text-gray-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
          <h2 className="mb-2 text-xl font-medium text-gray-700">Twój koszyk jest pusty</h2>
          <p className="mb-6 text-gray-500">Dodaj produkty do koszyka, aby kontynuować</p>
          <Link 
            to="/products" 
            className="inline-block rounded-md bg-primary px-6 py-3 text-white hover:bg-primary-dark"
          >
            Przeglądaj produkty
          </Link>
        </div>
      ) : (
        <div className="lg:flex lg:gap-8">
          {/* Product List */}
          <div className="mb-8 lg:mb-0 lg:w-2/3">
            <div className="rounded-lg bg-white shadow-md">
              <div className="p-6">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="pb-4 text-left text-sm font-medium text-gray-500">Produkt</th>
                      <th className="pb-4 text-right text-sm font-medium text-gray-500">Cena</th>
                      <th className="pb-4 text-right text-sm font-medium text-gray-500">Ilość</th>
                      <th className="pb-4 text-right text-sm font-medium text-gray-500">Suma</th>
                      <th className="pb-4 text-right text-sm font-medium text-gray-500">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.productId} className="py-4">
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              {item.product.images && item.product.images.length > 0 ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover object-center"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-500">
                                  Brak zdjęcia
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <Link 
                                to={`/products/${item.productId}`}
                                className="text-sm font-medium text-gray-900 hover:text-primary"
                              >
                                {item.product.name}
                              </Link>
                              <p className="mt-1 text-xs text-gray-500">
                                {item.product.category}
                                {item.product.subcategory && ` › ${item.product.subcategory}`}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Rolnik: {item.product.owner.fullName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-right text-sm font-medium text-gray-900">
                          {formatPrice(item.product.price)}/{item.product.unit}
                        </td>
                        <td className="py-4 text-right">
                          <div className="inline-flex items-center rounded-md border border-gray-300">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="min-w-[40px] text-center text-sm">
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
                        </td>
                        <td className="py-4 text-right text-sm font-medium text-gray-900">
                          {formatPrice(item.product.price * item.quantity)}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-sm font-medium text-red-600 hover:text-red-500"
                          >
                            Usuń
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="border-t border-gray-200 p-6">
                <div className="flex justify-between">
                  <button
                    onClick={handleClearCart}
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    Wyczyść koszyk
                  </button>
                  
                  <Link
                    to="/products"
                    className="text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    Kontynuuj zakupy
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Podsumowanie</h2>
              
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Liczba produktów</span>
                  <span className="font-medium text-gray-900">{totalItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Wartość produktów</span>
                  <span className="font-medium text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dostawa</span>
                  <span className="font-medium text-gray-900">Ustalana przy zamówieniu</span>
                </div>
              </div>
              
              <div className="my-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-medium text-gray-900">Razem</span>
                  <span className="text-lg font-bold text-primary">{formatPrice(totalPrice)}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">* bez kosztów dostawy</p>
              </div>
              
              {/* Special instructions */}
              <div className="mb-4">
                <label htmlFor="order-notes" className="mb-1 block text-sm font-medium text-gray-700">
                  Dodatkowe uwagi (opcjonalnie)
                </label>
                <textarea
                  id="order-notes"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Uwagi do zamówienia..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>
              
              <button
                onClick={handleProceedToCheckout}
                className="w-full rounded-md bg-primary py-3 text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Przejdź do realizacji
              </button>
            </div>
            
            {/* Environmental impact */}
            <div className="mt-4 rounded-lg bg-green-50 p-4">
              <div className="flex items-start">
                <div className="mr-3 flex-shrink-0">
                  <svg className="h-5 w-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.382 1.011a1 1 0 011.236 0l6 4a1 1 0 010 1.578l-6 4a1 1 0 01-1.236 0l-6-4a1 1 0 010-1.578l6-4zM7 7.5L2.618 5 7 2.5 11.382 5 7 7.5zm5.834 6.255a1 1 0 00-1.236 0l-6 4a1 1 0 000 1.578l6 4a1 1 0 001.236 0l6-4a1 1 0 000-1.578l-6-4zM13 17.5L8.618 15 13 12.5 17.382 15 13 17.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-green-800">Ślad węglowy</h3>
                  <p className="mt-1 text-xs text-green-700">
                    Kupując produkty bezpośrednio od lokalnych rolników, zmniejszasz ślad węglowy o około 60% w porównaniu do zakupów w supermarketach.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;