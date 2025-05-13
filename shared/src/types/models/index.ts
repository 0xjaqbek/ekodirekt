// Modele użytkowników
export interface IUser {
    _id: string;
    email: string;
    passwordHash: string;
    fullName: string;
    role: 'farmer' | 'consumer' | 'admin';
    phoneNumber: string;
    location: {
      type: 'Point';
      coordinates: [number, number]; // [longitude, latitude]
      address: string;
    };
    bio?: string;
    profileImage?: string;
    certificates?: string[]; // referencje do Certificate
    createdProducts?: string[]; // referencje do Product (dla rolników)
    orders?: string[]; // referencje do Order
    reviews?: string[]; // referencje do Review
    localGroups?: string[]; // referencje do LocalGroup
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Modele produktów
  export interface IProduct {
    _id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    unit: string; // kg, szt, etc.
    category: string;
    subcategory?: string;
    owner: string; // referencja do User (rolnik)
    images: string[]; // URL-e do zdjęć
    certificates: string[]; // referencje do Certificate
    status: 'available' | 'preparing' | 'shipped' | 'delivered' | 'unavailable';
    statusHistory: {
      status: string;
      timestamp: Date;
      updatedBy: string; // referencja do User
      note?: string;
    }[];
    location: {
      type: 'Point';
      coordinates: [number, number];
      address: string;
    };
    harvestDate?: Date;
    trackingId: string; // unikalny identyfikator do śledzenia
    reviews: string[]; // referencje do Review
    averageRating: number;
    isCertified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Modele zamówień
  export interface IOrder {
    _id: string;
    buyer: string; // referencja do User
    items: {
      product: string; // referencja do Product
      quantity: number;
      priceAtPurchase: number;
    }[];
    totalPrice: number;
    status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    statusHistory: {
      status: string;
      timestamp: Date;
      updatedBy: string;
    }[];
    shippingAddress: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    deliveryDate?: Date;
    paymentId?: string; // ID transakcji Stripe
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    carbonFootprint?: number; // obliczony ślad węglowy
    isReviewed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Modele certyfikatów
  export interface ICertificate {
    _id: string;
    name: string;
    type: 'organic' | 'eco' | 'fair-trade' | 'other';
    issuingAuthority: string;
    documentUrl?: string;
    issuedTo: string; // referencja do User (rolnik)
    products?: string[]; // referencje do Product
    isVerified: boolean;
    validUntil: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Modele recenzji
  export interface IReview {
    _id: string;
    author: string; // referencja do User
    product?: string; // referencja do Product
    farmer?: string; // referencja do User (rolnik)
    rating: number; // 1-5
    comment: string;
    images?: string[];
    isVerified: boolean;
    moderationStatus: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Modele grup lokalnych
  export interface ILocalGroup {
    _id: string;
    name: string;
    description: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
      address: string;
    };
    radius: number; // km
    members: {
      user: string; // referencja do User
      role: 'admin' | 'member';
      joinedAt: Date;
    }[];
    products?: string[]; // referencje do Product dostępnych w grupie
    image?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export * from './user.model';
  export * from './product.model';
  export * from './order.model';
  export * from './certificate.model';
  export * from './review.model';
  export * from './localGroup.model';