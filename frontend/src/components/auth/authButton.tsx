import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useResetStores } from '@/stores/provider';

/**
 * Komponent przycisku logowania/profilu użytkownika
 */
const AuthButton: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const resetStores = useResetStores();

  // Obsługa kliknięcia poza menu
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMenuOpen]);

  // Obsługa wylogowania
  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      // Resetuj wszystkie sklepy
      resetStores();
      navigate('/');
    }
  };

  // Jeśli nie jest zalogowany, pokaż przycisk logowania
  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
      >
        Logowanie
      </Link>
    );
  }

  // Jeśli zalogowany, pokaż menu profilu
  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center text-sm focus:outline-none"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <div className="flex items-center">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.fullName}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary-light text-white flex items-center justify-center">
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="ml-2 text-gray-700 hidden md:inline-block">{user?.fullName}</span>
          <svg
            className="h-5 w-5 text-gray-400 ml-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {/* Menu rozwijane */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>

          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Twój profil
          </Link>

          {user?.role === 'farmer' && (
            <Link
              to="/dashboard/products"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Panel rolnika
            </Link>
          )}

          {user?.role === 'consumer' && (
            <Link
              to="/orders"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Twoje zamówienia
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Panel administratora
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Wyloguj się
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthButton;