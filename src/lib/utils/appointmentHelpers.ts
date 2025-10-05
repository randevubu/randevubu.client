import { Appointment, AppointmentStatus } from '../../types';
import { Business } from '../../types/business';
import { getBusinessHoursForDate } from './businessHours';

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

// Get appointment status color for UI (badge style)
export function getStatusColorBadge(status: AppointmentStatus): string {
  switch (status) {
    case AppointmentStatus.PENDING:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-600';
    case AppointmentStatus.CONFIRMED:
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
    case AppointmentStatus.IN_PROGRESS:
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
    case AppointmentStatus.COMPLETED:
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
    case AppointmentStatus.CANCELED:
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
    case AppointmentStatus.NO_SHOW:
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-600';
  }
}

// Alias for consistency with appointments page
export const getStatusColor = getStatusColorBadge;

// Get appointment status text in Turkish
export function getStatusTextTurkish(status: AppointmentStatus): string {
  switch (status) {
    case AppointmentStatus.PENDING:
      return 'Bekliyor';
    case AppointmentStatus.CONFIRMED:
      return 'Onaylandı';
    case AppointmentStatus.IN_PROGRESS:
      return 'Devam Ediyor';
    case AppointmentStatus.COMPLETED:
      return 'Tamamlandı';
    case AppointmentStatus.CANCELED:
      return 'İptal Edildi';
    case AppointmentStatus.NO_SHOW:
      return 'Gelmedi';
    default:
      return status;
  }
}

// Alias for consistency with appointments page
export const getStatusText = getStatusTextTurkish;

export function getStatusIcon(status: AppointmentStatus): string {
  switch (status) {
    case AppointmentStatus.PENDING:
      return '⏳';
    case AppointmentStatus.CONFIRMED:
      return '✅';
    case AppointmentStatus.IN_PROGRESS:
      return '🔄';
    case AppointmentStatus.COMPLETED:
      return '✔️';
    case AppointmentStatus.CANCELED:
      return '❌';
    case AppointmentStatus.NO_SHOW:
      return '👻';
    default:
      return '❓';
  }
}

// Check if appointment is urgent (within next hour)
export function isUrgent(appointment: Appointment): boolean {
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}`);
  const startTime = appointmentDateTime.getTime();
  const now = Date.now();
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

  return startTime - now <= oneHour && startTime > now;
}

// Check if appointment is today
export function isToday(appointment: Appointment): boolean {
  const appointmentDate = new Date(appointment.date);
  const today = new Date();
  
  return appointmentDate.toDateString() === today.toDateString();
}

// Calculate time until appointment
export function getTimeUntilAppointment(appointment: Appointment): number {
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}`);
  const startTime = appointmentDateTime.getTime();
  const now = Date.now();
  return Math.max(0, startTime - now);
}

// Format date
export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format time
export function formatTime(time: Date | string): string {
  // If it's already a time string like "16:00", return it as is
  if (typeof time === 'string' && time.match(/^\d{2}:\d{2}$/)) {
    return time;
  }

  // Otherwise, treat it as a full datetime and format it
  const dateObj = typeof time === 'string' ? new Date(time) : time;

  // Convert to Istanbul timezone
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(dateObj);
}

// Generate time slots
export function generateTimeSlots(selectedDate: string, business: Business | null): string[] {
  if (!business?.businessHours) {
    const slots = [];
    for (let hour = 8; hour < 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:15`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
      slots.push(`${hour.toString().padStart(2, '0')}:45`);
    }
    return slots;
  }

  const businessHours = getBusinessHoursForDate(business, selectedDate);

  if (!businessHours.isOpen || !businessHours.openTime || !businessHours.closeTime) {
    return [];
  }

  const slots = [];
  const [openHour, openMinute] = businessHours.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = businessHours.closeTime.split(':').map(Number);

  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  for (let minutes = openMinutes; minutes < closeMinutes; minutes += 15) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    const isInBreak = businessHours.breaks?.some(breakPeriod => {
      const [breakStartHour, breakStartMinute] = breakPeriod.startTime.split(':').map(Number);
      const [breakEndHour, breakEndMinute] = breakPeriod.endTime.split(':').map(Number);
      const breakStartMinutes = breakStartHour * 60 + breakStartMinute;
      const breakEndMinutes = breakEndHour * 60 + breakEndMinute;
      return minutes >= breakStartMinutes && minutes < breakEndMinutes;
    });

    if (!isInBreak) {
      slots.push(timeString);
    }
  }

  return slots;
}

// Check if time slot is in past
export function isTimeSlotInPast(date: string, timeSlot: string): boolean {
  const now = new Date();
  const [hour, minute] = timeSlot.split(':').map(Number);
  const slotDateTime = new Date(date + 'T00:00:00');
  slotDateTime.setHours(hour, minute, 0, 0);

  return slotDateTime < now;
}

// Parse time to minutes
export function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// Get slot color
export function getSlotColor(appointment: Appointment | null): string {
  if (!appointment) {
    return 'bg-[var(--theme-card)] border-l-4 border-l-[var(--theme-border)]';
  }

  switch (appointment.status) {
    case AppointmentStatus.PENDING:
      return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-l-4 border-l-gray-500 shadow-sm';
    case AppointmentStatus.CONFIRMED:
      return 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-l-4 border-l-green-500 shadow-sm';
    case AppointmentStatus.IN_PROGRESS:
      return 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-l-4 border-l-green-500 shadow-sm';
    case AppointmentStatus.COMPLETED:
      return 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-l-4 border-l-blue-500 shadow-sm';
    case AppointmentStatus.CANCELED:
      return 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-l-4 border-l-red-500 shadow-sm';
    case AppointmentStatus.NO_SHOW:
      return 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-l-4 border-l-red-500 shadow-sm';
    default:
      return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-l-4 border-l-gray-500 shadow-sm';
  }
}

// Get service name
export function getServiceName(appointment: any): string {
  return appointment.service?.name || 'Hizmet bulunamadı';
}

// Get customer display name
export function getCustomerDisplayName(appointment: any): string {
  const customer = appointment.customer;
  if (customer?.firstName && customer?.lastName) {
    return `${customer.firstName} ${customer.lastName}`;
  } else if (customer?.firstName) {
    return customer.firstName;
  } else if (customer?.phoneNumber) {
    return customer.phoneNumber;
  }
  return 'Misafir';
}

// Get customer phone number
export function getCustomerPhoneNumber(appointment: any): string | null {
  return appointment.customer?.phoneNumber || null;
}

// Get appointments for date
export function getAppointmentsForDate(appointments: Appointment[], date: string): Appointment[] {
  if (!appointments || !Array.isArray(appointments)) {
    return [];
  }
  return appointments.filter(apt => apt.date === date);
}

// Get slot appointment
export function getSlotAppointment(appointments: Appointment[], selectedDate: string, timeSlot: string) {
  const dayAppointments = getAppointmentsForDate(appointments, selectedDate);

  const startingAppointment = dayAppointments.find(apt => {
    const startTime = formatTime(apt.startTime);
    return startTime === timeSlot;
  });

  if (startingAppointment) {
    const durationInMinutes = startingAppointment.duration;
    const slotsToSpan = Math.ceil(durationInMinutes / 15);

    return {
      appointment: startingAppointment,
      type: 'start',
      slotsToSpan: slotsToSpan
    };
  }

  const occupyingAppointment = dayAppointments.find(apt => {
    const startTime = new Date(apt.startTime);
    const endTime = new Date(apt.endTime);
    const slotTime = new Date(apt.startTime);
    const [hour, minute] = timeSlot.split(':').map(Number);
    slotTime.setHours(hour, minute, 0, 0);

    return startTime <= slotTime && slotTime < endTime;
  });

  if (occupyingAppointment) {
    return {
      appointment: occupyingAppointment,
      type: 'continue'
    };
  }

  return { type: 'empty' };
}

// Check if appointment in slot
export function hasAppointmentInSlot(appointments: Appointment[], selectedDate: string, timeSlot: string): boolean {
  const dayAppointments = getAppointmentsForDate(appointments, selectedDate);

  return dayAppointments.some(apt => {
    const appointmentStart = formatTime(apt.startTime);
    const appointmentDuration = apt.duration;
    const slotStartTime = parseTime(timeSlot);
    const appointmentStartTime = parseTime(appointmentStart);
    const appointmentEndTime = appointmentStartTime + appointmentDuration;

    return slotStartTime >= appointmentStartTime && slotStartTime < appointmentEndTime;
  });
}

// Closure helper functions
export function getClosureTypeText(type: string): string {
  switch (type) {
    case 'VACATION':
      return 'Tatil';
    case 'SICK_LEAVE':
      return 'Hastalık İzni';
    case 'MAINTENANCE':
      return 'Bakım';
    case 'EMERGENCY':
      return 'Acil Durum';
    case 'OTHER':
      return 'Diğer';
    default:
      return type;
  }
}

export function getClosureTimeStatus(closure: any): 'future' | 'current' | 'past' {
  const now = new Date();
  const closureStart = new Date(closure.startDate);
  const closureEnd = new Date(closure.endDate);

  if (now < closureStart) {
    return 'future';
  } else if (now >= closureStart && now <= closureEnd) {
    return 'current';
  } else {
    return 'past';
  }
}

export function getClosureDisplayInfo(closure: any) {
  const timeStatus = getClosureTimeStatus(closure);
  const isActive = closure.isActive;

  const canEdit = timeStatus === 'future' && isActive;

  let statusText = '';
  let statusColor = '';

  if (!isActive) {
    statusText = 'Devre Dışı';
    statusColor = 'bg-gray-100 text-gray-600';
  } else {
    switch (timeStatus) {
      case 'future':
        statusText = 'Planlanmış';
        statusColor = 'bg-blue-100 text-blue-800';
        break;
      case 'current':
        statusText = 'Aktif';
        statusColor = 'bg-red-100 text-red-800';
        break;
      case 'past':
        statusText = 'Tamamlandı';
        statusColor = 'bg-gray-100 text-gray-600';
        break;
    }
  }

  return {
    canEdit,
    statusText,
    statusColor,
    timeStatus,
    editabilityText: canEdit ? 'Düzenlenebilir' : 'Düzenlenemez'
  };
}

export function formatClosureDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const isSameDay = start.toDateString() === end.toDateString();

  if (isSameDay) {
    const startTime = start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    if (startTime === endTime || (startTime === '00:00' && endTime === '23:59')) {
      return start.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: start.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    } else {
      return `${start.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: start.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      })} ${startTime}-${endTime}`;
    }
  } else {
    return `${start.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: start.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })} - ${end.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: end.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })}`;
  }
}

export function getClosuresForDate(closures: any[], date: string): any[] {
  return closures.filter(closure => {
    const closureStart = new Date(closure.startDate);
    const closureEnd = new Date(closure.endDate);

    const dayStart = new Date(date + 'T00:00:00+03:00');
    const dayEnd = new Date(date + 'T23:59:59.999+03:00');

    const overlaps = (closureStart < dayEnd && closureEnd > dayStart);

    return overlaps;
  });
}

export function isTimeSlotClosed(closures: any[], date: string, timeSlot: string): boolean {
  const dayClosures = getClosuresForDate(closures, date);

  return dayClosures.some(closure => {
    if (!closure.isActive) return false;

    const closureStart = new Date(closure.startDate);
    const closureEnd = new Date(closure.endDate);

    const [hour, minute] = timeSlot.split(':').map(Number);
    const slotTime = new Date(date + 'T00:00:00');
    slotTime.setHours(hour, minute, 0, 0);

    const slotTimeUTC = new Date(slotTime.getTime() - (slotTime.getTimezoneOffset() * 60000));

    return slotTimeUTC >= closureStart && slotTimeUTC < closureEnd;
  });
}

export function getSlotClosure(closures: any[], date: string, timeSlot: string): any | undefined {
  const dayClosures = getClosuresForDate(closures, date);

  return dayClosures.find(closure => {
    if (!closure.isActive) return false;

    const closureStart = new Date(closure.startDate);
    const closureEnd = new Date(closure.endDate);

    const [hour, minute] = timeSlot.split(':').map(Number);
    const slotTime = new Date(date + 'T00:00:00');
    slotTime.setHours(hour, minute, 0, 0);

    const slotTimeUTC = new Date(slotTime.getTime() - (slotTime.getTimezoneOffset() * 60000));

    return slotTimeUTC >= closureStart && slotTimeUTC < closureEnd;
  });
}