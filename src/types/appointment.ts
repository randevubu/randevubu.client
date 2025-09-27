import { AppointmentStatus } from './enums';

export interface Appointment {
  id: string;
  businessId: string;
  serviceId: string;
  staffId?: string;
  customerId: string;
  date: string | Date;  // Business date - can be YYYY-MM-DD string or Date object
  startTime: Date;
  endTime: Date;
  duration: number;
  status: AppointmentStatus;
  price: number;
  currency: string;
  customerNotes?: string;
  internalNotes?: string;
  bookedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  canceledAt?: Date;
  cancelReason?: string;
  reminderSent: boolean;
  reminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentData {
  businessId: string;
  serviceId: string;
  staffId?: string;
  date: Date;
  startTime: Date;
  customerNotes?: string;
}

export interface UpdateAppointmentData {
  date?: Date;
  startTime?: Date;
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
  dateFrom?: Date;
  dateTo?: Date;
}

export interface AvailabilitySlot {
  startTime: Date;
  endTime: Date;
  staffId?: string;
}

export interface AvailabilityRequest {
  businessId: string;
  serviceId: string;
  date: Date;
  staffId?: string;
}