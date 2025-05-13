import axios from 'axios';

// Bazowy URL dla API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance z domyślnymi ustawieniami
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Automatycznie dołącza ciasteczka do żądań
});

// Interceptor do dodawania token JWT do nagłówków
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor do odświeżania tokenu gdy wygaśnie
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Jeśli błąd 401 i nie jest to żądanie odświeżenia tokenu
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      originalRequest._retry = true;
      
      try {
        // Próba odświeżenia tokenu
        const response = await apiClient.post('/auth/refresh-token');
        const newToken = response.data.token;
        
        // Zapisz nowy token
        localStorage.setItem('token', newToken);
        
        // Aktualizuj nagłówek Authorization
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        // Ponów oryginalne żądanie z nowym tokenem
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Jeśli odświeżenie tokenu nie powiodło się, wyloguj użytkownika
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;