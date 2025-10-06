import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface User {
  id?: number | string;  // SQLite: number, MongoDB: string
  name: string;
  email: string;
  age?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
  message?: string;
}

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
export const userApi = {
  // Get all users
  getAll: async (params?: { limit?: number; offset?: number; orderBy?: string }): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>('/api/users', { params });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch users');
  },

  // Get user by ID
  getById: async (id: number | string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/api/users/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch user');
  },

  // Get user by email
  getByEmail: async (email: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/api/users/email/${email}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch user');
  },

  // Search users by name
  searchByName: async (query: string): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>('/api/users/search/name', {
      params: { q: query },
    });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to search users');
  },

  // Create user
  create: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/api/users', userData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create user');
  },

  // Update user
  update: async (id: number | string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/api/users/${id}`, userData);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update user');
  },

  // Delete user
  delete: async (id: number | string): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/users/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete user');
    }
  },

  // Get user count
  count: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/api/users/stats/count');
    if (response.data.success) {
      return (response.data as any).count || 0;
    }
    throw new Error(response.data.error || 'Failed to get user count');
  },
};

// Health Check
export interface HealthResponse {
  status: string;
  database: {
    type: string;
    provider: string;
    healthy: boolean;
  };
  timestamp: string;
}

export const healthApi = {
  check: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },
};
