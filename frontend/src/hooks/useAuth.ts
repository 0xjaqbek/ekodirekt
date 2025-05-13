import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-hot-toast';
import { RegistrationData, LoginData } from '../types/user';

/**
 * Hook do zarządzania autentykacją w aplikacji
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pobieranie danych ze store'a Zustand
  const { 
    user, 
    token, 
    isAuthenticated, 
    loading, 
    error, 
    login: loginStore, 
    register: registerStore, 
    logout: logoutStore,
    clearError,
    checkAuth,
  } = useAuthStore();

  // Dodatkowy stan lokalny dla formularzy
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Sprawdzanie ważności autentykacji przy montowaniu komponentu
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Czyszczenie błędów przy zmianie strony
  useEffect(() => {
    clearError();
  }, [location.pathname, clearError]);

  /**
   * Logowanie użytkownika
   */
  const login = useCallback(async (data: LoginData) => {
    try {
      setFormSubmitting(true);
      const success = await loginStore(data.email, data.password);
      
      if (success) {
        // Pobierz redirect URL z lokalizacji lub przekieruj na stronę główną
        const from = (location.state as any)?.from?.pathname || '/';
        toast.success('Zalogowano pomyślnie');
        navigate(from, { replace: true });
        return true;
      } else {
        toast.error(error || 'Wystąpił błąd podczas logowania');
        return false;
      }
    } catch (err) {
      toast.error('Wystąpił nieoczekiwany błąd');
      return false;
    } finally {
      setFormSubmitting(false);
    }
  }, [loginStore, navigate, location.state, error]);

  /**
   * Rejestracja użytkownika
   */
  const register = useCallback(async (data: RegistrationData) => {
    try {
      setFormSubmitting(true);
      const success = await registerStore(data);
      
      if (success) {
        toast.success('Rejestracja zakończona pomyślnie. Sprawdź swoją skrzynkę email, aby zweryfikować konto.');
        navigate('/login');
        return true;
      } else {
        toast.error(error || 'Wystąpił błąd podczas rejestracji');
        return false;
      }
    } catch (err) {
      toast.error('Wystąpił nieoczekiwany błąd');
      return false;
    } finally {
      setFormSubmitting(false);
    }
  }, [registerStore, navigate, error]);

  /**
   * Wylogowanie użytkownika
   */
  const logout = useCallback(async () => {
    try {
      setFormSubmitting(true);
      const success = await logoutStore();
      
      if (success) {
        toast.success('Wylogowano pomyślnie');
        navigate('/login');
        return true;
      } else {
        toast.error(error || 'Wystąpił błąd podczas wylogowywania');
        return false;
      }
    } catch (err) {
      toast.error('Wystąpił nieoczekiwany błąd');
      return false;
    } finally {
      setFormSubmitting(false);
    }
  }, [logoutStore, navigate, error]);

  /**
   * Funkcja do sprawdzania, czy użytkownik ma określoną rolę
   */
  const hasRole = useCallback((roles: string | string[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  }, [user]);

  return {
    user,
    token,
    loading: loading || formSubmitting,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    hasRole,
    clearError,
  };
};

export default useAuth;