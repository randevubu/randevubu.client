import { apiClient } from '../api';
import { ApiResponse } from '../../types/api';
import {
  customerSearchSchema,
  banCustomerSchema,
  unbanCustomerSchema,
  flagCustomerSchema,
  addStrikeSchema,
  updateCustomerProfileSchema
} from '../validation/customers';
import { z } from 'zod';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  profilePicture?: string;
  isActive: boolean;
  // Ban status fields (available in list view)
  isBanned?: boolean;
  bannedUntil?: string | null;
  currentStrikes?: number;
}

export interface CustomerDetails extends Customer {
  avatar: string;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowCount: number;
  reliabilityScore: number;
  lastAppointmentDate?: string;
  status: 'active' | 'banned' | 'flagged';
  strikes?: Strike[];
  flags?: Flag[];
  adminNotes?: string;
  tags?: string[];
  // New ban-related fields from backend
  isBanned: boolean;
  bannedUntil?: string | null;
  banReason?: string | null;
  currentStrikes: number;
}

export interface Strike {
  id: string;
  reason: string;
  severity: 'minor' | 'major' | 'severe';
  category: 'no_show' | 'late_cancellation' | 'inappropriate_behavior' | 'policy_violation' | 'other';
  createdAt: string;
  expiresAt?: string;
  appointmentId?: string;
  additionalNotes?: string;
}

export interface Flag {
  id: string;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'inappropriate_behavior' | 'spam' | 'fake_bookings' | 'payment_issues' | 'harassment' | 'fraud_suspicion' | 'other';
  createdAt: string;
  additionalDetails?: string;
  requiresReview: boolean;
  resolved?: boolean;
  resolvedAt?: string;
}

export interface CustomersResponse {
  customers: Customer[];
  total: number;
  page: number;
  totalPages: number;
}

// Use Zod schema types
export type GetCustomersParams = z.infer<typeof customerSearchSchema>;

export type BanCustomerRequest = z.infer<typeof banCustomerSchema>;
export type UnbanCustomerRequest = z.infer<typeof unbanCustomerSchema>;
export type FlagCustomerRequest = z.infer<typeof flagCustomerSchema>;
export type AddStrikeRequest = z.infer<typeof addStrikeSchema>;
export type UpdateCustomerProfileRequest = z.infer<typeof updateCustomerProfileSchema>;

export const customerService = {
  getMyCustomers: async (params: Partial<GetCustomersParams> = {}): Promise<ApiResponse<CustomersResponse>> => {
    // Validate parameters with defaults
    const validParams = customerSearchSchema.parse({
      page: 1,
      limit: 50,
      status: 'all',
      ...params
    });
    
    const queryParams = new URLSearchParams();
    
    if (validParams.search) queryParams.append('search', validParams.search);
    if (validParams.page) queryParams.append('page', validParams.page.toString());
    if (validParams.limit) queryParams.append('limit', validParams.limit.toString());
    if (validParams.status) queryParams.append('status', validParams.status);
    if (validParams.sortBy) queryParams.append('sortBy', validParams.sortBy);
    if (validParams.sortOrder) queryParams.append('sortOrder', validParams.sortOrder);

    const response = await apiClient.get<ApiResponse<CustomersResponse>>(
      `/api/v1/users/my-customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
  },

  getCustomerDetails: async (customerId: string): Promise<ApiResponse<CustomerDetails>> => {
    const response = await apiClient.get<ApiResponse<CustomerDetails>>(
      `/api/v1/users/customers/${customerId}`
    );
    return response.data;
  },

  banCustomer: async (customerId: string, banData: BanCustomerRequest): Promise<ApiResponse<void>> => {
    // Validate ban data
    const validBanData = banCustomerSchema.parse(banData);
    
    
    const response = await apiClient.post<ApiResponse<void>>(
      `/api/v1/users/customers/${customerId}/ban`,
      validBanData
    );
    return response.data;
  },

  unbanCustomer: async (customerId: string, unbanData: UnbanCustomerRequest): Promise<ApiResponse<void>> => {
    const validUnbanData = unbanCustomerSchema.parse(unbanData);
    
    const response = await apiClient.post<ApiResponse<void>>(
      `/api/v1/users/customers/${customerId}/unban`,
      validUnbanData
    );
    return response.data;
  },

  flagCustomer: async (customerId: string, flagData: FlagCustomerRequest): Promise<ApiResponse<void>> => {
    const validFlagData = flagCustomerSchema.parse(flagData);
    
    const response = await apiClient.post<ApiResponse<void>>(
      `/api/v1/users/customers/${customerId}/flag`,
      validFlagData
    );
    return response.data;
  },

  addStrike: async (customerId: string, strikeData: AddStrikeRequest): Promise<ApiResponse<void>> => {
    const validStrikeData = addStrikeSchema.parse(strikeData);
    
    const response = await apiClient.post<ApiResponse<void>>(
      `/api/v1/users/customers/${customerId}/strikes`,
      validStrikeData
    );
    return response.data;
  },

  updateCustomerProfile: async (customerId: string, profileData: UpdateCustomerProfileRequest): Promise<ApiResponse<CustomerDetails>> => {
    const validProfileData = updateCustomerProfileSchema.parse(profileData);
    
    const response = await apiClient.patch<ApiResponse<CustomerDetails>>(
      `/api/v1/users/customers/${customerId}`,
      validProfileData
    );
    return response.data;
  },
};