// Interface reprezentujący użytkownika w aplikacji
export interface User {
    _id: string;
    email: string;
    fullName: string;
    role: 'farmer' | 'consumer' | 'admin';
    phoneNumber?: string;
    bio?: string;
    profileImage?: string;
    location?: {
      coordinates: [number, number]; // [longitude, latitude]
      address: string;
    };
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Interface dla danych autoryzacyjnych
  export interface AuthResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: User;
  }
  
  // Interface do rejestracji użytkownika
  export interface RegistrationData {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    role: 'farmer' | 'consumer';
    phoneNumber: string;
    location: {
      coordinates: [number, number];
      address: string;
    };
    bio?: string;
  }
  
  // Interface do logowania użytkownika
  export interface LoginData {
    email: string;
    password: string;
    rememberMe?: boolean;
  }