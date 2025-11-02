/**
 * Rating System Types
 * 
 * Type definitions for the dual rating system (internal + Google integration).
 * Follows the API documentation structure with proper validation.
 */

export interface Rating {
  id: string;
  customerId: string;
  businessId: string;
  appointmentId: string;
  rating: number; // 1-5 stars
  comment?: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface BusinessRatingSummary {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface RatingEligibility {
  canRate: boolean;
  reason?: string;
  existingRating?: Rating;
}

export interface GoogleIntegration {
  googlePlaceId?: string;
  googleIntegrationEnabled: boolean;
  googleLinkedAt?: string;
  latitude?: number;
  longitude?: number;
  averageRating?: number;
  totalRatings?: number;
  lastRatingAt?: string;
  urls?: {
    maps: string;
    reviews: string;
    writeReview: string;
    embed: string;
  };
}

export interface BusinessWithRatings {
  id: string;
  name: string;
  averageRating: number;
  totalRatings: number;
  googleIntegration?: GoogleIntegration;
}

// API Request/Response Types
export interface SubmitRatingRequest {
  appointmentId: string;
  rating: number;
  comment?: string;
  isAnonymous: boolean;
}

export interface SubmitRatingResponse {
  success: boolean;
  message: string;
  data: {
    rating: Rating;
  };
}

export interface GetBusinessRatingsRequest {
  page?: number;
  limit?: number;
  minRating?: number;
  maxRating?: number;
}

export interface GetBusinessRatingsResponse {
  success: boolean;
  data: {
    ratings: Rating[];
    averageRating: number;
    totalRatings: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  meta: {
    page: number;
    totalPages: number;
    total: number;
  };
}

export interface RatingEligibilityResponse {
  success: boolean;
  message: string;
  data: RatingEligibility;
}

export interface GetUserRatingResponse {
  success: boolean;
  message: string;
  data: {
    rating?: Rating;
  };
}

export interface UpdateGoogleIntegrationRequest {
  googlePlaceId?: string;
  googleUrl?: string;
  enabled: boolean;
}

export interface UpdateGoogleIntegrationResponse {
  success: boolean;
  message: string;
  data: {
    business: BusinessWithRatings;
  };
}

export interface GetGoogleIntegrationResponse {
  success: boolean;
  message: string;
  data: GoogleIntegration;
}

// Component Props Types
export interface BusinessRatingsProps {
  businessId: string;
  averageRating: number;
  totalRatings: number;
  googleIntegration?: GoogleIntegration;
  showGoogleWidget?: boolean;
  className?: string;
}

export interface RatingFormProps {
  businessId: string;
  appointmentId: string;
  onRatingSubmitted: (rating: Rating) => void;
  onCancel?: () => void;
  className?: string;
}

export interface RatingDisplayProps {
  rating: number;
  totalRatings?: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export interface GoogleIntegrationSettingsProps {
  businessId: string;
  currentSettings?: GoogleIntegration;
  onSettingsUpdated?: (settings: GoogleIntegration) => void;
  className?: string;
}

// Hook Return Types
export interface UseRatingEligibilityResult {
  eligibility: RatingEligibility | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseBusinessRatingsResult {
  ratings: Rating[];
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  meta: {
    page: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

export interface UseRatingSubmissionResult {
  submitRating: (businessId: string, data: SubmitRatingRequest) => Promise<Rating>;
  isSubmitting: boolean;
  error: Error | null;
}

export interface UseGoogleIntegrationResult {
  integration: GoogleIntegration | null;
  loading: boolean;
  error: Error | null;
  updateIntegration: (data: UpdateGoogleIntegrationRequest) => Promise<void>;
  isUpdating: boolean;
  refetch: () => void;
}

// Error Types
export interface RatingError {
  code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'ALREADY_RATED' | 'APPOINTMENT_NOT_COMPLETED' | 'GOOGLE_INTEGRATION_ERROR';
  message: string;
  details?: Record<string, string>;
}

// Validation Schemas (for form validation)
export interface RatingFormData {
  rating: number;
  comment: string;
  isAnonymous: boolean;
}

export interface RatingFormErrors {
  rating?: string;
  comment?: string;
  general?: string;
}

// Constants
export const RATING_CONSTANTS = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  MAX_COMMENT_LENGTH: 1000,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
} as const;

export type RatingValue = typeof RATING_CONSTANTS.MIN_RATING | 2 | 3 | 4 | typeof RATING_CONSTANTS.MAX_RATING;
