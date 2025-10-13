import { apiClient } from '../api';
import { SubscriptionPlan, Location } from '../../types/subscription';

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
  data?: {
    subscriptionId?: string;
    paymentId?: string;
    message?: string;

  };

}

export interface TestCard {
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  cardType: 'success' | 'failure';
  description: string;
}

export class PaymentsService {
  static async getSubscriptionPlans(city?: string): Promise<SubscriptionPlan[]> {
    const url = city 
      ? `/api/v1/subscriptions/plans?city=${encodeURIComponent(city)}`
      : '/api/v1/subscriptions/plans';
    
    const response = await apiClient.get(url);
    return response.data.data; // Extract the data array from the response
  }

  static async getSubscriptionPlansWithLocation(city?: string): Promise<{ plans: SubscriptionPlan[]; location: Location }> {
    const url = city 
      ? `/api/v1/subscriptions/plans?city=${encodeURIComponent(city)}`
      : '/api/v1/subscriptions/plans';
    
    const response = await apiClient.get(url);
    return {
      plans: response.data.data.plans || [],
      location: response.data.data.location
    };
  }

  static async createPayment(businessId: string, paymentData: CreatePaymentRequest): Promise<PaymentResponse> {
    const response = await apiClient.post(`/api/v1/businesses/${businessId}/payments`, paymentData);
    return response.data;
  }

  static async getTestCards(): Promise<TestCard[]> {
    const response = await apiClient.get('/api/v1/payments/test-cards');
    return response.data;
  }

  // Static test cards for development
  static getStaticTestCards(): TestCard[] {
    return [
      {
        cardNumber: '5528790000000008',
        expireMonth: '12',
        expireYear: '2030',
        cvc: '123',
        cardType: 'success',
        description: 'Test success card'
      },
      {
        cardNumber: '5406670000000009',
        expireMonth: '12',
        expireYear: '2030',
        cvc: '123',
        cardType: 'failure',
        description: 'Test failure card'
      }
    ];
  }
}