import { SubscriptionStatus } from './enums';

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  price: number;
  currency: string;
  billingInterval: string;
  maxBusinesses: number;
  maxStaffPerBusiness: number;
  maxAppointmentsPerDay: number;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessSubscription {
  id: string;
  businessId: string;
  planId: string;
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