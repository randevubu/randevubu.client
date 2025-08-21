import { apiClient } from '../api';
import { ApiResponse, User } from '../../types/api';

export const userService = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/api/v1/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>('/api/v1/auth/profile', data);
    return response.data;
  },
};