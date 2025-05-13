import axios from 'axios';
import { 
  UserResponse, 
  UserProfileResponse, 
  UsersListResponse, 
  UpdateUserRequest, 
  UpdateUserRoleRequest, 
  UpdateVerificationStatusRequest, 
  PublicUserProfileResponse 
} from 'shared/types/api';

// Bazowy URL dla API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance z konfiguracji authService
import apiClient from './apiClient';

// Serwis użytkowników
const userService = {
  /**
   * Pobiera listę wszystkich użytkowników (tylko dla administratorów)
   */
  getAllUsers: async (
    page = 1, 
    limit = 10, 
    role?: string, 
    search?: string
  ): Promise<UsersListResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    
    const response = await apiClient.get(`/users?${params.toString()}`);
    return response.data;
  },

  /**
   * Pobiera profil zalogowanego użytkownika
   */
  getMyProfile: async (): Promise<{ success: boolean; user: UserProfileResponse }> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  /**
   * Aktualizuje profil zalogowanego użytkownika
   */
  updateProfile: async (data: UpdateUserRequest): Promise<{ success: boolean; message: string; user: UserResponse }> => {
    const response = await apiClient.put('/users/me', data);
    return response.data;
  },

  /**
   * Pobiera dane użytkownika po ID
   */
  getUserById: async (userId: string): Promise<{ success: boolean; user: UserResponse }> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Pobiera publiczny profil użytkownika
   */
  getPublicProfile: async (userId: string): Promise<{ success: boolean; profile: PublicUserProfileResponse }> => {
    const response = await apiClient.get(`/users/public/${userId}`);
    return response.data;
  },

  /**
   * Aktualizuje rolę użytkownika (tylko dla administratorów)
   */
  updateUserRole: async (data: UpdateUserRoleRequest): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put('/users/role', data);
    return response.data;
  },

  /**
   * Aktualizuje status weryfikacji użytkownika (tylko dla administratorów)
   */
  updateVerificationStatus: async (data: UpdateVerificationStatusRequest): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put('/users/verify', data);
    return response.data;
  },

  /**
   * Dezaktywuje konto użytkownika
   */
  deactivateAccount: async (userId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  /**
   * Wyszukuje użytkowników po frazie (np. rolników po nazwie)
   */
  searchUsers: async (query: string, role?: string): Promise<UsersListResponse> => {
    const params = new URLSearchParams();
    params.append('search', query);
    if (role) params.append('role', role);
    
    const response = await apiClient.get(`/users?${params.toString()}`);
    return response.data;
  },
  
  /**
   * Pobiera rolników w pobliżu (na podstawie lokalizacji)
   */
  getFarmersNearby: async (
    latitude: number, 
    longitude: number, 
    radius: number = 50,
    page = 1,
    limit = 10
  ): Promise<UsersListResponse> => {
    const params = new URLSearchParams();
    params.append('lat', latitude.toString());
    params.append('lng', longitude.toString());
    params.append('radius', radius.toString());
    params.append('role', 'farmer');
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await apiClient.get(`/users?${params.toString()}`);
    return response.data;
  },
};

export default userService;