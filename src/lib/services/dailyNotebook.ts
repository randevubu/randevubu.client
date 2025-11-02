import { apiClient } from "../api";

export interface RevenueColumn {
  id: string;
  businessId: string;
  name: string;
  type: 'income' | 'expense';
  priority: 'high' | 'medium' | 'low';
  visible: boolean;
  sortOrder: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DayData {
  [columnId: string]: number;
}

export interface MonthlyData {
  [day: number]: DayData;
}

export interface DailyNotebook {
  id: string;
  businessId: string;
  year: number;
  month: number;
  columns: RevenueColumn[];
  monthlyData: MonthlyData;
  appointmentRevenue: MonthlyData;
  totals: {
    dailyTotals: { [day: number]: number };
    columnTotals: { [columnId: string]: number };
    grandTotal: number;
    incomeTotal: number;
    expenseTotal: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRevenueColumnRequest {
  name: string;
  type: 'income' | 'expense';
  priority?: 'high' | 'medium' | 'low';
  visible?: boolean;
  sortOrder?: number;
}

export interface UpdateRevenueColumnRequest {
  name?: string;
  type?: 'income' | 'expense';
  priority?: 'high' | 'medium' | 'low';
  visible?: boolean;
  sortOrder?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  message?: string;
}

class DailyNotebookService {
  private baseUrl = '/api/v1/businesses';

  // Get or create daily notebook for a specific month
  async getDailyNotebook(businessId: string, year: number, month: number): Promise<ApiResponse<DailyNotebook>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${businessId}/daily-notebook/${year}/${month}`);
      // Backend returns { success, data: { notebook } }, we need to extract notebook
      if (response.data.success && response.data.data?.notebook) {
        const notebook: DailyNotebook = response.data.data.notebook;

        // Ensure columns are ordered by sortOrder (system column first)
        const sortedColumns = [...notebook.columns].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        // Transform appointmentRevenue shape from { day: amount } to { day: { [appointmentsColumnId]: amount } }
        let transformedAppointmentRevenue = notebook.appointmentRevenue;
        if (notebook.appointmentRevenue && typeof notebook.appointmentRevenue === 'object') {
          const appointmentsColumn = sortedColumns.find(c => c.isSystem && c.name === 'Randevular');
          if (appointmentsColumn) {
            const mapped: MonthlyData = {} as MonthlyData;
            Object.entries(notebook.appointmentRevenue || {}).forEach(([dayStr, amount]) => {
              const dayNum = parseInt(dayStr, 10);
              if (!Number.isNaN(dayNum)) {
                mapped[dayNum] = { [appointmentsColumn.id]: Number(amount || 0) };
              }
            });
            transformedAppointmentRevenue = mapped;
          }
        }

        return {
          success: true,
          data: {
            ...notebook,
            columns: sortedColumns,
            appointmentRevenue: transformedAppointmentRevenue
          }
        };
      }
      return {
        success: false,
        error: response.data.message || 'Günlük defter yüklenirken hata oluştu'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Günlük defter yüklenirken hata oluştu'
      };
    }
  }

  // Create daily notebook for a specific month
  async createDailyNotebook(businessId: string, year: number, month: number): Promise<ApiResponse<DailyNotebook>> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${businessId}/daily-notebook/${year}/${month}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Günlük defter oluşturulurken hata oluştu'
      };
    }
  }

  // Update daily entries (bulk)
  async updateDailyEntries(
    businessId: string, 
    year: number, 
    month: number, 
    entries: { [day: number]: { [columnId: string]: number } }
  ): Promise<ApiResponse<DailyNotebook>> {
    try {
      const response = await apiClient.put(
        `${this.baseUrl}/${businessId}/daily-notebook/${year}/${month}/entries`,
        { entries }
      );
      
      if (response.data.success && response.data.data?.notebook) {
        return {
          success: true,
          data: response.data.data.notebook
        };
      }
      return {
        success: false,
        error: response.data.message || 'Günlük defter güncellenirken hata oluştu'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Günlük defter güncellenirken hata oluştu'
      };
    }
  }

  // Update single entry
  async updateSingleEntry(
    businessId: string,
    year: number,
    month: number,
    day: number,
    columnId: string,
    amount: number,
    note?: string
  ): Promise<ApiResponse<DailyNotebook>> {
    try {
      const response = await apiClient.patch(
        `${this.baseUrl}/${businessId}/daily-notebook/${year}/${month}/entries/single`,
        {
          day,
          columnId,
          amount,
          note
        }
      );
      
      if (response.data.success && response.data.data?.notebook) {
        return {
          success: true,
          data: response.data.data.notebook
        };
      }
      return {
        success: false,
        error: response.data.message || 'Giriş güncellenirken hata oluştu'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Giriş güncellenirken hata oluştu'
      };
    }
  }

  // Get revenue columns
  async getRevenueColumns(businessId: string): Promise<ApiResponse<RevenueColumn[]>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${businessId}/revenue-columns`);
      
      if (response.data.success && response.data.data?.columns) {
        return {
          success: true,
          data: response.data.data.columns
        };
      }
      return {
        success: false,
        error: response.data.message || 'Sütunlar yüklenirken hata oluştu'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Sütunlar yüklenirken hata oluştu'
      };
    }
  }

  // Create revenue column
  async createRevenueColumn(businessId: string, columnData: CreateRevenueColumnRequest): Promise<ApiResponse<RevenueColumn>> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/${businessId}/revenue-columns`, columnData);
      
      if (response.data.success && response.data.data?.column) {
        return {
          success: true,
          data: response.data.data.column
        };
      }
      return {
        success: false,
        error: response.data.message || 'Sütun oluşturulurken hata oluştu'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Sütun oluşturulurken hata oluştu'
      };
    }
  }

  // Update revenue column
  async updateRevenueColumn(businessId: string, columnId: string, columnData: UpdateRevenueColumnRequest): Promise<ApiResponse<RevenueColumn>> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${businessId}/revenue-columns/${columnId}`, columnData);
      
      if (response.data.success && response.data.data?.column) {
        return {
          success: true,
          data: response.data.data.column
        };
      }
      return {
        success: false,
        error: response.data.message || 'Sütun güncellenirken hata oluştu'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Sütun güncellenirken hata oluştu'
      };
    }
  }

  // Delete revenue column
  async deleteRevenueColumn(businessId: string, columnId: string): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${businessId}/revenue-columns/${columnId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: null
        };
      }
      return {
        success: false,
        error: response.data.message || 'Sütun silinirken hata oluştu'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Sütun silinirken hata oluştu'
      };
    }
  }

  // Get appointment revenue
  async getAppointmentRevenue(businessId: string, year: number, month: number): Promise<ApiResponse<{ [day: number]: number }>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${businessId}/appointment-revenue/${year}/${month}`);
      
      if (response.data.success && response.data.data?.appointmentRevenue) {
        // Transform from { "1": 1200, "2": 1800 } to { 1: 1200, 2: 1800 }
        const transformed: { [day: number]: number } = {};
        Object.entries(response.data.data.appointmentRevenue).forEach(([dayStr, amount]) => {
          const dayNum = parseInt(dayStr, 10);
          if (!Number.isNaN(dayNum)) {
            transformed[dayNum] = Number(amount || 0);
          }
        });
        
        return {
          success: true,
          data: transformed
        };
      }
      return {
        success: false,
        error: response.data.message || 'Randevu geliri yüklenirken hata oluştu'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Randevu geliri yüklenirken hata oluştu'
      };
    }
  }
}

export const dailyNotebookService = new DailyNotebookService();
