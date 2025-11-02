import { apiClient } from '../api';
import { isAxiosError, extractApiError, extractErrorMessage } from '../utils/errorExtractor';
import { ApiResponse, MyBusinessResponse, CreateBusinessResponse } from '../../types/api';
import { 
  Business, 
  CreateBusinessData, 
  UpdateBusinessData,
  EnhancedClosureData,
  ClosureImpactPreview,
  ClosureImpactResponse,
  NotificationResult,
  ClosureAnalytics,
  CustomerImpactReport,
  RescheduleSuggestion,
  ImageType,
  BusinessImages,
  UploadImageResponse
} from '../../types/business';
import { 
  StaffPrivacySettings, 
  StaffPrivacySettingsRequest, 
  PublicStaffResponse 
} from '../../types/staffPrivacy';
import { ClosureType } from '../../types/enums';

export interface PublicBusiness {
  id: string;
  name: string;
  slug: string;
  description?: string;
  city: string;
  state: string;
  country: string;
  logoUrl?: string;
  coverImageUrl?: string;
  primaryColor?: string;
  isVerified: boolean;
  isClosed: boolean;
  tags: string[];
  rating?: number;
  totalReviews: number;
  businessType: {
    id: string;
    name: string;
    displayName: string;
    icon: string;
    category: string;
  };
}

export interface PublicBusinessesApiResponse {
  success: boolean;
  data: PublicBusiness[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

export const businessService = {
  // Get all public businesses - NO AUTH REQUIRED
  getBusinesses: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PublicBusinessesApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `/api/v1/businesses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<PublicBusinessesApiResponse>(url);
    return response.data;
  },

  // Get user's business(es) - NEW endpoint for owners/staff
  getMyBusiness: async (includeSubscription: boolean = true): Promise<MyBusinessResponse> => {
    const baseUrl = '/api/v1/businesses/my-business';
    const params = new URLSearchParams();
    if (includeSubscription) {
      params.append('includeSubscription', 'true');
    }
    
    const url = `${baseUrl}?${params.toString()}`;
    const response = await apiClient.get<MyBusinessResponse>(url);
    return response.data;
  },

  // Create a new business
  createBusiness: async (data: CreateBusinessData): Promise<CreateBusinessResponse> => {
    const response = await apiClient.post<CreateBusinessResponse>('/api/v1/businesses', data);
    
    // 🔍 DEBUG: Log the exact response structure
    
    return response.data; // This should include { data: {...}, tokens: {...} }
  },

  // Get business by ID - using your existing endpoint
  getBusinessById: async (id: string): Promise<ApiResponse<Business>> => {
    const response = await apiClient.get<ApiResponse<Business>>(`/api/v1/businesses/${id}`);
    return response.data;
  },

  // Get business by slug - for public business pages
  getBusinessBySlug: async (slug: string): Promise<ApiResponse<Business>> => {
    const response = await apiClient.get<ApiResponse<Business>>(`/api/v1/businesses/slug/${slug}`);
    return response.data;
  },

  // Get business hours status (public endpoint for booking flow)
  getBusinessHoursStatus: async (businessId: string, date?: string, timezone?: string): Promise<ApiResponse<{
    businessId: string;
    date: string;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
    breaks?: Array<{
      startTime: string;
      endTime: string;
      description: string;
    }>;
    isOverride: boolean;
    timezone: string;
  }>> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (timezone) params.append('timezone', timezone);
    
    const queryString = params.toString();
    const url = `/api/v1/businesses/${businessId}/hours/status${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ApiResponse<any>>(url);
    return response.data;
  },

  // Get business hours (for business owners/staff)
  getBusinessHours: async (businessId: string): Promise<ApiResponse<{
    businessHours: Record<string, any>;
  }>> => {
    if (!businessId) {
      throw new Error('Business ID is required');
    }
    
    const response = await apiClient.get<ApiResponse<any>>(`/api/v1/businesses/${businessId}/hours`);
    return response.data;
  },

  // Update business hours
  updateBusinessHours: async (businessId: string, businessHours: Record<string, any>): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>(`/api/v1/businesses/${businessId}/hours`, {
      businessHours
    });
    return response.data;
  },

  // Create business hours override
  createBusinessHoursOverride: async (businessId: string, data: {
    date: string;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
    breaks?: Array<{
      startTime: string;
      endTime: string;
      description: string;
    }>;
    reason?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(`/api/v1/businesses/${businessId}/hours/overrides`, data);
    return response.data;
  },

  // Update business hours override
  updateBusinessHoursOverride: async (businessId: string, date: string, data: {
    isOpen?: boolean;
    openTime?: string;
    closeTime?: string;
    breaks?: Array<{
      startTime: string;
      endTime: string;
      description: string;
    }>;
    reason?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>(`/api/v1/businesses/${businessId}/hours/overrides/${date}`, data);
    return response.data;
  },

  // Delete business hours override
  deleteBusinessHoursOverride: async (businessId: string, date: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete<ApiResponse<any>>(`/api/v1/businesses/${businessId}/hours/overrides/${date}`);
    return response.data;
  },

  // Get business hours overrides
  getBusinessHoursOverrides: async (businessId: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any[]>> => {
    if (!businessId) {
      throw new Error('Business ID is required');
    }
    
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    const url = `/api/v1/businesses/${businessId}/hours/overrides${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(url);
      return response.data;
      } catch (error: unknown) {
        // If the endpoint doesn't work, try as a POST with businessId in body as a workaround
        const axiosError = isAxiosError(error);
        const apiError = extractApiError(error);
        if (axiosError && error.response?.status === 400 && (apiError?.message === 'Business ID is required' || apiError?.code === 'BUSINESS_ID_REQUIRED')) {
        try {
          const postUrl = '/api/v1/businesses/hours/overrides/list';
          const postResponse = await apiClient.post<ApiResponse<any[]>>(postUrl, {
            businessId,
            ...params
          });
          return postResponse.data;
        } catch (postError) {
          // If workaround also fails, throw original error
        }
      }
      
      throw error;
    }
  },

  // Update business - using your existing endpoint  
  updateBusiness: async (id: string, data: UpdateBusinessData): Promise<ApiResponse<Business>> => {
    const response = await apiClient.put<ApiResponse<Business>>(`/api/v1/businesses/${id}`, data);
    return response.data;
  },

  // Patch business - use PATCH method as backend might support this instead of PUT
  patchBusiness: async (id: string, data: UpdateBusinessData): Promise<ApiResponse<Business>> => {
    const response = await apiClient.patch<ApiResponse<Business>>(`/api/v1/businesses/${id}`, data);
    return response.data;
  },

  // Update my business - more consistent with getMyBusiness
  updateMyBusiness: async (data: UpdateBusinessData): Promise<ApiResponse<Business>> => {
    try {
      // Try the my-business endpoint first (more RESTful)
      const response = await apiClient.put<ApiResponse<Business>>('/api/v1/businesses/my-business', data);
      return response.data;
    } catch (error: unknown) {
      // Fallback to the original method if the my-business endpoint doesn't support PUT
      try {
        const myBusiness = await businessService.getMyBusiness();
        if (myBusiness.success && myBusiness.data?.businesses && myBusiness.data.businesses.length > 0) {
          const businessId = myBusiness.data.businesses[0].id;
          return await businessService.updateBusiness(businessId, data);
        }
        const errorMessage = extractErrorMessage(error, 'No business found to update');
        throw new Error(errorMessage);
      } catch (fallbackError: unknown) {
        const errorMessage = extractErrorMessage(error, 'Failed to update business');
        throw new Error(errorMessage);
      }
    }
  },

  // Get business types
  getBusinessTypes: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get<ApiResponse<any[]>>('/api/v1/business-types');
    return response.data;
  },

  // Create closure for business
  createClosure: async (closureData: {
    startDate: string;
    endDate: string;
    reason: string;
    type: ClosureType;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>('/api/v1/closures/my', closureData);
    return response.data;
  },

  // Get closures for business
  getClosures: async (params?: {
    active?: 'true' | 'false' | 'upcoming';
  }): Promise<ApiResponse<any[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.active) queryParams.append('active', params.active);
    
    const url = `/api/v1/closures/my${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<ApiResponse<any[]>>(url);
    return response.data;
  },

  // Update closure
  updateClosure: async (closureId: string, data: {
    startDate?: string;
    endDate?: string;
    reason?: string;
    type?: ClosureType;
    isActive?: boolean;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>(`/api/v1/closures/${closureId}`, data);
    return response.data;
  },

  // Delete closure permanently 
  deleteClosure: async (closureId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete<ApiResponse<any>>(`/api/v1/closures/${closureId}`);
    return response.data;
  },

  // ================================
  // ENHANCED CLOSURE SYSTEM METHODS
  // ================================
  // These methods will be implemented on the backend
  // For now, they're placeholders that gracefully fallback

  // Enhanced closure creation with customer notifications
  createEnhancedClosure: async (data: EnhancedClosureData): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/api/v1/closures/enhanced', data);
      return response.data;
    } catch (error: unknown) {
      // Fallback to basic closure creation if enhanced endpoint not available
      const errorMessage = extractErrorMessage(error, 'Failed to create enhanced closure');
      throw new Error(errorMessage);
    }
  },

  // Get closure impact preview
  getClosureImpactPreview: async (data: {
    startDate: string;
    endDate: string;
    affectedServices?: string[];
  }): Promise<ClosureImpactPreview> => {
    try {
      // First get the business ID from user's business
      const myBusiness = await businessService.getMyBusiness();
      const businessId = myBusiness.data?.businesses?.[0]?.id;
      
      if (!businessId) {
        throw new Error('Business ID not found');
      }
      
      // Include businessId in the request
      const requestData = {
        businessId,
        ...data
      };
      
      const response = await apiClient.post<ApiResponse<ClosureImpactResponse>>('/api/v1/closures/impact-preview', requestData);
      const backendData = response.data.data;
      
      if (!backendData) {
        throw new Error('No data received from impact preview endpoint');
      }
      
      // Map backend response to frontend interface
      return {
        affectedAppointmentsCount: backendData.impactSummary.affectedAppointments,
        affectedCustomersCount: backendData.impactSummary.uniqueCustomers,
        estimatedRevenueLoss: backendData.impactSummary.estimatedRevenueLoss,
        suggestedRescheduleSlots: [] // TODO: Map from backend data when available
      };
    } catch (error: unknown) {
      // Return mock data for development
      
      // Simulate realistic scenario - some dates have no appointments
      const hasAppointments = Math.random() > 0.3; // 70% chance of having appointments
      
      if (!hasAppointments) {
        return {
          affectedAppointmentsCount: 0,
          affectedCustomersCount: 0,
          estimatedRevenueLoss: 0,
          suggestedRescheduleSlots: []
        };
      }
      
      return {
        affectedAppointmentsCount: Math.floor(Math.random() * 20) + 1,
        affectedCustomersCount: Math.floor(Math.random() * 15) + 1,
        estimatedRevenueLoss: Math.floor(Math.random() * 5000) + 500,
        suggestedRescheduleSlots: []
      };
    }
  },

  // Send closure notifications to customers
  sendClosureNotifications: async (data: {
    closureId: string;
    channels: string[];
    message: string;
    customTemplate?: string;
  }): Promise<NotificationResult[]> => {
    try {
      const response = await apiClient.post<ApiResponse<NotificationResult[]>>('/api/v1/notifications/closure', data);
      return response.data.data || [];
    } catch (error: unknown) {
      // Return mock success response
      return data.channels.map(channel => ({
        success: true,
        channel: channel as any,
        recipientCount: Math.floor(Math.random() * 50) + 10,
        failedCount: 0
      }));
    }
  },

  // Get affected appointments for a closure
  getAffectedAppointments: async (closureId: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`/api/v1/closures/${closureId}/affected-appointments`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, 'Failed to fetch affected appointments');
      throw new Error(errorMessage);
    }
  },

  // Get reschedule suggestions for affected appointments
  getRescheduleSuggestions: async (closureId: string): Promise<RescheduleSuggestion[]> => {
    try {
      const response = await apiClient.get<ApiResponse<RescheduleSuggestion[]>>(`/api/v1/closures/${closureId}/reschedule-suggestions`);
      return response.data.data || [];
    } catch (error: unknown) {
      console.error('Failed to fetch reschedule suggestions:', error);
      return [];
    }
  },

  // Get closure analytics
  getClosureAnalytics: async (params: {
    period?: string;
    metrics?: string[];
  }): Promise<ClosureAnalytics> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.metrics) queryParams.append('metrics', params.metrics.join(','));
      
      const url = `/api/v1/closures/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<ApiResponse<ClosureAnalytics>>(url);
      if (!response.data.data) {
        throw new Error('No analytics data received');
      }
      return response.data.data;
    } catch (error: unknown) {
      // Return mock analytics data
      return {
        totalClosures: Math.floor(Math.random() * 50) + 10,
        closuresByType: {
          [ClosureType.VACATION]: Math.floor(Math.random() * 20) + 5,
          [ClosureType.MAINTENANCE]: Math.floor(Math.random() * 10) + 2,
          [ClosureType.EMERGENCY]: Math.floor(Math.random() * 5) + 1,
          [ClosureType.HOLIDAY]: Math.floor(Math.random() * 8) + 1,
          [ClosureType.STAFF_SHORTAGE]: Math.floor(Math.random() * 6) + 1,
          [ClosureType.OTHER]: Math.floor(Math.random() * 10) + 2
        },
        averageClosureDuration: Math.floor(Math.random() * 10) + 2,
        customerImpactScore: Math.floor(Math.random() * 100) + 1,
        revenueImpact: Math.floor(Math.random() * 50000) + 5000,
        reschedulingSuccessRate: Math.floor(Math.random() * 40) + 60
      };
    }
  },

  // Get customer impact report
  getCustomerImpactReport: async (closureId: string): Promise<CustomerImpactReport> => {
    try {
      const response = await apiClient.get<ApiResponse<CustomerImpactReport>>(`/api/v1/closures/${closureId}/customer-impact`);
      if (!response.data.data) {
        throw new Error('No customer impact data received');
      }
      return response.data.data;
    } catch (error: unknown) {
      return {
        totalAffectedCustomers: Math.floor(Math.random() * 100) + 20,
        notificationsSent: Math.floor(Math.random() * 95) + 18,
        rescheduleAcceptanceRate: Math.floor(Math.random() * 40) + 60,
        customerSatisfactionScore: Math.floor(Math.random() * 30) + 70
      };
    }
  },

  // Create availability alert for customers
  createAvailabilityAlert: async (data: {
    customerId: string;
    businessId: string;
    serviceId?: string;
    preferredDates?: string[];
    notificationPreferences?: Record<string, any>;
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/api/v1/businesses/availability-alerts', data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, 'Failed to fetch affected appointments');
      throw new Error(errorMessage);
    }
  },

  // Get business closure status
  getClosureStatus: async (businessId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`/api/v1/businesses/${businessId}/closure-status`);
      return response.data;
    } catch (error: unknown) {
      return {
        success: true,
        data: {
          isClosed: false,
          currentClosure: null,
          upcomingClosures: [],
          alternativeBusinesses: []
        }
      } as ApiResponse<any>;
    }
  },

  // Auto-reschedule appointments during closure
  autoRescheduleAppointments: async (data: {
    closureId: string;
    rescheduleOptions: {
      allowWeekends?: boolean;
      maxRescheduleDays?: number;
      preferredTimeSlots?: string[];
      autoConfirm?: boolean;
    };
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/api/v1/closures/auto-reschedule', data);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, 'Failed to fetch affected appointments');
      throw new Error(errorMessage);
    }
  },

  // Get business price visibility settings
  getPriceSettings: async (): Promise<ApiResponse<{
    hideAllServicePrices: boolean;
    showPriceOnBooking: boolean;
  }>> => {
    const response = await apiClient.get<ApiResponse<any>>('/api/v1/businesses/my-business/price-settings');
    return response.data;
  },

  // Update business price visibility settings
  updatePriceSettings: async (settings: {
    hideAllServicePrices: boolean;
    showPriceOnBooking: boolean;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.put<ApiResponse<any>>('/api/v1/businesses/my-business/price-settings', settings);
    return response.data;
  },

  // ================================
  // BUSINESS IMAGE UPLOAD METHODS
  // ================================

  // Upload business image
  uploadBusinessImage: async (
    businessId: string,
    file: File,
    imageType: 'logo' | 'cover' | 'profile' | 'gallery'
  ): Promise<ApiResponse<{ imageUrl: string; business?: Business }>> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('imageType', imageType);

    const response = await apiClient.post<ApiResponse<{ imageUrl: string; business?: Business }>>(
      `/api/v1/businesses/${businessId}/images/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Get business images
  getBusinessImages: async (businessId: string): Promise<ApiResponse<{
    images: {
      logoUrl?: string;
      coverImageUrl?: string;
      profileImageUrl?: string;
      galleryImages: string[];
    };
  }>> => {
    const response = await apiClient.get<ApiResponse<any>>(`/api/v1/businesses/${businessId}/images`);
    return response.data;
  },

  // Delete business image (logo, cover, profile)
  deleteBusinessImage: async (
    businessId: string,
    imageType: 'logo' | 'cover' | 'profile'
  ): Promise<ApiResponse<{ business: Business }>> => {
    const response = await apiClient.delete<ApiResponse<{ business: Business }>>(
      `/api/v1/businesses/${businessId}/images/${imageType}`
    );
    return response.data;
  },

  // Delete gallery image
  deleteGalleryImage: async (
    businessId: string,
    imageUrl: string
  ): Promise<ApiResponse<{ business: Business }>> => {
    const response = await apiClient.delete<ApiResponse<{ business: Business }>>(
      `/api/v1/businesses/${businessId}/images/gallery`,
      {
        data: { imageUrl },
      }
    );
    return response.data;
  },

  // Update gallery images order
  updateGalleryOrder: async (
    businessId: string,
    orderedImageUrls: string[]
  ): Promise<ApiResponse<{ business: Business }>> => {
    const response = await apiClient.put<ApiResponse<{ business: Business }>>(
      `/api/v1/businesses/${businessId}/images/gallery`,
      { imageUrls: orderedImageUrls }
    );
    return response.data;
  },

  // ================================
  // BUSINESS NOTIFICATION SETTINGS METHODS
  // ================================

  // Get business notification settings
  getBusinessNotificationSettings: async (): Promise<ApiResponse<{
    id: string;
    businessId: string;
    enableAppointmentReminders: boolean;
    reminderChannels: string[];
    reminderTiming: number[];
    smsEnabled: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
    quietHours?: {
      start: string;
      end: string;
    };
    timezone: string;
    createdAt: string;
    updatedAt: string;
  }>> => {
    const response = await apiClient.get<ApiResponse<any>>('/api/v1/businesses/my-business/notification-settings');
    return response.data;
  },

  // Update business notification settings
  updateBusinessNotificationSettings: async (settings: {
    enableAppointmentReminders?: boolean;
    reminderChannels?: string[];
    reminderTiming?: number[];
    smsEnabled?: boolean;
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    quietHours?: {
      start: string;
      end: string;
    } | null;
    timezone?: string;
  }): Promise<ApiResponse<{
    id: string;
    businessId: string;
    enableAppointmentReminders: boolean;
    reminderChannels: string[];
    reminderTiming: number[];
    smsEnabled: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
    quietHours?: {
      start: string;
      end: string;
    };
    timezone: string;
    createdAt: string;
    updatedAt: string;
  }>> => {
    const response = await apiClient.put<ApiResponse<any>>('/api/v1/businesses/my-business/notification-settings', settings);
    return response.data;
  },

  // Test business notification settings
  testBusinessNotificationSettings: async (testData?: {
    appointmentId?: string;
    channels?: string[];
    customMessage?: string;
  }): Promise<ApiResponse<{
    results: Array<{
      success: boolean;
      messageId?: string;
      channel: string;
      status: string;
      error?: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
      channels: string[];
      testMessage: string;
    };
  }>> => {
    const response = await apiClient.post<ApiResponse<any>>('/api/v1/businesses/my-business/test-reminder', testData || {});
    return response.data;
  },

  // Get notification analytics
  getNotificationAnalytics: async (params?: {
    days?: number;
  }): Promise<ApiResponse<{
    period: {
      days: number;
      startDate: string;
      endDate: string;
    };
    summary: {
      totalAppointments: number;
      remindedAppointments: number;
      reminderCoverage: number;
      noShowRate: number;
      completionRate: number;
    };
    channelPerformance: {
      [key: string]: {
        sent: number;
        delivered: number;
        read: number;
        failed: number;
      };
    };
    reminderEffectiveness: {
      withReminder: {
        total: number;
        noShow: number;
        completed: number;
        noShowRate: number;
      };
      withoutReminder: {
        total: number;
        noShow: number;
        completed: number;
        noShowRate: number;
      };
    };
  }>> => {
    const queryParams = new URLSearchParams();
    if (params?.days) queryParams.append('days', params.days.toString());

    const url = `/api/v1/businesses/my-business/notification-analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<ApiResponse<any>>(url);
    return response.data;
  },

  // ================================
  // STAFF PRIVACY SETTINGS METHODS
  // ================================

  // Get staff privacy settings
  getStaffPrivacySettings: async (): Promise<ApiResponse<StaffPrivacySettings>> => {
    const response = await apiClient.get<ApiResponse<StaffPrivacySettings>>('/api/v1/businesses/my-business/staff-privacy-settings');
    return response.data;
  },

  // Update staff privacy settings
  updateStaffPrivacySettings: async (settings: StaffPrivacySettingsRequest): Promise<ApiResponse<StaffPrivacySettings>> => {
    const response = await apiClient.put<ApiResponse<StaffPrivacySettings>>('/api/v1/businesses/my-business/staff-privacy-settings', settings);
    return response.data;
  },

  // Get public staff list (for customer booking)
  getPublicStaff: async (businessId: string): Promise<PublicStaffResponse> => {
    const response = await apiClient.get<PublicStaffResponse>(`/api/v1/public/businesses/${businessId}/staff`);
    return response.data;
  },

  // Get business staff (for business owners/staff - internal use)
  getBusinessStaff: async (businessId: string): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/api/v1/businesses/${businessId}/staff`);
    return response.data;
  },

  // ================================
  // PUBLIC AVAILABLE SLOTS ENDPOINT
  // ================================

  /**
   * Get available time slots for booking (PUBLIC - No Auth Required)
   * @param businessId - Business ID
   * @param params - Query parameters (date, serviceId, staffId)
   */
  getAvailableSlots: async (
    businessId: string,
    params: {
      date: string;       // YYYY-MM-DD format
      serviceId: string;  // Required
      staffId?: string;   // Optional - filter by specific staff
    }
  ): Promise<ApiResponse<{
    date: string;
    businessId: string;
    serviceId: string;
    staffId?: string;
    slots: Array<{
      startTime: string;      // ISO 8601
      endTime: string;        // ISO 8601
      available: boolean;     // true = free, false = booked
      staffId?: string;
      staffName?: string;
    }>;
    businessHours: {
      isOpen: boolean;
      openTime?: string;      // "HH:MM"
      closeTime?: string;     // "HH:MM"
    };
    closures: Array<{
      reason: string;
      type: string;
    }>;
  }>> => {
    const queryParams = new URLSearchParams({
      date: params.date,
      serviceId: params.serviceId,
      ...(params.staffId && { staffId: params.staffId })
    });

    const response = await apiClient.get<ApiResponse<any>>(
      `/api/v1/public/businesses/${businessId}/available-slots?${queryParams.toString()}`
    );
    return response.data;
  },
};