import { apiClient } from '../api';
import { ApiResponse, ProfileResponse } from '../../types/api';
import { User, UpdateUserData } from '../../types/auth';

export const userService = {
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await apiClient.get<ProfileResponse>('/api/v1/users/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateUserData): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>('/api/v1/users/profile', data);
    return response.data;
  },
};