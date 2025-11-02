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
  paidAt?: string;
  failedAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentPayment {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  paidAt?: string;
  createdAt: string;
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
  paidAt?: string;
  failedAt?: string;
  refundedAt?: string;
}

export interface CreateAppointmentPaymentData {
  appointmentId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
}

export interface UpdateAppointmentPaymentData {
  status?: PaymentStatus;
  paidAt?: string;
}

export interface PaymentSearchFilters {
  businessSubscriptionId?: string;
  status?: PaymentStatus;
  paymentMethod?: string;
  paymentProvider?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface IyzicoCardData {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
}

export interface IyzicoBuyerData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
}

export interface CreatePaymentRequest {
  planId: string;
  card: IyzicoCardData;
  buyer: IyzicoBuyerData;
  installment?: string;
  discountCode?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  conversationId?: string;
  status?: string;
  errorCode?: string;
  errorMessage?: string;

}

export interface TestCard {
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  cardType: 'success' | 'failure';
  description: string;
}