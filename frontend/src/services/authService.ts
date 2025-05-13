import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from 'shared/types/api';
import apiClient from './apiClient';

// Serwis autentykacji
const authService = {
  // Rejestracja użytkownika
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', userData);
    return response.data;
  },
  
  // Logowanie użytkownika
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Zapisz token w localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  // Wylogowanie użytkownika
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    
    // Usuń token i dane użytkownika z localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Weryfikacja adresu email
  verifyEmail: async (token: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.get(`/auth/verify-email/${token}`);
    return response.data;
  },
  
  // Zmiana hasła
  changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data;
  },
  
  // Reset hasła - inicjacja
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  // Reset hasła - potwierdzenie
  resetPassword: async (data: { token: string; newPassword: string; confirmPassword: string }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
  
  // Pobranie profilu użytkownika
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
  
  // Sprawdzenie, czy użytkownik jest zalogowany
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
  
  // Pobranie zalogowanego użytkownika
  getCurrentUser: () => {
    const userString = localStorage.getItem('user');
    if (userString) {
      return JSON.parse(userString);
    }
    return null;
  },
};

export default authService;