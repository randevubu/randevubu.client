import { apiClient } from '../api';
import { ApiResponse } from '../../types/api';

export interface BusinessOverviewReport {
  businessId: string;
  businessName: string;
  totalAppointments: number;
  completedAppointments: number;
  canceledAppointments: number;
  noShowAppointments: number;
  totalRevenue: number;
  averageAppointmentValue: number;
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  appointments: number;
}

export interface RevenueByService {
  serviceId: string;
  serviceName: string;
  revenue: number;
  appointments: number;
  averageValue: number;
}

export interface RevenueReport {
  totalRevenue: number;
  periodRevenue: number;
  revenueByDay: RevenueByDay[];
  revenueByService: RevenueByService[];
}

export interface PaymentMethod {
  method: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface FinancialReport {
  totalRevenue: number;
  netProfit: number;
  expenses: number;
  profitMargin: number;
  revenueGrowth: number;
  avgTransactionValue: number;
  paymentMethods: PaymentMethod[];
  monthlyTrends: MonthlyTrend[];
}

export interface DashboardReport {
  overview: BusinessOverviewReport;
  revenue: RevenueReport;
  appointments: any;
  customers: any;
  generatedAt: string;
}

export interface ReportsQueryParams {
  businessId?: string;
  startDate: string;
  endDate: string;
}

export const reportsService = {
  async getBusinessOverview(params: ReportsQueryParams): Promise<ApiResponse<BusinessOverviewReport>> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });

    if (params.businessId) {
      queryParams.append('businessId', params.businessId);
    }

    const response = await apiClient.get<ApiResponse<BusinessOverviewReport>>(`/api/v1/reports/overview?${queryParams.toString()}`);
    return response.data;
  },

  async getRevenueReport(params: ReportsQueryParams): Promise<ApiResponse<RevenueReport>> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });

    if (params.businessId) {
      queryParams.append('businessId', params.businessId);
    }

    const response = await apiClient.get<ApiResponse<RevenueReport>>(`/api/v1/reports/revenue?${queryParams.toString()}`);
    return response.data;
  },

  async getDashboardReport(params: ReportsQueryParams): Promise<ApiResponse<DashboardReport>> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });

    if (params.businessId) {
      queryParams.append('businessId', params.businessId);
    }

    const response = await apiClient.get<ApiResponse<DashboardReport>>(`/api/v1/reports/dashboard?${queryParams.toString()}`);
    return response.data;
  },

  async getFinancialReport(params: ReportsQueryParams): Promise<ApiResponse<FinancialReport>> {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });

    if (params.businessId) {
      queryParams.append('businessId', params.businessId);
    }

    const response = await apiClient.get<ApiResponse<FinancialReport>>(`/api/v1/reports/financial?${queryParams.toString()}`);
    return response.data;
  },
};