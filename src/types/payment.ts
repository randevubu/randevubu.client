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
  address: string;
  city: string;
  country: string;
  zipCode: string;
}

export interface CreatePaymentRequest {
  planId: string;
  card: IyzicoCardData;
  buyer: IyzicoBuyerData;
  installment?: string;

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