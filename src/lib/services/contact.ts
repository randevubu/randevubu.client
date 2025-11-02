import { apiClient } from '../api';
import { extractErrorMessage, extractApiError, isAxiosError } from '../utils/errorExtractor';

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data?: {
    messageId: string;
  };
  error?: {
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

class ContactService {
  /**
   * Submit contact form
   * Sends a contact form message to the backend
   */
  async submitContactForm(data: ContactFormData): Promise<ContactResponse> {
    try {
      const response = await apiClient.post<ContactResponse>(
        '/api/v1/contact',
        data
      );

      return response.data;
    } catch (error: unknown) {
      // Use backend's translated error message if available
      const axiosError = isAxiosError(error);
      
      // Handle validation errors - return response data
      if (axiosError && error.response?.status === 400) {
        return error.response.data;
      }

      // Handle rate limiting
      if (axiosError && error.response?.status === 429) {
        const errorMessage = extractErrorMessage(error, 'RATE_LIMIT_EXCEEDED');
        throw new Error(errorMessage);
      }

      // Handle network errors
      if (error instanceof TypeError || (axiosError && (error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED'))) {
        const errorMessage = extractErrorMessage(error, 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.');
        throw new Error(errorMessage);
      }

      // Handle other errors - use backend message or return response data
      if (axiosError && error.response?.data) {
        // If response has error structure, throw with backend message
        const apiError = extractApiError(error);
        if (apiError?.message) {
          throw new Error(apiError.message);
        }
        return error.response.data;
      }

      // Final fallback
      const errorMessage = extractErrorMessage(error, 'İstek başarısız oldu');
      throw new Error(errorMessage);
    }
  }
}

export const contactService = new ContactService();




