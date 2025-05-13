import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuth } from '../hooks/useAuth';
import { formatPrice } from 'shared/utils';

// Interfejs dla danych formularza
interface CheckoutFormData {
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'card' | 'transfer' | 'cash';
  notes: string;
}

// Interfejs dla błędów walidacji
interface ValidationErrors {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  paymentMethod?: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPrice, totalItems, clearCart } = useCartStore();
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    shippingAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Polska',
    },
    paymentMethod: 'card',
    notes: '',
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingFee, setProcessingFee] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(15.00); // Standardowa opłata za dostawę
  const [carbonFootprint, setCarbonFootprint] = useState<number | null>(null);
  
  // Sprawdź, czy koszyk jest pusty
  useEffect(() => {
    if (totalItems === 0) {
      navigate('/cart');
    }
  }, [totalItems, navigate]);
  
  // Aktualizuj opłatę za przetwarzanie na podstawie metody płatności
  useEffect(() => {
    switch (formData.paymentMethod) {
      case 'card':
        setProcessingFee(totalPrice * 0.02); // 2% opłaty za kartę
        break;
      case 'transfer':
        setProcessingFee(5.00); // Stała opłata za przelew
        break;
      case 'cash':
        setProcessingFee(0); // Brak opłaty za płatność gotówką
        break;
      default:
        setProcessingFee(0);
    }
  }, [formData.paymentMethod, totalPrice]);
  
  // Oblicz ślad węglowy (uproszczone dla MVP)
  useEffect(() => {
    // W prawdziwej implementacji powinno to być obliczane na podstawie danych produktów i odległości
    const estimatedFootprint = items.reduce((sum, item) => {
      // Zakładamy, że każdy produkt ma przypisany ślad węglowy na kilogram
      const baseFootprint = 0.5; // kg CO2 / kg produktu
      return sum + (baseFootprint * item.quantity);
    }, 0);
    
    setCarbonFootprint(estimatedFootprint);
  }, [items]);
  
  // Obsługa zmiany pól formularza
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'paymentMethod') {
      setFormData({ ...formData, paymentMethod: value as 'card' | 'transfer' | 'cash' });
    } else if (name === 'notes') {
      setFormData({ ...formData, notes: value });
    } else {
      // Pola adresu dostawy
      setFormData({
        ...formData,
        shippingAddress: {
          ...formData.shippingAddress,
          [name]: value,
        },
      });
    }
    
    // Usuń błąd dla zmienionego pola
    if (errors[name as keyof ValidationErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };
  
  // Walidacja formularza
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Walidacja adresu
    if (!formData.shippingAddress.street.trim()) {
      newErrors.street = 'Ulica jest wymagana';
    }
    
    if (!formData.shippingAddress.city.trim()) {
      newErrors.city = 'Miasto jest wymagane';
    }
    
    if (!formData.shippingAddress.postalCode.trim()) {
      newErrors.postalCode = 'Kod pocztowy jest wymagany';
    } else if (!/^\d{2}-\d{3}$/.test(formData.shippingAddress.postalCode)) {
      newErrors.postalCode = 'Nieprawidłowy format kodu pocztowego (XX-XXX)';
    }
    
    if (!formData.shippingAddress.country.trim()) {
      newErrors.country = 'Kraj jest wymagany';
    }
    
    // Walidacja metody płatności
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Metoda płatności jest wymagana';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Obsługa złożenia zamówienia
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Przygotuj dane zamówienia
      const orderData = {
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };
      
      // W rzeczywistej implementacji, tutaj byłoby wywołanie API
      console.log('Składanie zamówienia:', orderData);
      
      // Symulacja opóźnienia API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Sukces - wyczyść koszyk i przejdź do potwierdzenia
      clearCart();
      navigate('/orders?success=true');
    } catch (error) {
      console.error('Błąd podczas składania zamówienia:', error);
      alert('Wystąpił błąd podczas składania zamówienia. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Suma zamówienia
  const orderTotal = totalPrice + processingFee + deliveryFee;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Finalizacja zamówienia</h1>
      
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Formularz zamówienia - 2/3 szerokości na dużych ekranach */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Adres dostawy */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Adres dostawy</h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Ulica i numer
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.shippingAddress.street}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                      errors.street ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.street && (
                    <p className="mt-1 text-sm text-red-600">{errors.street}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    Miasto
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.shippingAddress.city}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                      errors.city ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    Kod pocztowy
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    placeholder="XX-XXX"
                    value={formData.shippingAddress.postalCode}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                      errors.postalCode ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Kraj
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.shippingAddress.country}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
                      errors.country ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Metoda płatności */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Metoda płatności</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="card"
                    name="paymentMethod"
                    type="radio"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
                    Karta płatnicza (+2% opłaty)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="transfer"
                    name="paymentMethod"
                    type="radio"
                    value="transfer"
                    checked={formData.paymentMethod === 'transfer'}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="transfer" className="ml-3 block text-sm font-medium text-gray-700">
                    Przelew bankowy (+5 PLN opłaty)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="cash"
                    name="paymentMethod"
                    type="radio"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="cash" className="ml-3 block text-sm font-medium text-gray-700">
                    Płatność przy odbiorze
                  </label>
                </div>
                
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
                )}
              </div>
            </div>
            
            {/* Dodatkowe uwagi */}
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Dodatkowe uwagi</h2>
              
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Dodatkowe informacje dla rolnika lub dotyczące dostawy..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
          </form>
        </div>
        
        {/* Podsumowanie zamówienia - 1/3 szerokości na dużych ekranach */}
        <div className="mt-8 lg:mt-0">
          <div className="sticky top-8 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Podsumowanie zamówienia</h2>
            
            {/* Lista produktów */}
            <div className="mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="mb-3 flex items-center border-b border-gray-100 pb-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                        Brak zdjęcia
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-3 flex-grow">
                    <h3 className="text-sm font-medium">{item.product.name}</h3>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x {formatPrice(item.product.price)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Podsumowanie kosztów */}
            <div className="space-y-2 border-b border-gray-200 pb-4">
              <div className="flex justify-between text-sm">
                <span>Wartość produktów:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Koszt dostawy:</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Opłata transakcyjna:</span>
                <span>{formatPrice(processingFee)}</span>
              </div>
              
              {carbonFootprint !== null && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Ślad węglowy:</span>
                  <span>{carbonFootprint.toFixed(2)} kg CO₂</span>
                </div>
              )}
            </div>
            
            {/* Suma do zapłaty */}
            <div className="mt-4 flex justify-between text-lg font-bold">
              <span>Razem do zapłaty:</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>
            
            {/* Przycisk złożenia zamówienia */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || totalItems === 0}
              className="mt-6 w-full rounded-md bg-primary py-3 text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Przetwarzanie...' : 'Złóż zamówienie'}
            </button>
            
            {/* Dodatkowe informacje */}
            <p className="mt-4 text-xs text-gray-500">
              Składając zamówienie, akceptujesz {' '}
              <a href="/terms" className="text-primary hover:underline">
                regulamin sklepu
              </a>{' '}
              oraz{' '}
              <a href="/privacy" className="text-primary hover:underline">
                politykę prywatności
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;