import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authService from '@/services/authService';
import { User } from '@/types/user';

// Interface dla stanu autentykacji
interface AuthState {
  // Stan
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Akcje
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
}

// Tworzenie sklepu autentykacji z persystencją
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Stan początkowy
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      
      // Akcje
      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          
          const response = await authService.login({ email, password });
          
          if (response.success) {
            set({ 
              user: response.user, 
              token: response.token, 
              isAuthenticated: true,
              loading: false 
            });
            return true;
          } else {
            set({ error: response.message || 'Błąd logowania', loading: false });
            return false;
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Wystąpił błąd podczas logowania', 
            loading: false 
          });
          return false;
        }
      },
      
      register: async (userData: any) => {
        try {
          set({ loading: true, error: null });
          
          const response = await authService.register(userData);
          
          if (response.success) {
            set({ loading: false });
            return true;
          } else {
            set({ 
              error: response.message || 'Błąd rejestracji', 
              loading: false 
            });
            return false;
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Wystąpił błąd podczas rejestracji', 
            loading: false 
          });
          return false;
        }
      },
      
      logout: async () => {
        try {
          set({ loading: true });
          
          await authService.logout();
          
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            loading: false 
          });
          return true;
        } catch (error: any) {
          set({ 
            error: error.message || 'Wystąpił błąd podczas wylogowywania', 
            loading: false 
          });
          return false;
        }
      },
      
      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        
        if (user) {
          // Aktualizujemy tylko przekazane pola
          set({ user: { ...user, ...userData } });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          set({ isAuthenticated: false });
          return false;
        }
        
        try {
          set({ loading: true });
          
          // Sprawdzamy czy token jest ważny pobierając profil użytkownika
          const response = await authService.getProfile();
          
          if (response.success) {
            set({ 
              user: response.user, 
              isAuthenticated: true,
              loading: false 
            });
            return true;
          } else {
            // Token wygasł lub jest nieprawidłowy
            set({ 
              user: null, 
              token: null, 
              isAuthenticated: false,
              loading: false 
            });
            return false;
          }
        } catch (error) {
          // Błąd autoryzacji - wyloguj użytkownika
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            loading: false 
          });
          return false;
        }
      }
    }),
    {
      name: 'ekodirekt-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Hook do sprawdzania i odświeżania autentykacji przy starcie aplikacji
export const useAuthCheck = () => {
  const checkAuth = useAuthStore(state => state.checkAuth);
  
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);
};