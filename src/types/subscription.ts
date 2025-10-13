import { SubscriptionStatus } from './enums';

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  price: number;
  basePrice: number; // NEW: Original base price before location adjustment
  currency: string;
  billingInterval: string;
  maxBusinesses: number;
  maxStaffPerBusiness: number;
  maxAppointmentsPerDay?: number;
  features: {
    smsQuota: number;
    apiAccess: boolean;
    description: string[];
    maxServices: number;
    basicReports: boolean;
    integrations: string[];
    maxCustomers: number;
    multiLocation: boolean;
    customBranding: boolean;
    advancedReports: boolean;
    prioritySupport: boolean;
    staffManagement: boolean;
    smsNotifications: boolean;
    appointmentBooking: boolean;
    emailNotifications: boolean;
  };
  isActive: boolean;
  isPopular: boolean;
  isCustomPricing?: boolean;
  customPriceDisplay?: string;
  sortOrder: number;
  locationPricing?: { // NEW: Location pricing information
    city: string;
    state: string;
    country: string;
    tier: string;
    multiplier: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessSubscription {
  id: string;
  businessId: string;
  planId: string;
  plan?: SubscriptionPlan; // Include full plan data when available
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionPlanData {
  name: string;
  displayName: string;
  description?: string;
  price: number;
  currency?: string;
  billingInterval: string;
  maxBusinesses?: number;
  maxStaffPerBusiness?: number;
  maxAppointmentsPerDay?: number;
  features: string[];
  isPopular?: boolean;
}

export interface UpdateSubscriptionPlanData {
  displayName?: string;
  description?: string;
  price?: number;
  currency?: string;
  billingInterval?: string;
  maxBusinesses?: number;
  maxStaffPerBusiness?: number;
  maxAppointmentsPerDay?: number;
  features?: Record<string, any>;
  isActive?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
}

export interface CreateBusinessSubscriptionData {
  businessId: string;
  planId: string;
  trialStart?: Date;
  trialEnd?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateBusinessSubscriptionData {
  planId?: string;
  status?: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, any>;
}

export interface ChangePlanData {
  newPlanId: string;
  paymentMethodId?: string;
  billingCycle?: 'monthly' | 'yearly';
  effectiveDate?: 'immediate' | 'next_billing_cycle';
  prorationPreference?: 'prorate' | 'none';
}

export interface PaymentInfo {
  amount: number;
  currency: string;
  paymentId: string;
  paymentMethodId: string;
  status: string;
}

export interface PaymentMethod {
  id?: string; // Frontend expects this
  paymentMethodId?: string; // Backend provides this
  type?: 'card' | 'bank';
  brand?: string;
  cardBrand?: string; // Backend field
  last4?: string;
  lastFourDigits?: string; // Backend field
  holderName?: string;
  cardHolderName?: string; // Backend field
  expireMonth?: number;
  expiryMonth?: string; // Backend field
  expireYear?: number;
  expiryYear?: string; // Backend field
  makeDefault?: boolean;
  isDefault?: boolean; // Backend field
  isActive?: boolean;
  createdAt?: string;
}

export interface AddPaymentMethodData {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  makeDefault?: boolean;
}

export interface PlanChangePreview {
  changeType: 'upgrade' | 'downgrade' | 'same';
  currentPlan: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  newPlan: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  pricing: {
    prorationAmount: number;
    totalAmount: number;
    currency: string;
    effectiveDate: 'immediate' | 'next_billing_cycle';
    nextBillingDate: string;
  };
  paymentRequired: boolean;
  paymentMethods: PaymentMethod[];
  limitations?: string[];
  canProceed: boolean;
}

export interface ChangePlanResponse {
  id: string;
  businessId: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  autoRenewal: boolean;
  paymentMethodId?: string;
  nextBillingDate: string;
  failedPaymentCount: number;
  metadata: {
    source: string;
    changedAt: string;
    changedBy: string;
    createdAt: string;
    changeType: 'upgrade' | 'downgrade' | 'change';
    effectiveDate: 'immediate' | 'next_billing_cycle';
    previousPlanId: string;
    prorationAmount?: number;
    prorationPreference: 'prorate' | 'none';
  };
  paymentInfo?: PaymentInfo;
  createdAt: string;
  updatedAt: string;
}

// NEW: Location and pricing response types
export interface Location {
  city: string;
  state: string;
  country: string;
  detected: boolean;
  source: 'ip_geolocation' | 'manual' | 'fallback';
  accuracy: 'high' | 'medium' | 'low';
}

export interface PricingResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    plans: SubscriptionPlan[];
    location: Location;
  };
}

export interface CityOption {
  value: string;
  label: string;
  tier: string;
}