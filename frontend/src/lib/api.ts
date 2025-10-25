import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { ApiResponse, PaginatedResponse } from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'https://balemuya-2.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't retry for auth endpoints or if already retried
    if (error.response?.status === 401 && 
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/')) {
      
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await authApi.post('/auth/refresh', {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          // No refresh token, redirect to login
          handleLogout();
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        handleLogout();
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle logout
const handleLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Only redirect if we're not already on a login page
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
};

// Create separate instance for auth endpoints (no interceptors)
const authApi: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'https://balemuya-2.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API methods
export const apiClient = {
  // Auth endpoints
  auth: {
    login: (data: { email: string; password: string }) =>
      authApi.post<ApiResponse<{ user: any; accessToken: string; refreshToken: string }>>('/auth/login', data),
    
    register: (data: any) =>
      authApi.post<ApiResponse<{ user: any; accessToken: string; refreshToken: string }>>('/auth/register', data),
    
    forgotPassword: (data: { email: string }) =>
      authApi.post<ApiResponse<null>>('/auth/forgot-password', data),
    
    resetPassword: (data: { token: string; password: string }) =>
      authApi.post<ApiResponse<null>>('/auth/reset-password', data),
    
    verifyEmail: (data: { token: string }) =>
      authApi.post<ApiResponse<null>>('/auth/verify-email', data),
    
    refreshToken: (data: { refreshToken: string }) =>
      authApi.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', data),
  },

  // User endpoints
  users: {
    getProfile: () =>
      api.get<ApiResponse<any>>('/users/profile'),
    
    updateProfile: (data: any) =>
      api.put<ApiResponse<any>>('/users/profile', data),
    
    getSellerStats: () =>
      api.get<ApiResponse<any>>('/users/seller-stats'),
    
    submitKYC: (data: any) =>
      api.post<ApiResponse<any>>('/users/kyc', data),
    
    getStorefront: (storeName: string) =>
      api.get<ApiResponse<any>>(`/users/storefront/${storeName}`),
  },

  // Product endpoints
  products: {
    getAll: (params?: any) =>
      api.get<PaginatedResponse<any>>('/products', { params }),
    
    getById: (id: string) =>
      api.get<ApiResponse<any>>(`/products/${id}`),
    
    getBySeller: (sellerId: string, params?: any) =>
      api.get<PaginatedResponse<any>>(`/products/seller/${sellerId}`, { params }),
    
    getByCategory: (categoryId: string, params?: any) =>
      api.get<PaginatedResponse<any>>(`/products/category/${categoryId}`, { params }),
    
    create: (data: any) =>
      api.post<ApiResponse<any>>('/products', data),
    
    update: (id: string, data: any) =>
      api.put<ApiResponse<any>>(`/products/${id}`, data),
    
    delete: (id: string) =>
      api.delete<ApiResponse<null>>(`/products/${id}`),
  },

  // Order endpoints
  orders: {
    getAll: (params?: any) =>
      api.get<PaginatedResponse<any>>('/orders', { params }),
    
    getById: (id: string) =>
      api.get<ApiResponse<any>>(`/orders/${id}`),
    
    create: (data: any) =>
      api.post<ApiResponse<any>>('/orders', data),
    
    updateStatus: (id: string, data: { status: string }) =>
      api.put<ApiResponse<any>>(`/orders/${id}/status`, data),
    
    cancel: (id: string, data: { reason: string }) =>
      api.put<ApiResponse<any>>(`/orders/${id}/cancel`, data),
  },

  // Payment endpoints
  payments: {
    initialize: (data: any) =>
      api.post<ApiResponse<any>>('/payments/initialize', data),
    
    verify: (data: any) =>
      api.post<ApiResponse<any>>('/payments/verify', data),
    
    getByOrder: (orderId: string) =>
      api.get<ApiResponse<any>>(`/payments/order/${orderId}`),
  },

  // Review endpoints
  reviews: {
    create: (data: any) =>
      api.post<ApiResponse<any>>('/reviews', data),
    
    getByProduct: (productId: string, params?: any) =>
      api.get<PaginatedResponse<any>>(`/reviews/product/${productId}`, { params }),
    
    getBySeller: (sellerId: string, params?: any) =>
      api.get<PaginatedResponse<any>>(`/reviews/seller/${sellerId}`, { params }),
    
    update: (id: string, data: any) =>
      api.put<ApiResponse<any>>(`/reviews/${id}`, data),
    
    delete: (id: string) =>
      api.delete<ApiResponse<null>>(`/reviews/${id}`),
  },

  // Wishlist endpoints
  wishlist: {
    getAll: () =>
      api.get<ApiResponse<any[]>>('/wishlist'),
    
    add: (data: { productId: string }) =>
      api.post<ApiResponse<any>>('/wishlist', data),
    
    remove: (productId: string) =>
      api.delete<ApiResponse<null>>(`/wishlist/${productId}`),
  },

  // Chat endpoints
  chats: {
    getAll: () =>
      api.get<ApiResponse<any[]>>('/chats'),
    
    getById: (id: string) =>
      api.get<ApiResponse<any>>(`/chats/${id}`),
    
    create: (data: { participantId: string }) =>
      api.post<ApiResponse<any>>('/chats', data),
    
    getMessages: (chatId: string, params?: any) =>
      api.get<PaginatedResponse<any>>(`/chats/${chatId}/messages`, { params }),
    
    sendMessage: (chatId: string, data: any) =>
      api.post<ApiResponse<any>>(`/chats/${chatId}/messages`, data),
  },

  // Upload endpoints
  upload: {
    image: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');
      
      return api.post<ApiResponse<{ url: string }>>('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    
    video: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'video');
      
      return api.post<ApiResponse<{ url: string }>>('/upload/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },

  // Admin endpoints
  admin: {
    getUsers: (params?: any) =>
      api.get<PaginatedResponse<any>>('/admin/users', { params }),
    
    suspendUser: (id: string) =>
      api.put<ApiResponse<null>>(`/admin/users/${id}/suspend`),
    
    activateUser: (id: string) =>
      api.put<ApiResponse<null>>(`/admin/users/${id}/activate`),
    
    getKYCApplications: (params?: any) =>
      api.get<PaginatedResponse<any>>('/admin/kyc', { params }),
    
    approveKYC: (id: string) =>
      api.put<ApiResponse<null>>(`/admin/kyc/${id}/approve`),
    
    rejectKYC: (id: string, data: { reason: string }) =>
      api.put<ApiResponse<null>>(`/admin/kyc/${id}/reject`, data),
    
    getOrders: (params?: any) =>
      api.get<PaginatedResponse<any>>('/admin/orders', { params }),
    
    getAnalytics: () =>
      api.get<ApiResponse<any>>('/admin/analytics'),
  },
};

export default api;
