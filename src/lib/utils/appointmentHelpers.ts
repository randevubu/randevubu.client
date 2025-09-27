import { Appointment } from '../../types';

// Format time until appointment for display
export function formatTimeUntil(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}g ${hours % 24}s`; // days and hours
  }
  if (hours > 0) {
    return `${hours}s ${minutes % 60}d`; // hours and minutes
  }
  if (minutes > 0) {
    return `${minutes}d`; // minutes
  }
  return 'Şimdi'; // now
}

// Format appointment time for display
export function formatAppointmentTime(startTime: string, endTime?: string): string {
  const start = new Date(startTime);
  const startStr = start.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (endTime) {
    const end = new Date(endTime);
    const endStr = end.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${startStr} - ${endStr}`;
  }

  return startStr;
}

// Format appointment date for display
export function formatAppointmentDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check if it's today
  if (date.toDateString() === today.toDateString()) {
    return 'Bugün';
  }

  // Check if it's tomorrow
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Yarın';
  }

  // Otherwise return formatted date
  return date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Get appointment status color for UI
export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-100';
    case 'CONFIRMED':
      return 'text-green-600 bg-green-100';
    case 'CANCELLED':
      return 'text-red-600 bg-red-100';
    case 'COMPLETED':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Get appointment status text in Turkish
export function getStatusText(status: string): string {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'Beklemede';
    case 'CONFIRMED':
      return 'Onaylandı';
    case 'CANCELLED':
      return 'İptal Edildi';
    case 'COMPLETED':
      return 'Tamamlandı';
    default:
      return 'Bilinmiyor';
  }
}

// Check if appointment is urgent (within next hour)
export function isUrgent(appointment: Appointment): boolean {
  const appointmentDate = appointment.date instanceof Date ? appointment.date : new Date(appointment.date);
  const startTime = new Date(appointmentDate.toISOString().split('T')[0] + 'T' + appointment.startTime.toISOString().split('T')[1]).getTime();
  const now = Date.now();
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

  return startTime - now <= oneHour && startTime > now;
}

// Check if appointment is today
export function isToday(appointment: Appointment): boolean {
  const appointmentDate = appointment.date instanceof Date ? appointment.date : new Date(appointment.date);
  const today = new Date();
  
  return appointmentDate.toDateString() === today.toDateString();
}

// Calculate time until appointment
export function getTimeUntilAppointment(appointment: Appointment): number {
  const appointmentDate = appointment.date instanceof Date ? appointment.date : new Date(appointment.date);
  const startTime = new Date(appointmentDate.toISOString().split('T')[0] + 'T' + appointment.startTime.toISOString().split('T')[1]).getTime();
  const now = Date.now();
  return Math.max(0, startTime - now);
}