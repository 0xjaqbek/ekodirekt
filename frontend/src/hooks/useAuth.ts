import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

// Interfejs dla danych zalogowanego użytkownika
interface AuthUser {
  _id: string;
  email: string;
  fullName: string;
  role: string;
}

// Hook do zarządzania stanem autentykacji
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Załaduj użytkownika przy montowaniu komponentu
  useEffect(() => {
    const loadUser = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    loadUser();
  }, []);

  // Funkcja do logowania
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      setUser(response.user);
      
      // Przekieruj na stronę główną lub poprzednią stronę
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Wystąpił błąd podczas logowania',
      };
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do rejestracji
  const register = async (userData: any) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      return { success: true, data: response };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Wystąpił błąd podczas rejestracji',
      };
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do wylogowania
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      navigate('/login');
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Wystąpił błąd podczas wylogowywania' };
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do sprawdzania, czy użytkownik ma określoną rolę
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  };

  return {
    user,
    loading,
    login,
    logout,
    register,
    hasRole,
    isAuthenticated: !!user,
  };
};