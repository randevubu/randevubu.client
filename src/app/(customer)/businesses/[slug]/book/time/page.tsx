'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { businessService } from '@/src/lib/services/business';
import { staffService, StaffWithUser } from '@/src/lib/services/staff';
import { appointmentService } from '@/src/lib/services/appointments';
import { Appointment } from '@/src/types';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  currency?: string;
  isActive: boolean;
}

interface BusinessData {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  city?: string;
  state?: string;
  businessType?: {
    id: string;
    name: string;
    displayName: string;
    icon: string;
    category: string;
  };
  services?: Service[];
  businessHours?: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
      breaks: Array<{
        startTime: string;
        endTime: string;
        description: string;
      }>;
    };
  };
  settings?: {
    priceVisibility?: {
      showPriceOnBooking: boolean;
      priceDisplayMessage: string | null;
      hideAllServicePrices: boolean;
    };
  };
  timezone?: string;
  reservationSettings?: {
    maxAdvanceBookingDays: number;
    minNotificationHours: number;
    maxDailyAppointments: number;
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: AppointmentWithDetails;
  isOccupied?: boolean; // True if slot has an appointment starting at this exact time
  insufficientTime?: boolean; // True if there's not enough time before next appointment
}

interface AppointmentWithDetails {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  service: {
    id: string;
    name: string;
    duration: number;
  };
  staff: {
    id: string;
  };
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export default function TimeSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = params.slug as string;
  const serviceId = searchParams.get('serviceId');
  const staffId = searchParams.get('staffId');
  const selectedDate = searchParams.get('date');

  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffWithUser | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    if (slug && serviceId && selectedDate) {
      fetchBusinessData();
    } else {
      // Redirect back to date selection if missing parameters
      router.push(`/businesses/${slug}/book/datetime${serviceId ? `?serviceId=${serviceId}` : ''}`);
    }
  }, [slug, serviceId, staffId, selectedDate]);

  useEffect(() => {
    if (selectedService && selectedDate && business) {
      calculateAvailableSlots();
    }
  }, [selectedService, selectedDate, business]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const response = await businessService.getBusinessById(slug);
      if (response.success && response.data) {
        setBusiness(response.data as BusinessData);
        const availableServices = (response.data as BusinessData).services?.filter((s: Service) => s.isActive) || [];

        // Find the selected service
        const service = availableServices.find((s: Service) => s.id === serviceId);
        if (service) {
          setSelectedService(service);

          // Fetch staff if staffId is provided
          if (staffId) {
            await fetchSelectedStaff(response.data.id, staffId);
          }
        } else {
          // Service not found, redirect to service selection
          router.push(`/businesses/${slug}/book/service`);
        }
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedStaff = async (businessId: string, staffId: string) => {
    try {
      const response = await staffService.getBusinessStaffForBooking(businessId);
      if (response.success && response.data?.staff) {
        const staff = response.data.staff.find(s => s.id === staffId);
        if (staff) {
          setSelectedStaff(staff);
        }
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const calculateAvailableSlots = async () => {
    if (!selectedService || !selectedDate || !business) return;

    try {
      setSlotsLoading(true);
      // Use real business hours API to generate time slots
      const basicSlots = await generateBasicTimeSlots(selectedDate, selectedService, business);
      setAvailableSlots(basicSlots);
    } catch (error) {
      console.error('Error calculating available slots:', error);
      // On error, generate basic slots without appointment checking
      const basicSlots = await generateBasicTimeSlots(selectedDate, selectedService, business);
      setAvailableSlots(basicSlots);
    } finally {
      setSlotsLoading(false);
    }
  };

  const generateBasicTimeSlots = async (date: string, service: Service, business: BusinessData): Promise<TimeSlot[]> => {
    if (!business || !service) {
      console.log('No business or service data available for time slot generation');
      return [];
    }

    console.log(`Generating ALL time slots for ${date} to show both occupied and conflicting slots`);

    // Generate ALL possible time slots within business hours (15-minute intervals)
    const allSlots = generateAllTimeSlots(business, date);
    console.log(`🕐 Generated ${allSlots.length} total time slots`);

    // Fetch existing appointments
    const appointments = await fetchExistingAppointments(date, business.id);
    console.log(`📋 Found ${appointments.length} appointments for ${date}`);

    // Check each slot for availability, conflicts, and occupancy
    return await checkAllSlotsAvailability(allSlots, appointments, date, service, business);
  };

  // Generate all possible time slots within business hours (15-minute intervals)
  const generateAllTimeSlots = (business: BusinessData, date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];

    // Get business hours for the selected date
    const dayOfWeek = new Date(date).getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    const businessHours = business?.businessHours?.[dayName];

    if (!businessHours || !businessHours.isOpen) {
      console.log(`❌ Business is closed on ${dayName}`);
      return slots;
    }

    const [openHour, openMinute] = businessHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = businessHours.close.split(':').map(Number);

    // Generate 15-minute time slots from open to close
    for (let hour = openHour; hour < closeHour || (hour === closeHour && 0 < closeMinute); hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Skip if this slot would go past closing time
        if (hour === closeHour && minute >= closeMinute) {
          break;
        }

        // Skip if this slot is before opening time (for the first hour)
        if (hour === openHour && minute < openMinute) {
          continue;
        }

        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          available: true // Will be updated later based on appointments
        });
      }
    }

    console.log(`📅 Generated ${slots.length} time slots from ${businessHours.open} to ${businessHours.close}`);
    return slots;
  };

  // Check all slots for availability, conflicts, and occupancy
  const checkAllSlotsAvailability = async (
    slots: TimeSlot[],
    appointments: AppointmentWithDetails[],
    date: string,
    service: Service,
    business: BusinessData
  ): Promise<TimeSlot[]> => {
    const blockedRanges = createBlockedTimeRanges(appointments, date);

    return slots.map(slot => {
      return checkSlotAvailability(slot, date, service, blockedRanges, appointments);
    });
  };

  // Helper function to parse time to minutes since midnight (Istanbul time)
  const parseTimeToMinutes = (timeString: string): number => {
    try {
      if (timeString.includes('T')) {
        // For appointment times (ISO format), convert to Istanbul time
        const date = new Date(timeString);
        const istanbulTime = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Europe/Istanbul',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(date);

        const [hour, minute] = istanbulTime.split(':').map(Number);
        return hour * 60 + minute;
      } else {
        // For simple "HH:MM" format (time slots)
        const [hour, minute] = timeString.split(':').map(Number);
        return hour * 60 + minute;
      }
    } catch (error) {
      console.error('Error parsing time:', timeString, error);
      return 0;
    }
  };

  // Transform Appointment to AppointmentWithDetails
  const transformAppointment = (appointment: Appointment): AppointmentWithDetails => {
    return {
      id: appointment.id,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      duration: appointment.duration,
      status: appointment.status,
      service: {
        id: appointment.serviceId,
        name: 'Service', // We don't have service details in basic Appointment
        duration: appointment.duration
      },
      staff: {
        id: appointment.staffId || 'unknown'
      },
      customer: {
        id: appointment.customerId,
        firstName: '',
        lastName: ''
      }
    };
  };

  // Fetch existing appointments for the date
  const fetchExistingAppointments = async (date: string, businessId: string) => {
    try {
      const response = await appointmentService.getBusinessAppointments({
        businessId,
        startDate: date,
        endDate: date
      });

      if (response.success && response.data) {
        const appointments = Array.isArray(response.data) ? response.data : [response.data];
        // Filter out canceled appointments and map to expected format
        // Note: API already filters by date, so we assign the requested date to each appointment
        return appointments
          .filter(apt => apt.status !== 'CANCELED')
          .map(apt => ({
            id: apt.id,
            date: date, // Use the requested date since API already filtered by it
            startTime: apt.startTime,
            endTime: apt.endTime,
            duration: apt.duration,
            status: apt.status,
            service: {
              id: apt.serviceId || 'unknown',
              name: 'Service',
              duration: apt.duration
            },
            staff: { id: apt.staffId || 'unknown' },
            customer: { id: apt.customerId || 'unknown', firstName: '', lastName: '' }
          } as AppointmentWithDetails));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
    return [];
  };

  // Fallback method using the original logic
  const generateFallbackTimeSlots = async (date: string, service: Service, business: BusinessData): Promise<TimeSlot[]> => {
    const slots: TimeSlot[] = [];
    const dayOfWeek = new Date(date).getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    const businessHours = business.businessHours?.[dayName];

    if (!businessHours || !businessHours.isOpen) {
      return slots;
    }

    const openTime = businessHours.open;
    const closeTime = businessHours.close;
    const breaks = businessHours.breaks || [];

    if (!openTime || !closeTime) {
      return slots;
    }

    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    // Use service duration to determine appropriate intervals
    const interval = service.duration <= 30 ? 15 : service.duration <= 60 ? 30 : 60;

    for (let hour = openHour; hour < closeHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const slotMinutes = hour * 60 + minute;
        const serviceEndMinutes = slotMinutes + service.duration;
        const closeMinutes = closeHour * 60 + closeMinute;

        // Skip if service would run past closing time
        if (serviceEndMinutes > closeMinutes) {
          continue;
        }

        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // Check breaks
        const isDuringBreak = breaks.some(breakPeriod => {
          const [breakStartHour, breakStartMinute] = breakPeriod.startTime.split(':').map(Number);
          const [breakEndHour, breakEndMinute] = breakPeriod.endTime.split(':').map(Number);
          const breakStartMinutes = breakStartHour * 60 + breakStartMinute;
          const breakEndMinutes = breakEndHour * 60 + breakEndMinute;

          return slotMinutes < breakEndMinutes && serviceEndMinutes > breakStartMinutes;
        });

        if (!isDuringBreak) {
          slots.push({
            time: timeString,
            available: true
          });
        }
      }
    }

    return await checkAppointmentConflicts(slots, date, business);
  };

  const generateDefaultTimeSlots = (business: BusinessData, date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];

    // Get business hours for the selected date
    const dayOfWeek = new Date(date).getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    const businessHours = business?.businessHours?.[dayName];

    let openHour = 9;
    let openMinute = 0;
    let closeHour = 18;
    let closeMinute = 0;

    // Use business hours if available
    if (businessHours?.isOpen && businessHours.open && businessHours.close) {
      [openHour, openMinute] = businessHours.open.split(':').map(Number);
      [closeHour, closeMinute] = businessHours.close.split(':').map(Number);
      console.log(`📅 Using business hours for ${dayName}: ${businessHours.open} - ${businessHours.close}`);
    } else if (businessHours && !businessHours.isOpen) {
      console.log(`❌ Business is closed on ${dayName}`);
      return slots; // Return empty slots for closed days
    } else {
      console.log(`⚠️ No business hours found for ${dayName}, using default 09:00 - 18:00`);
    }

    // Generate 15-minute time slots within business hours
    for (let hour = openHour; hour < closeHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Skip if this slot would go past closing time
        if (hour === closeHour - 1 && minute + 15 > closeMinute) {
          break;
        }

        // Skip if this slot is before opening time (for the first hour)
        if (hour === openHour && minute < openMinute) {
          continue;
        }

        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          available: true
        });
      }
    }

    console.log(`🕐 Generated ${slots.length} default time slots from ${openHour.toString().padStart(2, '0')}:${openMinute.toString().padStart(2, '0')} to ${closeHour.toString().padStart(2, '0')}:${closeMinute.toString().padStart(2, '0')}`);
    return slots;
  };

  const generateDefaultTimeSlotsWithAppointments = async (date: string, business: BusinessData): Promise<TimeSlot[]> => {
    const slots = generateDefaultTimeSlots(business, date);
    return await checkAppointmentConflicts(slots, date, business);
  };

  const checkAppointmentConflicts = async (slots: TimeSlot[], date: string, business: BusinessData): Promise<TimeSlot[]> => {
    try {
      // Fetch appointments for the selected date
      const response = await appointmentService.getBusinessAppointments({
        businessId: business.id,
        startDate: date,
        endDate: date
      });

      if (response.success && response.data) {
        // Handle the API response structure and filter out canceled appointments
        const allAppointments = Array.isArray(response.data) ? response.data : [response.data];
        const appointments = allAppointments
          .filter(apt => apt.status !== 'CANCELED')
          .map(apt => ({
            id: apt.id,
            date: apt.date,
            startTime: apt.startTime,
            endTime: apt.endTime,
            duration: apt.duration,
            status: apt.status,
            service: {
              id: apt.serviceId,
              name: 'Service',
              duration: apt.duration
            },
            staff: { id: apt.staffId || 'unknown' },
            customer: { id: apt.customerId, firstName: '', lastName: '' }
          } as AppointmentWithDetails));
        console.log(`🔍 Found ${appointments.length} confirmed appointments for ${date} (filtered out canceled):`);
        appointments.forEach((apt, index) => {
          console.log(`📋 Appointment ${index + 1}:`, {
            id: apt.id,
            date: apt.date,
            startTime: apt.startTime,
            endTime: apt.endTime,
            duration: apt.duration,
            status: apt.status,
            service: apt.service?.name
          });
        });

        // Create blocked time ranges for efficient lookup
        const blockedRanges = createBlockedTimeRanges(appointments, date);
        console.log('Blocked time ranges:', blockedRanges);

        // Check each slot for service duration availability
        return slots.map(slot => {
          const slotResult = checkSlotAvailability(slot, date, selectedService, blockedRanges, appointments);
          console.log(`📊 Slot ${slot.time} processed: available=${slotResult.available}, has appointment=${!!slotResult.appointment}`);
          return slotResult;
        });
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }

    // Return original slots if appointment fetching fails
    return slots;
  };

  // Create blocked time ranges in Istanbul timezone
  const createBlockedTimeRanges = (appointments: AppointmentWithDetails[], date: string) => {
    const ranges: Array<{ start: Date; end: Date; appointment: AppointmentWithDetails }> = [];

    appointments.forEach(appointment => {
      try {
        // API already filtered by date, so all appointments are for the requested date
        // Convert appointment times to Istanbul time for comparison
        const appointmentStart = createIstanbulTimeSlot(date, appointment.startTime);
        const appointmentEnd = appointment.endTime ?
          createIstanbulTimeSlot(date, appointment.endTime) :
          new Date(appointmentStart.getTime() + (appointment.duration || 60) * 60000);

        console.log(`📋 Appointment: ${appointment.startTime} - ${appointment.endTime || 'calculated'}`);
        console.log(`📋 Istanbul time: ${appointmentStart.toLocaleString('tr-TR')} - ${appointmentEnd.toLocaleString('tr-TR')}`);

        // No buffer time - appointments can be scheduled back-to-back
        ranges.push({
          start: appointmentStart,
          end: appointmentEnd,
          appointment
        });
      } catch (error) {
        console.error('Error parsing appointment for blocked ranges:', error, appointment);
      }
    });

    // Sort ranges by start time for efficient checking
    return ranges.sort((a, b) => a.start.getTime() - b.start.getTime());
  };

  // Check if a slot can accommodate the full service duration
  const checkSlotAvailability = (
    slot: TimeSlot,
    date: string,
    service: Service | null,
    blockedRanges: Array<{ start: Date; end: Date; appointment: AppointmentWithDetails }>,
    appointments: AppointmentWithDetails[]
  ): TimeSlot => {
    if (!service) return slot;

    const slotStartMinutes = parseTimeToMinutes(slot.time);
    const serviceDuration = service.duration || 60;
    const serviceEndMinutes = slotStartMinutes + serviceDuration;

    console.log(`🔍 Checking slot ${slot.time} (${slotStartMinutes}-${serviceEndMinutes} min) for ${serviceDuration} min service`);

    // Check if this slot falls within any existing appointment's duration
    const overlappingAppointment = appointments.find(apt => {
      // API already filtered by date, so no need to check date again
      // Just check if this slot time falls within the appointment's time range
      const appointmentStartMinutes = parseTimeToMinutes(apt.startTime);
      const appointmentEndMinutes = appointmentStartMinutes + apt.duration;

      console.log(`  🔍 Checking overlap: slot ${slotStartMinutes} vs appointment ${appointmentStartMinutes}-${appointmentEndMinutes}`);
      
      // The slot is occupied if it's within the appointment's time range
      return slotStartMinutes >= appointmentStartMinutes && slotStartMinutes < appointmentEndMinutes;
    });

    // If this slot falls within an appointment's duration, mark as occupied
    if (overlappingAppointment) {
      console.log(`🚫 Slot ${slot.time} is occupied by appointment (${overlappingAppointment.startTime})`);
      return {
        ...slot,
        available: false,
        appointment: overlappingAppointment,
        isOccupied: true
      };
    }

    // Check if service would extend beyond business hours
    const slotStart = createIstanbulTimeSlot(date, slot.time);
    const serviceEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
    const exceedsBusinessHours = checkBusinessHoursBoundary(serviceEnd, date);

    if (exceedsBusinessHours) {
      console.log(`❌ Service would extend beyond business hours`);
      return {
        ...slot,
        available: false
      };
    }

    // SIMPLIFIED LOGIC: Only check if service would extend INTO the next appointment
    // Find the NEAREST next appointment after this slot
    const nextAppointments = appointments
      .filter(apt => {
        // API already filtered by date, so just check if appointment starts after this slot
        const appointmentStartMinutes = parseTimeToMinutes(apt.startTime);
        // Only consider appointments that start after this slot
        return appointmentStartMinutes > slotStartMinutes;
      })
      .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

    const nextAppointment = nextAppointments[0]; // Get the closest next appointment

    if (nextAppointment) {
      const nextAppointmentStartMinutes = parseTimeToMinutes(nextAppointment.startTime);

      console.log(`  📅 Next appointment starts at ${nextAppointmentStartMinutes} min`);
      console.log(`  📅 Service would end at ${serviceEndMinutes} min`);

      // Check if service would extend past the start of the next appointment
      if (serviceEndMinutes > nextAppointmentStartMinutes) {
        console.log(`  ❌ Insufficient time: service needs ${serviceDuration}min but only ${nextAppointmentStartMinutes - slotStartMinutes}min available`);
        return {
          ...slot,
          available: false,
          appointment: nextAppointment,
          isOccupied: false,
          insufficientTime: true // Flag for "Yetersiz Süre"
        };
      }
    }

    console.log(`  ✅ Slot ${slot.time} is available`);
    return slot;
  };

  // Convert appointment time to Istanbul time for display and comparison
  const convertToIstanbulTime = (dateTimeString: string): Date => {
    try {
      const date = new Date(dateTimeString);

      // Get Istanbul time components using Intl API
      const istanbulFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Istanbul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const formatted = istanbulFormatter.format(date);
      const istanbulTime = new Date(formatted.replace(', ', 'T'));

      console.log(`🕐 Converting ${dateTimeString} to Istanbul: ${istanbulTime.toLocaleString('tr-TR')}`);
      return istanbulTime;
    } catch (error) {
      console.error('Error converting to Istanbul time:', error);
      return new Date(dateTimeString);
    }
  };

  // Create a time slot in Istanbul timezone
  const createIstanbulTimeSlot = (date: string, time: string): Date => {
    try {
      // Create a date object for the slot in local time (assumed to be Istanbul)
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);

      // Create date object (this will be in local time)
      const slotTime = new Date(year, month - 1, day, hour, minute);

      console.log(`🕐 Creating Istanbul slot: ${date} ${time} -> ${slotTime.toLocaleString('tr-TR')}`);

      return slotTime;
    } catch (error) {
      console.error('Error creating Istanbul time slot:', error);
      return new Date(`${date}T${time}:00`);
    }
  };

  // Check if service would extend beyond business closing time
  const checkBusinessHoursBoundary = (serviceEnd: Date, date: string): boolean => {
    if (!business?.businessHours) {
      console.log(`⚠️ No business hours defined, using default 18:00 closing time`);
      // If no business hours defined, allow until 18:00 (6 PM)
      const defaultCloseTime = createIstanbulTimeSlot(date, '18:00');
      return serviceEnd > defaultCloseTime;
    }

    try {
      const dayOfWeek = new Date(date).getDay();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[dayOfWeek];
      const businessHours = business.businessHours[dayName];

      if (!businessHours?.isOpen) {
        console.log(`❌ Business is closed on ${dayName}`);
        return true; // Closed day
      }

      if (!businessHours.close) {
        console.log(`⚠️ No closing time defined for ${dayName}, using default 18:00`);
        const defaultCloseTime = createIstanbulTimeSlot(date, '18:00');
        return serviceEnd > defaultCloseTime;
      }

      // Create business closing time in Istanbul time (no conversion needed)
      const [closeHour, closeMinute] = businessHours.close.split(':').map(Number);
      const closeTime = `${closeHour.toString().padStart(2, '0')}:${closeMinute.toString().padStart(2, '0')}`;
      const businessClose = createIstanbulTimeSlot(date, closeTime);

      console.log(`⏰ Business closes at ${businessClose.toLocaleString('tr-TR')}, service ends at ${serviceEnd.toLocaleString('tr-TR')}`);
      return serviceEnd > businessClose;
    } catch (error) {
      console.error('Error checking business hours boundary:', error);
      return false;
    }
  };

  const isTimeSlotInPast = (date: string, timeSlot: string) => {
    const now = new Date();

    // Create a date object for the selected time slot
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = timeSlot.split(':').map(Number);
    const slotDateTime = new Date(year, month - 1, day, hour, minute);

    // Calculate minimum booking time based on minNotificationHours
    const minHours = business?.reservationSettings?.minNotificationHours || 0;
    const minBookingTime = new Date(now.getTime() + (minHours * 60 * 60 * 1000));

    // Slot is in the past if it's before the minimum booking time
    return slotDateTime <= minBookingTime;
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    // Navigate to confirmation page
    const params = new URLSearchParams({
      serviceId: serviceId!,
      ...(staffId && { staffId }),
      date: selectedDate!,
      time
    });
    router.push(`/businesses/${slug}/book/confirm?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-[var(--theme-card)] rounded-xl shadow-lg border border-[var(--theme-border)] overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-[var(--theme-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[var(--theme-foregroundSecondary)]">Yükleniyor...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business || !selectedService || !selectedDate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--theme-foreground)] mb-4">Bilgiler Eksik</h2>
          <p className="text-[var(--theme-foregroundSecondary)] mb-6">Gerekli bilgiler bulunamadı.</p>
          <button
            onClick={() => router.push(`/businesses/${slug}/book/datetime${serviceId ? `?serviceId=${serviceId}` : ''}`)}
            className="bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] px-6 py-3 rounded-lg font-semibold hover:bg-[var(--theme-primaryHover)] transition-colors"
          >
            Tarih Seçin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--theme-primary)]/3 via-[var(--theme-background)] to-[var(--theme-accent)]/3">
      {/* Navigation Header */}
      <div className="sticky top-0 z-10 bg-[var(--theme-background)]/90 backdrop-blur-xl border-b border-[var(--theme-border)]/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/businesses/${slug}/book/datetime?serviceId=${serviceId}${staffId ? `&staffId=${staffId}` : ''}`)}
              className="flex items-center text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Geri
            </button>

            <h1 className="text-lg font-semibold text-[var(--theme-foreground)]">
              Saat Seçin
            </h1>

            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Time Selection */}
        <div className="bg-[var(--theme-card)] rounded-2xl shadow-xl border border-[var(--theme-border)] overflow-hidden">
          
          <div className="overflow-y-auto h-[calc(100vh-300px)]">
            {slotsLoading ? (
              <div className="space-y-1">
                {[...Array(24)].map((_, index) => {
                  const isHourStart = index % 4 === 0;
                  return (
                    <div
                      key={index}
                      className={`flex items-stretch ${isHourStart ? 'border-b-2 border-[var(--theme-border)]' : 'border-b border-[var(--theme-border)]/50'
                        }`}
                      style={{ minHeight: '40px' }}
                    >
                      <div className="w-16 px-3 py-2 bg-[var(--theme-backgroundSecondary)] border-r border-[var(--theme-border)] flex-shrink-0 animate-pulse"></div>
                      <div className="flex-1 p-3 bg-[var(--theme-backgroundSecondary)] animate-pulse"></div>
                    </div>
                  );
                })}
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="space-y-1">
                {availableSlots.map((slot) => {
                  const isHourStart = slot.time.endsWith(':00');
                  const isPast = isTimeSlotInPast(selectedDate, slot.time);
                  const isDisabled = !slot.available || isPast;

                  return (
                    <div
                      key={slot.time}
                      className={`flex items-stretch ${isHourStart ? 'border-b-2 border-[var(--theme-border)]' : 'border-b border-[var(--theme-border)]/50'
                        }`}
                      style={{ minHeight: '40px' }}
                    >
                      {/* Time Column */}
                      <div className={`w-16 px-3 py-2 text-xs font-medium text-[var(--theme-foregroundSecondary)] bg-[var(--theme-backgroundSecondary)] border-r border-[var(--theme-border)] flex items-center flex-shrink-0 ${isHourStart ? 'font-semibold' : ''
                        }`}>
                        {slot.time}
                      </div>

                      {/* Slot Column */}
                      <div className="flex-1 min-w-0 relative">
                        <button
                          onClick={() => !isDisabled && handleTimeSelect(slot.time)}
                          disabled={isDisabled}
                          className={`w-full h-full p-3 text-left transition-all duration-200 ${isDisabled
                            ? 'bg-[var(--theme-secondary)] text-[var(--theme-foregroundMuted)] cursor-not-allowed opacity-50'
                            : selectedTime === slot.time
                              ? 'bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] font-semibold'
                              : 'bg-[var(--theme-background)] text-[var(--theme-foreground)] hover:bg-[var(--theme-backgroundSecondary)] cursor-pointer'
                            }`}
                        >
                          {isPast ? (
                            <span className="text-sm">
                              {business?.reservationSettings?.minNotificationHours && business.reservationSettings.minNotificationHours > 0
                                ? `En az ${business.reservationSettings.minNotificationHours} saat önceden rezervasyon gerekli`
                                : 'Geçmiş Tarihe Randevu Alınamaz'}
                            </span>
                          ) : !slot.available && slot.isOccupied && slot.appointment ? (
                            <div className="text-sm">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="font-medium">Dolu</span>
                              </div>
                            </div>
                          ) : !slot.available && slot.insufficientTime && slot.appointment ? (
                            <div className="text-sm">
                              <div className="flex items-center justify-between space-x-2">
                                <div className='flex items-center space-x-2'>
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <span className="font-medium">Yetersiz Süre</span>
                                </div>
                                {selectedService && (
                                  <span className="text-xs text-[var(--theme-foregroundMuted)]">
                                    {selectedService.duration} dk gerekli
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[var(--theme-foregroundMuted)] mt-1">
                                Sonraki randevuya kadar yeterli süre yok
                              </div>
                            </div>
                          ) : !slot.available ? (
                            <div className="text-sm">
                              <div className="flex items-center justify-between space-x-2">
                                <div className='flex items-center space-x-2'>
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <span className="font-medium">Yetersiz Süre</span>
                                </div>
                                {selectedService && (
                                  <span className="text-xs text-[var(--theme-foregroundMuted)]">
                                    {selectedService.duration} dk gerekli
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[var(--theme-foregroundMuted)] mt-1">
                                Hizmet saatlere sığmıyor
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm">
                              <div className="flex items-center justify-between space-x-2">
                                <div className='flex items-center space-x-2'>
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>Müsait</span>
                                </div>
                                {selectedService && (
                                  <div className="flex flex-col items-end text-xs text-[var(--theme-foregroundMuted)]">
                                    <span>{selectedService.duration} dk</span>
                                    <span>
                                      {(() => {
                                        const [hour, minute] = slot.time.split(':').map(Number);
                                        const endMinutes = hour * 60 + minute + selectedService.duration;
                                        const endHour = Math.floor(endMinutes / 60);
                                        const endMinute = endMinutes % 60;
                                        return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')} bitiş`;
                                      })()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-[var(--theme-foregroundMuted)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[var(--theme-foregroundSecondary)] text-lg">Seçilen tarih için müsait saat bulunmuyor</p>
                <p className="text-[var(--theme-foregroundMuted)] text-sm mt-2">
                  {business?.businessHours && (() => {
                    const dateObj = new Date(selectedDate);
                    const dayOfWeek = dateObj.getDay();
                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    const dayName = dayNames[dayOfWeek];
                    const businessHours = business.businessHours[dayName];

                    if (!businessHours || !businessHours.isOpen) {
                      return 'Bu gün işletme kapalı. Lütfen başka bir tarih seçin.';
                    } else {
                      return 'Lütfen başka bir tarih seçmeyi deneyin.';
                    }
                  })()}
                </p>
                <button
                  onClick={() => router.push(`/businesses/${slug}/book/datetime?serviceId=${serviceId}${staffId ? `&staffId=${staffId}` : ''}`)}
                  className="mt-4 px-4 py-2 bg-[var(--theme-primary)] text-[var(--theme-primaryForeground)] rounded-lg text-sm font-semibold hover:bg-[var(--theme-primaryHover)] transition-colors"
                >
                  Tarih Değiştir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}