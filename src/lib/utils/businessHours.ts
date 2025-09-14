/**
 * Business Hours Utilities
 * Handles business hours calculations locally to avoid unnecessary API calls
 */

interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    breaks: Array<{
      startTime: string;
      endTime: string;
      description: string;
    }>;
    isOpen: boolean;
  };
}

interface Business {
  id: string;
  businessHours?: BusinessHours;
  timezone?: string;
}

/**
 * Get day name from date (in business timezone)
 */
export function getDayNameFromDate(date: string, timezone: string = 'UTC'): string {
  const dateObj = new Date(date + 'T12:00:00'); // Add noon time to avoid timezone edge cases

  // Get the day in the business timezone using Intl.DateTimeFormat
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: timezone
  });
  const dayName = formatter.format(dateObj).toLowerCase();

  // Map to our day names format
  const dayMap: { [key: string]: string } = {
    'sunday': 'sunday',
    'monday': 'monday',
    'tuesday': 'tuesday',
    'wednesday': 'wednesday',
    'thursday': 'thursday',
    'friday': 'friday',
    'saturday': 'saturday'
  };

  return dayMap[dayName] || dayName;
}

/**
 * Check if business is open on a specific date using local business hours data
 */
export function isBusinessOpenOnDate(business: Business, date: string): boolean {
  if (!business.businessHours) {
    console.warn('No business hours data available');
    return false;
  }

  const dayName = getDayNameFromDate(date, business.timezone);
  const dayHours = business.businessHours[dayName];
  
  if (!dayHours) {
    console.warn(`No hours found for ${dayName}`);
    return false;
  }

  return dayHours.isOpen;
}

/**
 * Get business hours for a specific date
 */
export function getBusinessHoursForDate(business: Business, date: string): {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  breaks?: Array<{
    startTime: string;
    endTime: string;
    description: string;
  }>;
  dayName: string;
} {
  if (!business.businessHours) {
    return {
      isOpen: false,
      dayName: getDayNameFromDate(date, business.timezone)
    };
  }

  const dayName = getDayNameFromDate(date, business.timezone);
  const dayHours = business.businessHours[dayName];
  
  if (!dayHours) {
    return {
      isOpen: false,
      dayName
    };
  }

  return {
    isOpen: dayHours.isOpen,
    openTime: dayHours.isOpen ? dayHours.open : undefined,
    closeTime: dayHours.isOpen ? dayHours.close : undefined,
    breaks: dayHours.breaks || [],
    dayName
  };
}

/**
 * Generate disabled dates for calendar (next 14 days)
 */
export function getDisabledDates(business: Business, daysAhead: number = 14): string[] {
  const disabledDates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < daysAhead; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    const dateString = checkDate.toISOString().split('T')[0];
    
    if (!isBusinessOpenOnDate(business, dateString)) {
      disabledDates.push(dateString);
    }
  }
  
  return disabledDates;
}

/**
 * Generate time slots for a specific date with service duration consideration
 */
export function generateTimeSlots(business: Business, date: string, serviceDuration: number = 60): Array<{
  time: string;
  available: boolean;
}> {
  const slots: Array<{ time: string; available: boolean; }> = [];
  const hours = getBusinessHoursForDate(business, date);

  if (!hours.isOpen || !hours.openTime || !hours.closeTime) {
    return slots;
  }

  return generateServiceAwareTimeSlots(
    hours.openTime,
    hours.closeTime,
    serviceDuration,
    hours.breaks || []
  );
}

/**
 * Generate time slots with proper service duration awareness and industry standards
 */
export function generateServiceAwareTimeSlots(
  openTime: string,
  closeTime: string,
  serviceDuration: number,
  breaks: Array<{ startTime: string; endTime: string; description: string }> = []
): Array<{ time: string; available: boolean }> {
  const slots: Array<{ time: string; available: boolean }> = [];

  // Parse business hours
  const [openHour, openMinute] = openTime.split(':').map(Number);
  const [closeHour, closeMinute] = closeTime.split(':').map(Number);

  // Calculate total business minutes
  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  // Industry standard: Determine appropriate slot interval based on service duration
  const slotInterval = calculateOptimalSlotInterval(serviceDuration);

  // Generate time slots with service duration awareness
  for (let minutes = openMinutes; minutes < closeMinutes; minutes += slotInterval) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    // Check if service would fit within business hours
    const serviceEndMinutes = minutes + serviceDuration;

    if (serviceEndMinutes > closeMinutes) {
      break; // Service would run past closing time - no buffer needed for end-of-day
    }

    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // Check if service duration conflicts with any breaks
    const conflictsWithBreak = breaks.some(breakPeriod => {
      const [breakStartHour, breakStartMinute] = breakPeriod.startTime.split(':').map(Number);
      const [breakEndHour, breakEndMinute] = breakPeriod.endTime.split(':').map(Number);
      const breakStartMinutes = breakStartHour * 60 + breakStartMinute;
      const breakEndMinutes = breakEndHour * 60 + breakEndMinute;

      // Check if service overlaps with break
      return (
        (minutes < breakEndMinutes && serviceEndMinutes > breakStartMinutes) ||
        (minutes >= breakStartMinutes && minutes < breakEndMinutes)
      );
    });

    if (!conflictsWithBreak) {
      slots.push({
        time: timeString,
        available: true
      });
    }
  }

  return slots;
}

/**
 * Calculate optimal time slot interval based on service duration (industry standard)
 */
export function calculateOptimalSlotInterval(serviceDuration: number): number {
  if (serviceDuration <= 30) return 15; // 15-minute intervals for short services
  if (serviceDuration <= 60) return 30; // 30-minute intervals for 1-hour services
  if (serviceDuration <= 120) return 60; // 1-hour intervals for 2-hour services
  return Math.max(60, Math.floor(serviceDuration / 2)); // Larger intervals for long services
}

/**
 * Filter available slots based on existing appointments and service duration
 * Ensures that services cannot be booked if they would overlap with existing appointments
 */
export function filterSlotsForServiceDuration(
  slots: Array<{ time: string; available: boolean }>,
  serviceDuration: number,
  existingAppointments: Array<{
    startTime: string;
    endTime?: string;
    duration?: number;
  }>,
  date: string
): Array<{ time: string; available: boolean; conflictReason?: string }> {
  console.log(`🔍 Filtering ${slots.length} slots for ${serviceDuration}min service on ${date}`);
  console.log(`📋 Existing appointments:`, existingAppointments.map(apt => ({
    start: apt.startTime,
    end: apt.endTime,
    duration: apt.duration
  })));

  return slots.map(slot => {
    const [hour, minute] = slot.time.split(':').map(Number);
    const slotStartMinutes = hour * 60 + minute;
    const slotEndMinutes = slotStartMinutes + serviceDuration;

    console.log(`🕐 Checking slot ${slot.time} (${slotStartMinutes}-${slotEndMinutes}min)`);

    // Check for conflicts with existing appointments
    const conflictingAppointment = existingAppointments.find(appointment => {
      console.log(`  🔍 Checking appointment:`, appointment);
      const appointmentStart = parseTimeToMinutes(appointment.startTime);
      const appointmentEnd = appointment.endTime
        ? parseTimeToMinutes(appointment.endTime)
        : appointmentStart + (appointment.duration || 60);

      console.log(`  🔍 Parsed appointment: ${appointmentStart}min - ${appointmentEnd}min`);

      // Check if the new service would overlap with existing appointment
      // Service cannot extend into an existing appointment
      // Only allow if service ends exactly when appointment starts OR starts exactly when appointment ends
      const wouldOverlap = slotStartMinutes < appointmentEnd && slotEndMinutes > appointmentStart;

      // Allow back-to-back: service can end exactly when appointment starts
      const endsExactlyWhenAppointmentStarts = slotEndMinutes === appointmentStart;
      // Allow back-to-back: service can start exactly when appointment ends
      const startsExactlyWhenAppointmentEnds = slotStartMinutes === appointmentEnd;

      const hasOverlap = wouldOverlap && !endsExactlyWhenAppointmentStarts && !startsExactlyWhenAppointmentEnds;

      console.log(`  📊 Service ${slotStartMinutes}-${slotEndMinutes}min vs Appointment ${appointmentStart}-${appointmentEnd}min`);
      console.log(`  📊 Would overlap: ${wouldOverlap}, Ends exactly when starts: ${endsExactlyWhenAppointmentStarts}, Starts when ends: ${startsExactlyWhenAppointmentEnds}`);
      console.log(`  📊 Final result: ${hasOverlap ? '❌ CONFLICT' : '✅ OK'}`);

      return hasOverlap;
    });

    const hasConflict = !!conflictingAppointment;

    console.log(`  🎯 Slot ${slot.time} result: ${hasConflict ? '❌ BLOCKED' : '✅ AVAILABLE'}`);

    return {
      ...slot,
      available: slot.available && !hasConflict,
      conflictReason: hasConflict ? 'appointment-conflict' : undefined
    };
  });
}

/**
 * Parse time string to minutes since midnight in Istanbul timezone
 * All times are handled in Istanbul timezone - no UTC conversion
 */
function parseTimeToMinutes(timeString: string): number {
  try {
    // Handle both "HH:MM" and ISO datetime formats
    if (timeString.includes('T')) {
      // For ISO datetime strings (appointments from database)
      // Create date in Istanbul timezone using Intl API
      const date = new Date(timeString);

      // Convert to Istanbul time using Intl.DateTimeFormat
      const istanbulTime = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Istanbul',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);

      const [hour, minute] = istanbulTime.split(':').map(Number);
      const minutes = hour * 60 + minute;

      console.log(`📊 Parsing appointment time: ${timeString}`);
      console.log(`📊 Istanbul time: ${istanbulTime} (${minutes} minutes)`);

      return minutes;
    } else {
      // For "HH:MM" format (local time slots)
      const [hour, minute] = timeString.split(':').map(Number);
      return hour * 60 + minute;
    }
  } catch (error) {
    console.error('Error parsing time:', timeString, error);
    return 0;
  }
}

/**
 * When to use the API vs local data:
 * - Use LOCAL DATA for: standard weekly business hours, calendar disabled dates, basic time slot generation
 * - Use API for: temporary closures, holiday overrides, real-time availability, appointment conflicts
 */
export function shouldUseAPI(checkType: 'standard-hours' | 'overrides' | 'real-time-availability'): boolean {
  return checkType !== 'standard-hours';
}