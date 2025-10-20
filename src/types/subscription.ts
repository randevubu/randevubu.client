import { SubscriptionStatus } from './enums';

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  billingInterval: 'MONTHLY' | 'YEARLY';
  maxBusinesses: number;
  maxStaffPerBusiness: number;
  maxAppointmentsPerDay: number;
  features: {
    appointmentBooking: boolean;
    staffManagement: boolean;
    basicReports: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    customBranding: boolean;
    advancedReports: boolean;
    apiAccess: boolean;
    multiLocation: boolean;
    prioritySupport: boolean;
    integrations: string[];
    maxServices: number;
    maxCustomers: number;
    smsQuota: number;
    pricingTier: 'TIER_1' | 'TIER_2' | 'TIER_3';
    description: string[];
  };
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
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

// New API response types for subscription plans
export interface SubscriptionPlansResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    plans: SubscriptionPlan[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface SubscriptionPlansByTierResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    plans: SubscriptionPlan[];
    tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface SubscriptionPlansByCityResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    plans: SubscriptionPlan[];
    city: string;
    tier: 'TIER_1' | 'TIER_2' | 'TIER_3';
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// Tier information types
export interface PricingTier {
  id: 'TIER_1' | 'TIER_2' | 'TIER_3';
  name: string;
  displayName: string;
  cities: string[];
  description: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'TIER_1',
    name: 'Major Cities',
    displayName: 'Büyük Şehirler',
    cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Eskişehir'],
    description: 'Artmış operasyonel maliyetler ve pazar talebi nedeniyle daha yüksek fiyatlandırma'
  },
  {
    id: 'TIER_2',
    name: 'Regional Centers',
    displayName: 'Bölgesel Merkezler',
    cities: ['Gaziantep', 'Konya', 'Diyarbakır', 'Samsun', 'Denizli', 'Kayseri', 'Mersin', 'Erzurum', 'Trabzon', 'Balıkesir', 'Kahramanmaraş', 'Van', 'Manisa', 'Sivas', 'Batman'],
    description: 'Bölgesel iş merkezleri için dengeli fiyatlandırma'
  },
  {
    id: 'TIER_3',
    name: 'Smaller Cities',
    displayName: 'Küçük Şehirler',
    cities: ['Diğer tüm şehirler ve kırsal alanlar'],
    description: 'Küçük pazarlarda hizmete erişimi kolaylaştırmak için daha düşük fiyatlandırma'
  }
];