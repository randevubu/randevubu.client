import { apiClient } from '../api';
import { ApiResponse } from '../../types/api';
import { Appointment, AppointmentStatus, MonitorAppointmentsResponse, MonitorAppointmentsParams } from '../../types';

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
  customerId?: string; // NEW: for booking on behalf of customers
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
  getBusinessAppointments: async (params: BusinessAppointmentsParams): Promise<ApiResponse<Appointment[]>> => {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    // Add cache-busting timestamp
    queryParams.append('_t', Date.now().toString());

    const url = `/api/v1/appointments/business/${params.businessId}/date-range?${queryParams.toString()}`;
    console.log('Fetching business appointments:', url);

    try {
      const response = await apiClient.get<ApiResponse<Appointment[]>>(url);
      console.log('Business appointments response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching business appointments:', error);
      throw error;
    }
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
  },

  // Get the nearest appointment in the current hour (for push notifications)
  getNearestAppointmentCurrentHour: async (): Promise<ApiResponse<{ appointment: Appointment; timeUntilAppointment: number }>> => {
    const response = await apiClient.get<ApiResponse<{ appointment: Appointment; timeUntilAppointment: number }>>(
      '/api/v1/appointments/nearest-current-hour'
    );
    return response.data;
  },

  // Get all appointments in current hour (for push notifications)
  getCurrentHourAppointments: async (): Promise<ApiResponse<Appointment[]>> => {
    const response = await apiClient.get<ApiResponse<Appointment[]>>(
      '/api/v1/appointments/current-hour'
    );
    return response.data;
  },

  // Get next appointment regardless of time range
  getNextAppointment: async (): Promise<ApiResponse<Appointment>> => {
    const response = await apiClient.get<ApiResponse<Appointment>>(
      '/api/v1/appointments/next'
    );
    return response.data;
  },

  // Get appointment statistics
  getAppointmentStats: async (period: 'today' | 'week' | 'month' = 'today'): Promise<ApiResponse<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  }>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/appointments/stats?period=${period}`
    );
    return response.data;
  },

  // Get monitor appointments data for display screens
  getMonitorAppointments: async (params: MonitorAppointmentsParams): Promise<MonitorAppointmentsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.date) queryParams.append('date', params.date);
    if (params.includeStats !== undefined) queryParams.append('includeStats', params.includeStats.toString());
    if (params.maxQueueSize) queryParams.append('maxQueueSize', params.maxQueueSize.toString());

    const url = `/api/v1/appointments/monitor/${params.businessId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    try {
      const response = await apiClient.get<MonitorAppointmentsResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching monitor appointments:', error);
      throw error;
    }
  }
};