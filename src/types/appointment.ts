import { AppointmentStatus } from './enums';

export interface Appointment {
  id: string;
  businessId: string;
  serviceId: string;
  staffId?: string;
  customerId: string;
  date: string;  // Business date in YYYY-MM-DD format
  startTime: string;  // Time in HH:MM format
  endTime: string;    // Time in HH:MM format
  duration: number;
  status: AppointmentStatus;
  customer: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }
  price: number;
  currency: string;
  customerNotes?: string;
  internalNotes?: string;
  bookedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  cancelReason?: string;
  reminderSent: boolean;
  reminderSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  id: string;
  businessId: string;
  staffId?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  breaks?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  businessId: string;
  serviceId: string;
  staffId?: string;
  date: string;
  startTime: string;
  customerNotes?: string;
}

export interface UpdateAppointmentData {
  date?: string;
  startTime?: string;
  status?: AppointmentStatus;
  customerNotes?: string;
  internalNotes?: string;
  cancelReason?: string;
}

export interface CreateWorkingHoursData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breaks?: Record<string, any>;
  staffId?: string;
}

export interface UpdateWorkingHoursData {
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
  breaks?: Record<string, any>;
}

export interface AppointmentSearchFilters {
  businessId?: string;
  serviceId?: string;
  staffId?: string;
  customerId?: string;
  status?: AppointmentStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  staffId?: string;
}

export interface AvailabilityRequest {
  businessId: string;
  serviceId: string;
  date: string;
  staffId?: string;
}