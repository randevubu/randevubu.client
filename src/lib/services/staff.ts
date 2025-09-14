import { apiClient } from '../api';
import { ApiResponse } from '../../types/api';
import {
  Staff,
  StaffInviteRequest,
  StaffInviteVerificationRequest,
  StaffUpdateRequest,
  StaffWithUser,
  StaffListResponse
} from '../../types/staff';

export const staffService = {
  // Invite a new staff member
  inviteStaff: async (data: StaffInviteRequest): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>('/api/v1/staff/invite', data);
    return response.data;
  },

  // Verify staff invitation with SMS code
  verifyStaffInvitation: async (data: StaffInviteVerificationRequest): Promise<ApiResponse<Staff>> => {
    const response = await apiClient.post<ApiResponse<Staff>>('/api/v1/staff/verify-invitation', data);
    return response.data;
  },

  // Get all staff for a business (authenticated endpoint)
  getBusinessStaff: async (businessId: string, includeInactive = false): Promise<ApiResponse<StaffListResponse>> => {
    const queryParams = new URLSearchParams();
    if (includeInactive) queryParams.append('includeInactive', 'true');
    
    const url = `/api/v1/staff/${businessId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<ApiResponse<StaffListResponse>>(url);
    return response.data;
  },

  // Get staff for appointment booking (public endpoint)
  getBusinessStaffForBooking: async (businessId: string): Promise<ApiResponse<StaffListResponse>> => {
    const response = await apiClient.get<ApiResponse<StaffListResponse>>(`/api/v1/public/businesses/${businessId}/staff`);
    return response.data;
  },

  // Update staff member
  updateStaff: async (staffId: string, data: StaffUpdateRequest): Promise<ApiResponse<Staff>> => {
    const response = await apiClient.put<ApiResponse<Staff>>(`/api/v1/staff/${staffId}`, data);
    return response.data;
  },

  // Remove staff member
  removeStaff: async (staffId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete<ApiResponse<any>>(`/api/v1/staff/${staffId}`);
    return response.data;
  },

  // Resend invitation SMS
  resendInvitation: async (staffId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(`/api/v1/staff/${staffId}/resend-invitation`);
    return response.data;
  },

  // Get staff member details
  getStaffDetails: async (staffId: string): Promise<ApiResponse<StaffWithUser>> => {
    const response = await apiClient.get<ApiResponse<StaffWithUser>>(`/api/v1/staff/details/${staffId}`);
    return response.data;
  },
};

export * from '../../types/staff';