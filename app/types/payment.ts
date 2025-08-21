import { PaymentStatus } from './enums';

export interface Payment {
  id: string;
  businessSubscriptionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  paymentProvider: string;
  providerPaymentId?: string;
  metadata?: Record<string, any>;
  paidAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentPayment {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  paidAt?: Date;
  createdAt: Date;
}

export interface CreatePaymentData {
  businessSubscriptionId?: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  paymentProvider: string;
  providerPaymentId?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePaymentData {
  status?: PaymentStatus;
  providerPaymentId?: string;
  metadata?: Record<string, any>;
  paidAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
}

export interface CreateAppointmentPaymentData {
  appointmentId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
}

export interface UpdateAppointmentPaymentData {
  status?: PaymentStatus;
  paidAt?: Date;
}

export interface PaymentSearchFilters {
  businessSubscriptionId?: string;
  status?: PaymentStatus;
  paymentMethod?: string;
  paymentProvider?: string;
  dateFrom?: Date;
  dateTo?: Date;
}