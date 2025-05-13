// Typy do tworzenia i zarządzania produktami
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
  
  export interface UpdateProductRequest extends Partial<CreateProductRequest> {
    status?: 'available' | 'preparing' | 'shipped' | 'delivered' | 'unavailable';
    statusNote?: string;
    replaceImages?: boolean;
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
      profileImage?: string;
      location: {
        coordinates: [number, number];
        address: string;
      };
      isVerified: boolean;
    };
    images: string[];
    certificates: {
      _id: string;
      name: string;
      type: string;
      issuingAuthority: string;
      validUntil: Date;
    }[];
    status: string;
    statusHistory: {
      status: string;
      timestamp: Date;
      updatedBy: string;
      note?: string;
    }[];
    location: {
      coordinates: [number, number];
      address: string;
    };
    harvestDate?: Date;
    trackingId: string;
    reviews: string[];
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
  
  export interface ProductListResponse {
    success: boolean;
    products: ProductResponse[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }
  
  export interface ProductDetailResponse {
    success: boolean;
    product: ProductResponse & {
      reviews: {
        _id: string;
        author: {
          _id: string;
          fullName: string;
          profileImage?: string;
        };
        rating: number;
        comment: string;
        createdAt: Date;
      }[];
    };
  }
  
  export interface ProductTrackingResponse {
    success: boolean;
    tracking: {
      product: {
        _id: string;
        name: string;
        description: string;
        category: string;
        subcategory?: string;
        harvestDate?: Date;
        images: string[];
        isCertified: boolean;
      };
      farmer: {
        fullName: string;
        location: {
          coordinates: [number, number];
          address: string;
        };
      };
      certificates: {
        _id: string;
        name: string;
        type: string;
        issuingAuthority: string;
        validUntil: Date;
      }[];
      statusHistory: {
        status: string;
        timestamp: Date;
        updatedBy: string;
        note?: string;
      }[];
    };
  }