export interface Review {
  id: string;
  businessId: string;
  customerId: string;
  appointmentId?: string;
  rating: number;
  comment?: string;
  response?: string;
  isVerified: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewData {
  businessId: string;
  appointmentId?: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
  isPublic?: boolean;
}

export interface ReviewResponseData {
  response: string;
}

export interface ReviewSearchFilters {
  businessId?: string;
  customerId?: string;
  rating?: number;
  isVerified?: boolean;
  isPublic?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}