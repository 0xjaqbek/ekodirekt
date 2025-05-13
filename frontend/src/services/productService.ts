import { CreateProductRequest, ProductResponse, ProductsFilterRequest } from 'shared/types/api';
import apiClient from './apiClient';

// Serwis zarządzania produktami
const productService = {
  /**
   * Pobiera listę produktów z filtrowaniem
   */
  getProducts: async (params?: ProductsFilterRequest & { search?: string }) => {
    const queryParams = new URLSearchParams();
    
    // Dodaj parametry do zapytania
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Dla tablic - np. coordinates
            queryParams.append(key, JSON.stringify(value));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await apiClient.get(`/products?${queryParams.toString()}`);
    return response.data;
  },
  
  /**
   * Pobiera szczegóły produktu po ID
   */
  getProductById: async (productId: string) => {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  },
  
  /**
   * Dodaje nowy produkt
   */
  createProduct: async (productData: FormData) => {
    const response = await apiClient.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  /**
   * Aktualizuje produkt
   */
  updateProduct: async (productId: string, productData: FormData) => {
    const response = await apiClient.put(`/products/${productId}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  /**
   * Aktualizuje produkt (dane JSON)
   */
  updateProductJson: async (productId: string, productData: Partial<CreateProductRequest>) => {
    const response = await apiClient.put(`/products/${productId}`, productData);
    return response.data;
  },
  
  /**
   * Usuwa produkt
   */
  deleteProduct: async (productId: string) => {
    const response = await apiClient.delete(`/products/${productId}`);
    return response.data;
  },
  
  /**
   * Aktualizuje status produktu
   */
  updateProductStatus: async (productId: string, status: string, note?: string) => {
    const response = await apiClient.put(`/products/${productId}/status`, { status, note });
    return response.data;
  },
  
  /**
   * Dodaje zdjęcia do produktu
   */
  addProductImages: async (productId: string, images: File[]) => {
    const formData = new FormData();
    
    // Dodaj zdjęcia do formularza
    images.forEach(image => {
      formData.append('images', image);
    });
    
    const response = await apiClient.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  /**
   * Usuwa zdjęcie z produktu
   */
  removeProductImage: async (productId: string, imageUrl: string) => {
    const response = await apiClient.delete(`/products/${productId}/images`, {
      data: { imageUrl }
    });
    return response.data;
  },
  
  /**
   * Pobiera historię śledzenia produktu
   */
  getProductTracking: async (trackingId: string) => {
    const response = await apiClient.get(`/products/tracking/${trackingId}`);
    return response.data;
  },
  
  /**
   * Pobiera produkty danego rolnika
   */
  getFarmerProducts: async (farmerId: string, page = 1, limit = 12, status?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    
    const response = await apiClient.get(`/products/farmer/${farmerId}?${params.toString()}`);
    return response.data;
  },
  
  /**
   * Pobiera produkty w pobliżu
   */
  getNearbyProducts: async (latitude: number, longitude: number, radius: number = 50, category?: string) => {
    const params = new URLSearchParams();
    params.append('latitude', latitude.toString());
    params.append('longitude', longitude.toString());
    params.append('radius', radius.toString());
    if (category) params.append('category', category);
    
    const response = await apiClient.get(`/products/nearby?${params.toString()}`);
    return response.data;
  },
  
  /**
   * Wyszukuje produkty
   */
  searchProducts: async (query: string, filters?: Partial<ProductsFilterRequest>) => {
    const params = new URLSearchParams();
    params.append('search', query);
    
    // Dodaj filtry do zapytania
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Dla tablic - np. coordinates
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await apiClient.get(`/products?${params.toString()}`);
    return response.data;
  },
};

export default productService;