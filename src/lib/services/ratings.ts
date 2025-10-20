/**
 * Rating Service
 * 
 * API service for managing business ratings and Google integration.
 * Follows the established patterns in the codebase.
 */

import { apiClient } from '../api';
import type { ApiResponse } from '../../types/api';
import type {
  SubmitRatingRequest,
  SubmitRatingResponse,
  GetBusinessRatingsRequest,
  GetBusinessRatingsResponse,
  RatingEligibilityResponse,
  GetUserRatingResponse,
  UpdateGoogleIntegrationRequest,
  UpdateGoogleIntegrationResponse,
  GetGoogleIntegrationResponse,
  Rating,
  BusinessWithRatings,
  GoogleIntegration,
} from '../../types/rating';

export const ratingService = {
  /**
   * Submit a rating for a completed appointment
   */
  submitRating: async (
    businessId: string,
    data: SubmitRatingRequest
  ): Promise<SubmitRatingResponse> => {
    const response = await apiClient.post<SubmitRatingResponse>(
      `/api/v1/businesses/${businessId}/ratings`,
      data
    );
    return response.data;
  },

  /**
   * Get ratings for a business with pagination and filtering
   */
  getBusinessRatings: async (
    businessId: string,
    params: GetBusinessRatingsRequest = {}
  ): Promise<GetBusinessRatingsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.minRating) queryParams.append('minRating', params.minRating.toString());
    if (params.maxRating) queryParams.append('maxRating', params.maxRating.toString());

    const url = `/api/v1/businesses/${businessId}/ratings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<GetBusinessRatingsResponse>(url);
    return response.data;
  },

  /**
   * Check if a user can rate a specific appointment
   */
  checkRatingEligibility: async (
    businessId: string,
    appointmentId: string
  ): Promise<RatingEligibilityResponse> => {
    const response = await apiClient.get<RatingEligibilityResponse>(
      `/api/v1/businesses/${businessId}/appointments/${appointmentId}/can-rate`
    );
    return response.data;
  },

  /**
   * Get user's rating for a specific appointment
   */
  getUserRating: async (appointmentId: string): Promise<GetUserRatingResponse> => {
    const response = await apiClient.get<GetUserRatingResponse>(
      `/api/v1/appointments/${appointmentId}/rating`
    );
    return response.data;
  },

  /**
   * Update Google integration settings for a business
   */
  updateGoogleIntegration: async (
    businessId: string,
    data: UpdateGoogleIntegrationRequest
  ): Promise<UpdateGoogleIntegrationResponse> => {
    const response = await apiClient.put<UpdateGoogleIntegrationResponse>(
      `/api/v1/businesses/${businessId}/google-integration`,
      data
    );
    return response.data;
  },

  /**
   * Get Google integration settings for a business
   */
  getGoogleIntegration: async (
    businessId: string
  ): Promise<GetGoogleIntegrationResponse> => {
    const response = await apiClient.get<GetGoogleIntegrationResponse>(
      `/api/v1/businesses/${businessId}/google-integration`
    );
    return response.data;
  },

  /**
   * Delete a rating (if allowed by business rules)
   */
  deleteRating: async (
    businessId: string,
    ratingId: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
      `/api/v1/businesses/${businessId}/ratings/${ratingId}`
    );
    return response.data;
  },

  /**
   * Update a rating (if allowed by business rules)
   */
  updateRating: async (
    businessId: string,
    ratingId: string,
    data: Partial<SubmitRatingRequest>
  ): Promise<ApiResponse<{ rating: Rating }>> => {
    const response = await apiClient.put<ApiResponse<{ rating: Rating }>>(
      `/api/v1/businesses/${businessId}/ratings/${ratingId}`,
      data
    );
    return response.data;
  },

  /**
   * Get rating statistics for a business
   */
  getRatingStats: async (
    businessId: string
  ): Promise<ApiResponse<{
    averageRating: number;
    totalRatings: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      averageRating: number;
      totalRatings: number;
      ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
    }>>(`/api/v1/businesses/${businessId}/ratings/stats`);
    return response.data;
  },
};
