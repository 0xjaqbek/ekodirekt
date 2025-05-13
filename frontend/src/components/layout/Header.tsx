import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCartStore } from '../../stores/cartStore';
import AuthButton from '../auth/authButton';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const { totalItems, openCart } = useCartStore();
  const location = useLocation();

  // Zamknij menu mobilne po zmianie ścieżki
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Dodaj cień do nagłówka po przewinięciu strony
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`sticky top-0 z-30 w-full bg-white transition-shadow ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">EkoDirekt</span>
            </Link>
          </div>

          {/* Nawigacja - desktop */}
          <nav className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-primary'
                }`
              }
            >
              Strona główna
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-primary'
                }`
              }
            >
              Produkty
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-primary'
                }`
              }
            >
              O nas
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-primary'
                }`
              }
            >
              Kontakt
            </NavLink>
            
            {user && user.role === 'farmer' && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium ${
                    isActive || location.pathname.startsWith('/dashboard')
                      ? 'text-primary'
                      : 'text-gray-600 hover:text-primary'
                  }`
                }
              >
                Panel rolnika
              </NavLink>
            )}
          </nav>

          {/* Przyciski akcji - desktop */}
          <div className="hidden items-center md:flex md:space-x-4">
            {/* Przycisk koszyka */}
            {user && (
              <button
                onClick={openCart}
                className="relative rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-primary"
                aria-label="Koszyk"
              >
                <svg
                  className="h-6 w-6"
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
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                    {totalItems}
                  </span>
                )}
              </button>
            )}

            {/* Komponent przycisków logowania/profilu */}
            <AuthButton />
          </div>

          {/* Przycisk menu mobilnego */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-primary focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg
                className={`h-6 w-6 ${isOpen ? 'hidden' : 'block'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`h-6 w-6 ${isOpen ? 'block' : 'hidden'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobilne */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="space-y-1 px-2 pb-3 pt-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-base font-medium ${
                isActive
                  ? 'bg-primary-light text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
              }`
            }
          >
            Strona główna
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-base font-medium ${
                isActive
                  ? 'bg-primary-light text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
              }`
            }
          >
            Produkty
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-base font-medium ${
                isActive
                  ? 'bg-primary-light text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
              }`
            }
          >
            O nas
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-base font-medium ${
                isActive
                  ? 'bg-primary-light text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
              }`
            }
          >
            Kontakt
          </NavLink>
          
          {user && user.role === 'farmer' && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-base font-medium ${
                  isActive || location.pathname.startsWith('/dashboard')
                    ? 'bg-primary-light text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                }`
              }
            >
              Panel rolnika
            </NavLink>
          )}
          
          {user && (
            <button
              onClick={() => {
                openCart();
                setIsOpen(false);
              }}
              className="flex w-full items-center rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-primary"
            >
              <span>Koszyk</span>
              {totalItems > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                  {totalItems}
                </span>
              )}
            </button>
          )}
          
          {!user ? (
            <>
              <Link
                to="/login"
                className="block rounded-md bg-primary px-3 py-2 text-base font-medium text-white hover:bg-primary-dark"
              >
                Logowanie
              </Link>
              <Link
                to="/register"
                className="mt-1 block rounded-md border border-primary px-3 py-2 text-base font-medium text-primary hover:bg-gray-50"
              >
                Rejestracja
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/profile"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-primary"
              >
                Mój profil
              </Link>
              <Link
                to="/orders"
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-primary"
              >
                Moje zamówienia
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;