import { createContext, ReactNode, useState, useEffect } from 'react';
import authService from '../services/authService';

// Interfejs dla danych użytkownika
interface User {
  _id: string;
  email: string;
  fullName: string;
  role: string;
}

// Interfejs dla kontekstu autentykacji
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: any) => Promise<{ success: boolean; message?: string; data?: any }>;
  logout: () => Promise<{ success: boolean; message?: string }>;
  hasRole: (roles: string | string[]) => boolean;
}

// Domyślne wartości dla kontekstu
const defaultValues: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => ({ success: false }),
  hasRole: () => false,
};

// Utworzenie kontekstu
export const AuthContext = createContext<AuthContextType>(defaultValues);

// Props dla providera kontekstu
interface AuthProviderProps {
  children: ReactNode;
}

// Provider kontekstu autentykacji
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Załaduj użytkownika przy montowaniu komponentu
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Sprawdź, czy użytkownik jest zalogowany
        if (authService.isAuthenticated()) {
          // Pobierz profil użytkownika z API
          const { user } = await authService.getProfile();
          setUser(user);
        }
      } catch (err) {
        // W przypadku błędu (np. wygasły token), wyloguj użytkownika
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('Sesja wygasła. Zaloguj się ponownie.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Funkcja do logowania
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login({ email, password });
      setUser(response.user);
      
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Wystąpił błąd podczas logowania';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do rejestracji
  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      return { success: true, data: response };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Wystąpił błąd podczas rejestracji';
      setError(message);
      return { success: false, message };
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
      
      return { success: true };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Wystąpił błąd podczas wylogowywania';
      setError(message);
      return { success: false, message };
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

  // Wartości kontekstu
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};