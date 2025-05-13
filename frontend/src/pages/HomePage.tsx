import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductsStore } from '../stores/productsStore';
import { ProductResponse } from 'shared/types/api';
import ProductCard from '../components/ProductCard';
import { PRODUCT_CATEGORIES } from 'shared/constants';

const HomePage: React.FC = () => {
  const { fetchFeaturedProducts } = useProductsStore();
  const [featuredProducts, setFeaturedProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Pobierz wyróżnione produkty przy ładowaniu strony
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      setLoading(true);
      try {
        const products = await fetchFeaturedProducts();
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Błąd podczas pobierania wyróżnionych produktów:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
                <span className="block">Ekologiczna żywność</span>
                <span className="block text-accent">prosto od rolnika</span>
              </h1>
              <p className="mt-3 text-lg text-white opacity-90 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                EkoDirekt łączy ekologicznych rolników bezpośrednio z konsumentami, 
                skracając łańcuch dostaw i promując zrównoważone rolnictwo.
              </p>
              <div className="mt-8 flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Link 
                  to="/products" 
                  className="rounded-md bg-accent px-8 py-3 text-base font-medium text-white shadow-md hover:bg-accent-dark md:py-4 md:px-10"
                >
                  Przeglądaj produkty
                </Link>
                <Link 
                  to="/register" 
                  className="rounded-md border-2 border-white bg-transparent px-8 py-3 text-base font-medium text-white hover:bg-white hover:bg-opacity-10 md:py-4 md:px-10"
                >
                  Dołącz do nas
                </Link>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:w-1/2">
              <div className="relative h-64 rounded-lg bg-white bg-opacity-10 shadow-lg sm:h-72 md:h-96">
                <img 
                  src="/assets/images/hero-image.jpg" 
                  alt="Świeże ekologiczne produkty" 
                  className="h-full w-full rounded-lg object-cover"
                  onError={(e) => {
                    // Fallback jeśli zdjęcie nie załaduje się
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kategorie produktów */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Odkryj różnorodność ekologicznych produktów
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-xl text-gray-500">
            Wybieraj spośród szerokiego asortymentu certyfikowanych produktów prosto od rolników
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {PRODUCT_CATEGORIES.slice(0, 10).map((category) => (
              <Link 
                key={category}
                to={`/products?category=${category}`} 
                className="group flex flex-col items-center justify-center rounded-lg bg-white p-4 text-center shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-16 w-16 rounded-full bg-primary-light p-3 text-white">
                  {/* Ikony kategorii - tutaj mogą być prawdziwe ikony */}
                  <svg className="h-full w-full" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                    <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-sm font-medium text-gray-900 group-hover:text-primary">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Wyróżnione produkty */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Polecane produkty
              </h2>
              <p className="mt-2 text-gray-600">
                Odkryj najlepsze ekologiczne produkty od naszych certyfikowanych rolników
              </p>
            </div>
            <Link to="/products" className="mt-4 text-primary hover:text-primary-dark sm:mt-0">
              Zobacz wszystkie produkty &rarr;
            </Link>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center shadow">
                <p className="text-gray-500">Brak wyróżnionych produktów.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Jak to działa */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Jak działa EkoDirekt?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-xl text-gray-500">
            Prosty proces łączący rolników z konsumentami
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Krok 1 */}
            <div className="rounded-lg bg-white p-6 text-center shadow-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Wyszukaj produkty</h3>
              <p className="mt-2 text-gray-600">
                Przeglądaj ekologiczne produkty od lokalnych rolników w Twojej okolicy
              </p>
            </div>
            
            {/* Krok 2 */}
            <div className="rounded-lg bg-white p-6 text-center shadow-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Złóż zamówienie</h3>
              <p className="mt-2 text-gray-600">
                Wybierz produkty i złóż zamówienie bezpośrednio u rolnika
              </p>
            </div>
            
            {/* Krok 3 */}
            <div className="rounded-lg bg-white p-6 text-center shadow-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Odbierz produkty</h3>
              <p className="mt-2 text-gray-600">
                Otrzymaj świeże produkty z certyfikatem pochodzenia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Korzyści */}
      <section className="bg-primary-light bg-opacity-10 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2 lg:pr-12">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Dlaczego EkoDirekt?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Nasza platforma oferuje korzyści zarówno dla rolników, jak i konsumentów, 
                wspierając zrównoważone rolnictwo i środowisko naturalne.
              </p>

              <div className="mt-8 space-y-6">
                {/* Korzyść 1 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Bezpośredni kontakt</h3>
                    <p className="mt-1 text-gray-600">
                      Eliminacja pośredników i skrócenie łańcucha dostaw
                    </p>
                  </div>
                </div>

                {/* Korzyść 2 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Gwarancja jakości</h3>
                    <p className="mt-1 text-gray-600">
                      Sprawdzone certyfikaty i śledzenie pochodzenia produktów
                    </p>
                  </div>
                </div>

                {/* Korzyść 3 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Sprawiedliwe ceny</h3>
                    <p className="mt-1 text-gray-600">
                      Uczciwe wynagrodzenie dla rolników i korzystne ceny dla konsumentów
                    </p>
                  </div>
                </div>

                {/* Korzyść 4 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Ochrona środowiska</h3>
                    <p className="mt-1 text-gray-600">
                      Redukcja śladu węglowego i promocja zrównoważonego rolnictwa
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 lg:mt-0 lg:w-1/2">
              <div className="relative h-64 overflow-hidden rounded-lg bg-white shadow-xl sm:h-72 md:h-80 lg:h-96">
                <img 
                  src="/assets/images/benefits-image.jpg" 
                  alt="Organic farming" 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback jeśli zdjęcie nie załaduje się
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Dołącz do ekologicznej rewolucji
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-white text-opacity-90">
              Zarejestruj się już dziś i odkryj świeże, ekologiczne produkty lub zacznij sprzedawać własne wyroby
            </p>
            <div className="mt-8 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Link 
                to="/register?role=consumer" 
                className="inline-flex items-center rounded-md bg-white px-6 py-3 text-base font-medium text-primary shadow-md hover:bg-gray-100"
              >
                Zarejestruj się jako konsument
              </Link>
              <Link 
                to="/register?role=farmer" 
                className="inline-flex items-center rounded-md border-2 border-white bg-transparent px-6 py-3 text-base font-medium text-white hover:bg-white hover:bg-opacity-10"
              >
                Zarejestruj się jako rolnik
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;