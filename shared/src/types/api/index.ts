// Typy dla API - Auth
export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    token: string;
    refreshToken: string;
    user: {
      _id: string;
      email: string;
      fullName: string;
      role: string;
    };
  }
  
  export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    role: 'farmer' | 'consumer';
    phoneNumber: string;
    location: {
      coordinates: [number, number];
      address: string;
    };
  }
  
  export interface RegisterResponse {
    message: string;
    user: {
      _id: string;
      email: string;
      fullName: string;
      role: string;
    };
  }
  
  // Typy dla API - Users
  export interface UpdateUserRequest {
    fullName?: string;
    phoneNumber?: string;
    bio?: string;
    location?: {
      coordinates: [number, number];
      address: string;
    };
  }
  
  // Typy dla API - Products
  export interface CreateProductRequest {
    name: string;
    description: string;
    price: number;
    quantity: number;
    unit: string;
    category: string;
    subcategory?: string;
    certificates?: string[];
    harvestDate?: Date;
    images?: string[];
    location?: {
      coordinates: [number, number];
      address: string;
    };
  }
  
  export interface ProductResponse {
    _id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    unit: string;
    category: string;
    subcategory?: string;
    owner: {
      _id: string;
      fullName: string;
      location: {
        coordinates: [number, number];
        address: string;
      };
    };
    images: string[];
    certificates: string[];
    status: string;
    location: {
      coordinates: [number, number];
      address: string;
    };
    harvestDate?: Date;
    trackingId: string;
    averageRating: number;
    isCertified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface ProductsFilterRequest {
    category?: string;
    subcategory?: string;
    isCertified?: boolean;
    minPrice?: number;
    maxPrice?: number;
    radius?: number;
    coordinates?: [number, number];
    sortBy?: 'price' | 'rating' | 'distance' | 'date';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }
  
  // Typy dla API - Orders
  export interface CreateOrderRequest {
    items: {
      product: string;
      quantity: number;
    }[];
    shippingAddress: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  }
  
  export interface OrderResponse {
    _id: string;
    buyer: {
      _id: string;
      fullName: string;
    };
    items: {
      product: {
        _id: string;
        name: string;
        images: string[];
      };
      quantity: number;
      priceAtPurchase: number;
    }[];
    totalPrice: number;
    status: string;
    shippingAddress: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    deliveryDate?: Date;
    paymentStatus: string;
    carbonFootprint?: number;
    isReviewed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Typy dla API - Reviews
  export interface CreateReviewRequest {
    product?: string;
    farmer?: string;
    rating: number;
    comment: string;
    images?: string[];
  }
  
  export interface ReviewResponse {
    _id: string;
    author: {
      _id: string;
      fullName: string;
      profileImage?: string;
    };
    product?: {
      _id: string;
      name: string;
    };
    farmer?: {
      _id: string;
      fullName: string;
    };
    rating: number;
    comment: string;
    images?: string[];
    createdAt: Date;
  }
  
  // Typy dla API - Certificates
  export interface CreateCertificateRequest {
    name: string;
    type: 'organic' | 'eco' | 'fair-trade' | 'other';
    issuingAuthority: string;
    validUntil: Date;
  }
  
  // Typy dla API - Local Groups
  export interface CreateLocalGroupRequest {
    name: string;
    description: string;
    location: {
      coordinates: [number, number];
      address: string;
    };
    radius: number;
    image?: string;
  }
  
  export interface LocalGroupResponse {
    _id: string;
    name: string;
    description: string;
    location: {
      coordinates: [number, number];
      address: string;
    };
    radius: number;
    members: {
      user: {
        _id: string;
        fullName: string;
        profileImage?: string;
      };
      role: string;
      joinedAt: Date;
    }[];
    products?: {
      _id: string;
      name: string;
      price: number;
      images: string[];
    }[];
    image?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Eksport wszystkich typów API
  export * from './auth.api';
  export * from './user.api';
  export * from './product.api';
  export * from './order.api';
  export * from './review.api';
  export * from './certificate.api';
  export * from './localGroup.api';