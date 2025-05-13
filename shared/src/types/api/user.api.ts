// Typy do aktualizacji profilu użytkownika
export interface UpdateUserRequest {
    fullName?: string;
    phoneNumber?: string;
    bio?: string;
    profileImage?: string;
    location?: {
      coordinates?: [number, number];
      address?: string;
    };
  }
  
  // Typ odpowiedzi dla użytkownika (bez wrażliwych danych)
  export interface UserResponse {
    _id: string;
    email: string;
    fullName: string;
    role: string;
    phoneNumber: string;
    location: {
      coordinates: [number, number];
      address: string;
    };
    bio?: string;
    profileImage?: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Typ dla pełnego profilu użytkownika (z relacjami)
  export interface UserProfileResponse extends UserResponse {
    certificates?: any[];
    createdProducts?: any[];
    orders?: any[];
    localGroups?: any[];
  }
  
  // Typy dla listy użytkowników
  export interface UsersListResponse {
    users: UserResponse[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }
  
  // Typy dla aktualizacji roli użytkownika
  export interface UpdateUserRoleRequest {
    userId: string;
    role: 'farmer' | 'consumer' | 'admin';
  }
  
  // Typy dla aktualizacji statusu weryfikacji
  export interface UpdateVerificationStatusRequest {
    userId: string;
    isVerified: boolean;
  }
  
  // Typy dla publicznego profilu użytkownika
  export interface PublicUserProfileResponse {
    _id: string;
    fullName: string;
    role: string;
    bio?: string;
    profileImage?: string;
    location: {
      coordinates: [number, number];
      address: string;
    };
    isVerified: boolean;
    averageRating: number;
    reviewCount: number;
    productCount?: number;
    products?: any[];
    createdAt: Date;
  }