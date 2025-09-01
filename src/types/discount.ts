export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface DiscountCode {
  id: string;
  code: string;
  name?: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxUsages: number;
  currentUsages: number;
  isActive: boolean;
  validFrom: Date;
  validUntil?: Date;
  minPurchaseAmount?: number;
  applicablePlans: string[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
}

export interface DiscountCodeUsage {
  id: string;
  discountCodeId: string;
  userId: string;
  businessSubscriptionId?: string;
  paymentId?: string;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  usedAt: Date;
  metadata?: any;
}

export interface CreateDiscountCodeData {
  code?: string;
  name?: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxUsages?: number;
  validFrom?: string;
  validUntil?: string;
  minPurchaseAmount?: number;
  applicablePlans?: string[];
  metadata?: object;
}

export interface UpdateDiscountCodeData {
  name?: string;
  description?: string;
  discountValue?: number;
  maxUsages?: number;
  validUntil?: string;
  minPurchaseAmount?: number;
  applicablePlans?: string[];
  metadata?: object;
}

export interface ValidateDiscountCodeRequest {
  code: string;
  planId: string;
  amount: number;
}

export interface ValidateDiscountCodeResponse {
  isValid: boolean;
  discountAmount: number | null;
  originalAmount: number | null;
  finalAmount: number | null;
  errorMessage: string | null;
}

export interface BulkCreateDiscountCodesData {
  prefix?: string;
  count: number;
  discountType: DiscountType;
  discountValue: number;
  maxUsages?: number;
  validUntil?: string;
  minPurchaseAmount?: number;
  applicablePlans?: string[];
  description?: string;
}

export interface DiscountCodeStatistics {
  totalCodes: number;
  activeCodes: number;
  expiredCodes: number;
  totalUsages: number;
  totalDiscountAmount: number;
}

export interface PaginatedDiscountCodes {
  discountCodes: DiscountCode[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PaginatedDiscountCodeUsages {
  usages: DiscountCodeUsage[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DiscountApplication {
  code: string;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
}