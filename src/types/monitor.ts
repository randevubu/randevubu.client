import { Appointment } from './appointment';

export interface MonitorAppointment {
  appointment: Appointment;
  room?: string;
  estimatedStartTime?: string;
  estimatedEndTime?: string;
  waitTimeMinutes?: number;
  position?: number;
  startedAt?: string;
}

export interface MonitorStats {
  completedToday: number;
  inProgress: number;
  waiting: number;
  averageWaitTime: number;
  averageServiceTime: number;
  totalScheduled: number;
}

export interface MonitorAppointmentsResponse {
  success: boolean;
  data: {
    // Current appointment being served
    current: MonitorAppointment | null;
    
    // Next appointment in queue
    next: MonitorAppointment | null;
    
    // Waiting queue (upcoming appointments)
    queue: MonitorAppointment[];
    
    // Daily statistics
    stats: MonitorStats;
    
    // Metadata
    lastUpdated: string;
    businessInfo: {
      name: string;
      timezone: string;
    };
  };
  error?: {
    message: string;
    code: string;
  };
}

export interface MonitorAppointmentsParams {
  businessId: string;
  date?: string; // YYYY-MM-DD format, defaults to today
  includeStats?: boolean; // defaults to true
  maxQueueSize?: number; // defaults to 10
}
