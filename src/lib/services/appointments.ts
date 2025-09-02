import { apiClient } from '../api';
import { ApiResponse } from '../../types/api';
import { Appointment, AppointmentStatus } from '../../types';

export interface MyAppointmentsParams {
  status?: AppointmentStatus;
  date?: string; // YYYY-MM-DD format
  businessId?: string;
  page?: number;
  limit?: number;
}

export interface MyAppointmentsResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateAppointmentData {
  businessId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  staffId?: string;
  customerNotes?: string; // max 500 chars
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface BusinessAppointmentsParams {
  businessId: string;
  startDate?: string;
  endDate?: string;
}

export const appointmentService = {
  // Get business appointments for a date range
  getBusinessAppointments: async (params: BusinessAppointmentsParams): Promise<ApiResponse<{ appointments: Appointment[] }>> => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const url = `/api/v1/appointments/business/${params.businessId}/date-range${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<ApiResponse<{ appointments: Appointment[] }>>(url);
    return response.data;
  },

  // Create a new appointment
  createAppointment: async (data: CreateAppointmentData): Promise<ApiResponse<Appointment>> => {
    const response = await apiClient.post<ApiResponse<Appointment>>('/api/v1/appointments/', data);
    return response.data;
  },

  // Get customer's own appointments (all)
  getMyAppointments: async (params?: MyAppointmentsParams): Promise<ApiResponse<MyAppointmentsResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.date) queryParams.append('date', params.date);
    if (params?.businessId) queryParams.append('businessId', params.businessId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/api/v1/appointments/customer${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get<ApiResponse<any>>(url);
    return response.data;
  },

  // Get upcoming appointments only
  getMyUpcomingAppointments: async (params?: { limit?: number }): Promise<ApiResponse<MyAppointmentsResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/api/v1/appointments/my/upcoming${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get<ApiResponse<MyAppointmentsResponse>>(url);
    return response.data;
  },

  updateAppointmentStatus: async (appointmentId: string, status: AppointmentStatus): Promise<ApiResponse<Appointment>> => {
    const response = await apiClient.put<ApiResponse<Appointment>>(
      `/api/v1/appointments/${appointmentId}/status`,
      { status }
    );
    return response.data;
  },

  getAppointmentDetails: async (appointmentId: string): Promise<ApiResponse<Appointment>> => {
    const response = await apiClient.get<ApiResponse<Appointment>>(
      `/api/v1/appointments/${appointmentId}`
    );
    return response.data;
  },

  // Get business owner's appointments (customers who booked at your business)
  getBusinessOwnerAppointments: async (params?: MyAppointmentsParams): Promise<ApiResponse<MyAppointmentsResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.date) queryParams.append('date', params.date);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `/api/v1/appointments/my-appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.get<ApiResponse<MyAppointmentsResponse>>(url);
    return response.data;
  },

  // Cancel an appointment
  cancelAppointment: async (appointmentId: string, reason?: string): Promise<ApiResponse<Appointment>> => {
    const response = await apiClient.post<ApiResponse<Appointment>>(
      `/api/v1/appointments/${appointmentId}/cancel`,
      { reason }
    );
    return response.data;
  }
};